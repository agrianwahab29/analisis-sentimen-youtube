#!/usr/bin/env python3
"""
VidSense AI - Training Pipeline for IndoBERT
Training model sentiment analysis dengan dataset gabungan

Platform: Google Colab (FREE GPU)
Model: indobenchmark/indobert-base-p2
Dataset: Unified dataset dari collect_datasets.py

Author: VidSense AI
Date: 2024
"""

import os
import json
import torch
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
from tqdm.notebook import tqdm
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Transformers
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
    DataCollatorWithPadding,
)
from datasets import Dataset, DatasetDict

# Setup
MODEL_NAME = "indobenchmark/indobert-base-p2"
MAX_LENGTH = 256
BATCH_SIZE = 32
EPOCHS = 5
LEARNING_RATE = 2e-5
OUTPUT_DIR = "./vidsense_sentiment_model"

# Label mapping
LABEL2ID = {"negative": 0, "neutral": 1, "positive": 2}
ID2LABEL = {v: k for k, v in LABEL2ID.items()}


def load_unified_dataset(dataset_path: str = "../dataset/merged") -> DatasetDict:
    """
    Load unified dataset hasil merging
    """
    print("📚 Loading unified dataset...")

    splits = {}

    for split in ["train", "validation", "test"]:
        file_path = Path(dataset_path) / f"{split}.json"

        if not file_path.exists():
            print(f"⚠️  {file_path} not found, skipping...")
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Filter valid samples
        valid_data = [
            {
                "text": item["text"],
                "label": LABEL2ID.get(item["label"], 1),  # default neutral
            }
            for item in data
            if item.get("text") and item.get("label") in LABEL2ID
        ]

        splits[split] = Dataset.from_list(valid_data)
        print(f"  ✅ {split}: {len(valid_data)} samples")

    return DatasetDict(splits)


def preprocess_function(examples, tokenizer):
    """
    Tokenize dataset
    """
    return tokenizer(
        examples["text"], truncation=True, padding=True, max_length=MAX_LENGTH
    )


def compute_metrics(eval_pred) -> Dict:
    """
    Compute metrics untuk evaluation
    """
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)

    # Classification report
    report = classification_report(
        labels,
        predictions,
        target_names=["negative", "neutral", "positive"],
        output_dict=True,
    )

    return {
        "accuracy": report["accuracy"],
        "f1_macro": report["macro avg"]["f1-score"],
        "f1_weighted": report["weighted avg"]["f1-score"],
        "precision": report["weighted avg"]["precision"],
        "recall": report["weighted avg"]["recall"],
    }


def plot_confusion_matrix(y_true, y_pred, save_path="confusion_matrix.png"):
    """
    Plot confusion matrix
    """
    cm = confusion_matrix(y_true, y_pred)
    labels = ["negative", "neutral", "positive"]

    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels
    )
    plt.title("Confusion Matrix")
    plt.ylabel("True Label")
    plt.xlabel("Predicted Label")
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    print(f"💾 Confusion matrix saved to {save_path}")


def train_model(dataset: DatasetDict) -> str:
    """
    Main training function
    """
    print("\n" + "=" * 60)
    print("🚀 TRAINING INDOBERT FOR SENTIMENT ANALYSIS")
    print("=" * 60)

    # 1. Load tokenizer and model
    print("\n📥 Loading model and tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=3, id2label=ID2LABEL, label2id=LABEL2ID
    )

    # 2. Tokenize dataset
    print("\n🔤 Tokenizing dataset...")
    tokenized_datasets = dataset.map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=["text"],
    )

    # 3. Training arguments
    print("\n⚙️  Setting up training...")
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        learning_rate=LEARNING_RATE,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE * 2,
        num_train_epochs=EPOCHS,
        weight_decay=0.01,
        # Evaluation
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1_macro",
        greater_is_better=True,
        # Logging
        logging_dir=f"{OUTPUT_DIR}/logs",
        logging_strategy="steps",
        logging_steps=50,
        report_to="tensorboard",
        # Optimization
        fp16=torch.cuda.is_available(),  # Use mixed precision if GPU available
        dataloader_num_workers=2,
        # Reproducibility
        seed=42,
    )

    # 4. Data collator
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

    # 5. Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets.get("validation", tokenized_datasets["train"]),
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
    )

    # 6. Train
    print("\n🏃 Starting training...")
    print("⏰ This will take ~30-60 minutes on T4 GPU")
    print("-" * 60)

    trainer.train()

    # 7. Evaluate on test set
    print("\n📊 Evaluating on test set...")
    if "test" in tokenized_datasets:
        test_results = trainer.evaluate(tokenized_datasets["test"])
        print("\n🎯 Test Results:")
        for key, value in test_results.items():
            print(f"  {key}: {value:.4f}")

    # 8. Plot confusion matrix
    print("\n📈 Generating confusion matrix...")
    predictions_output = trainer.predict(
        tokenized_datasets.get("test", tokenized_datasets["train"])
    )
    y_pred = np.argmax(predictions_output.predictions, axis=1)
    y_true = predictions_output.label_ids

    plot_confusion_matrix(y_true, y_pred)

    # 9. Save model
    print(f"\n💾 Saving model to {OUTPUT_DIR}...")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    # 10. Save training info
    info = {
        "model_name": MODEL_NAME,
        "num_epochs": EPOCHS,
        "learning_rate": LEARNING_RATE,
        "batch_size": BATCH_SIZE,
        "max_length": MAX_LENGTH,
        "final_metrics": test_results if "test" in tokenized_datasets else {},
        "dataset_stats": {split: len(dataset[split]) for split in dataset.keys()},
    }

    with open(f"{OUTPUT_DIR}/training_info.json", "w") as f:
        json.dump(info, f, indent=2)

    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print(f"📁 Model saved to: {OUTPUT_DIR}")
    print("=" * 60)

    return OUTPUT_DIR


def upload_to_huggingface(
    model_path: str, repo_name: str = "vidsense-indonesian-sentiment"
):
    """
    Upload trained model to HuggingFace Hub
    """
    from huggingface_hub import HfApi
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    print(f"\n📤 Uploading to HuggingFace Hub: {repo_name}...")

    try:
        # Load model
        model = AutoModelForSequenceClassification.from_pretrained(model_path)
        tokenizer = AutoTokenizer.from_pretrained(model_path)

        # Push to hub
        model.push_to_hub(repo_name)
        tokenizer.push_to_hub(repo_name)

        print(f"✅ Model uploaded successfully!")
        print(f"🔗 URL: https://huggingface.co/{repo_name}")

    except Exception as e:
        print(f"❌ Upload failed: {e}")
        print("💡 Make sure you've run: huggingface-cli login")


def test_model(model_path: str):
    """
    Test model dengan sample sentences
    """
    from transformers import pipeline

    print("\n🧪 Testing model...")

    # Load pipeline
    classifier = pipeline("sentiment-analysis", model=model_path, tokenizer=model_path)

    # Test samples
    test_sentences = [
        "Produk ini sangat bagus dan berkualitas",  # Positive
        "Saya kecewa dengan pelayanannya",  # Negative
        "Biasa saja, tidak ada yang spesial",  # Neutral
        "Mantap jiwa, recommended banget!",  # Positive
        "Jelek banget, jangan beli",  # Negative
    ]

    print("\n📝 Test Results:")
    for sentence in test_sentences:
        result = classifier(sentence)[0]
        print(f"  Text: {sentence}")
        print(f"  → {result['label']} (confidence: {result['score']:.3f})")
        print()


def main():
    """
    Main training pipeline
    """
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║    VIDSENSE AI - INDOBERT TRAINING PIPELINE               ║
    ║    Fine-tuning untuk Sentiment Analysis Bahasa Indonesia  ║
    ╚═══════════════════════════════════════════════════════════╝
    """)

    # Check GPU
    if torch.cuda.is_available():
        print(f"🎮 GPU detected: {torch.cuda.get_device_name(0)}")
        print(
            f"💾 GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB"
        )
    else:
        print("⚠️  No GPU detected. Training will be slow!")
        print("💡 Recommended: Use Google Colab with GPU runtime")

    # Load dataset
    dataset = load_unified_dataset()

    if not dataset:
        print("❌ No dataset found!")
        print("💡 Run collect_datasets.py first")
        return

    # Train
    model_path = train_model(dataset)

    # Test
    test_model(model_path)

    # Optional: Upload to HuggingFace
    # upload_to_huggingface(model_path)

    print("\n" + "=" * 60)
    print("🎉 All done! Model ready for deployment.")
    print("=" * 60)


if __name__ == "__main__":
    main()
