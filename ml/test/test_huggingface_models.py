#!/usr/bin/env python3
"""
VidSense AI - HuggingFace Integration Tester
Test semua HuggingFace models untuk sentiment analysis Bahasa Indonesia

Usage:
    python test_huggingface_models.py

Output:
    - Accuracy report untuk setiap model
    - Latency comparison
    - Best model recommendation
"""

import requests
import time
import json
from typing import List, Dict, Tuple
from concurrent.futures import ThreadPoolExecutor
import statistics

# Test samples
TEST_SAMPLES = [
    {"text": "Produk ini sangat bagus dan berkualitas", "expected": "positive"},
    {"text": "Saya sangat kecewa dengan layanannya", "expected": "negative"},
    {"text": "Biasa saja, tidak ada yang spesial", "expected": "neutral"},
    {"text": "Mantap jiwa! Recommended banget!", "expected": "positive"},
    {"text": "Jelek banget, jangan beli", "expected": "negative"},
    {"text": "Lumayan lah untuk harga segini", "expected": "neutral"},
    {"text": "Sangat membantu, terima kasih banyak!", "expected": "positive"},
    {"text": "Tidak sesuai ekspektasi, parah", "expected": "negative"},
    {"text": "Oke lah standar", "expected": "neutral"},
    {"text": "Top markotop! Sukses terus!", "expected": "positive"},
]

# Models to test
MODELS = {
    "IndoBERT Base": "indobenchmark/indobert-base-p2",
    "IndoBERT Sentiment": "mdhugol/indonesia-bert-sentiment-classification",
    # "XLM-RoBERTa": "xlm-roberta-base",  # Uncomment untuk test multilingual
}

HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models"


def test_model(model_id: str, samples: List[Dict]) -> Dict:
    """
    Test satu model dengan sample data
    """
    print(f"\n🧪 Testing model: {model_id}")

    results = []
    latencies = []

    for i, sample in enumerate(samples):
        try:
            start_time = time.time()

            response = requests.post(
                f"{HUGGINGFACE_API_URL}/{model_id}",
                headers={"Content-Type": "application/json"},
                json={"inputs": sample["text"]},
                timeout=30,
            )

            latency = (time.time() - start_time) * 1000  # Convert to ms
            latencies.append(latency)

            if response.status_code == 200:
                result = response.json()

                # Map HuggingFace labels ke standard labels
                predicted_label = map_label(
                    result[0]["label"]
                    if isinstance(result, list)
                    else result.get("label", "")
                )

                results.append(
                    {
                        "text": sample["text"],
                        "expected": sample["expected"],
                        "predicted": predicted_label,
                        "confidence": result[0].get("score", 0)
                        if isinstance(result, list)
                        else result.get("score", 0),
                        "latency": latency,
                        "correct": predicted_label == sample["expected"],
                    }
                )

                print(
                    f"  ✓ Sample {i + 1}: {predicted_label} (confidence: {results[-1]['confidence']:.2f}, latency: {latency:.0f}ms)"
                )

            elif response.status_code == 503:
                # Model warming up
                print(f"  ⏳ Sample {i + 1}: Model warming up...")
                time.sleep(20)  # Wait for model to warm up
                i -= 1  # Retry this sample

            else:
                print(f"  ❌ Sample {i + 1}: API error {response.status_code}")
                results.append(
                    {
                        "text": sample["text"],
                        "expected": sample["expected"],
                        "predicted": "error",
                        "confidence": 0,
                        "latency": latency,
                        "correct": False,
                    }
                )

        except Exception as e:
            print(f"  ❌ Sample {i + 1}: Exception - {str(e)}")
            results.append(
                {
                    "text": sample["text"],
                    "expected": sample["expected"],
                    "predicted": "error",
                    "confidence": 0,
                    "latency": 0,
                    "correct": False,
                }
            )

        # Rate limiting
        time.sleep(1)

    return {"model": model_id, "results": results, "latencies": latencies}


def map_label(hf_label: str) -> str:
    """
    Map HuggingFace labels ke standard sentiment labels
    """
    label_map = {
        "LABEL_0": "negative",
        "LABEL_1": "neutral",
        "LABEL_2": "positive",
        "negative": "negative",
        "neutral": "neutral",
        "positive": "positive",
        "NEGATIVE": "negative",
        "NEUTRAL": "neutral",
        "POSITIVE": "positive",
    }

    return label_map.get(hf_label, "neutral")


def calculate_metrics(test_results: Dict) -> Dict:
    """
    Calculate accuracy, precision, recall, F1-score
    """
    results = test_results["results"]
    latencies = test_results["latencies"]

    # Basic metrics
    total = len(results)
    correct = sum(1 for r in results if r["correct"])
    accuracy = correct / total if total > 0 else 0

    # Confusion matrix
    labels = ["positive", "negative", "neutral"]
    confusion = {label: {l: 0 for l in labels} for label in labels}

    for r in results:
        if r["predicted"] in labels and r["expected"] in labels:
            confusion[r["expected"]][r["predicted"]] += 1

    # Per-class metrics
    per_class = {}
    for label in labels:
        tp = confusion[label][label]
        fp = sum(confusion[l][label] for l in labels if l != label)
        fn = sum(confusion[label][l] for l in labels if l != label)
        tn = sum(
            confusion[l1][l2]
            for l1 in labels
            for l2 in labels
            if l1 != label and l2 != label
        )

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = (
            2 * (precision * recall) / (precision + recall)
            if (precision + recall) > 0
            else 0
        )

        per_class[label] = {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "support": tp + fn,
        }

    # Latency metrics
    avg_latency = statistics.mean(latencies) if latencies else 0
    median_latency = statistics.median(latencies) if latencies else 0
    max_latency = max(latencies) if latencies else 0
    min_latency = min(latencies) if latencies else 0

    return {
        "model": test_results["model"],
        "total_samples": total,
        "correct": correct,
        "accuracy": accuracy,
        "confusion_matrix": confusion,
        "per_class": per_class,
        "latency": {
            "avg": avg_latency,
            "median": median_latency,
            "min": min_latency,
            "max": max_latency,
        },
    }


def print_report(metrics: Dict):
    """
    Print formatted report
    """
    print("\n" + "=" * 60)
    print(f"📊 TEST REPORT: {metrics['model']}")
    print("=" * 60)

    print(f"\n✅ OVERALL ACCURACY: {metrics['accuracy']:.1%}")
    print(f"📈 Correct: {metrics['correct']}/{metrics['total_samples']}")

    print("\n📊 Per-Class Metrics:")
    print(
        f"{'Label':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support'}"
    )
    print("-" * 60)
    for label, scores in metrics["per_class"].items():
        print(
            f"{label:<12} {scores['precision']:<12.3f} {scores['recall']:<12.3f} "
            f"{scores['f1']:<12.3f} {scores['support']}"
        )

    print("\n⏱️  Latency Metrics:")
    print(f"  Average: {metrics['latency']['avg']:.1f}ms")
    print(f"  Median:  {metrics['latency']['median']:.1f}ms")
    print(f"  Min:     {metrics['latency']['min']:.1f}ms")
    print(f"  Max:     {metrics['latency']['max']:.1f}ms")

    print("\n📝 Confusion Matrix:")
    print(f"{'':12} {'Pred +':<8} {'Pred -':<8} {'Pred N':<8}")
    print("-" * 40)
    for true_label in ["positive", "negative", "neutral"]:
        row = metrics["confusion_matrix"][true_label]
        print(
            f"{'True ' + true_label[0].upper():<12} {row['positive']:<8} "
            f"{row['negative']:<8} {row['neutral']:<8}"
        )

    print("\n" + "=" * 60)


def main():
    """
    Main testing function
    """
    print("=" * 60)
    print("🤗 HUGGINGFACE MODEL TESTER FOR VIDSENSE AI")
    print("=" * 60)
    print(f"\n📋 Testing {len(TEST_SAMPLES)} samples on {len(MODELS)} models...")

    all_results = []

    # Test each model
    for model_name, model_id in MODELS.items():
        test_results = test_model(model_id, TEST_SAMPLES)
        metrics = calculate_metrics(test_results)
        print_report(metrics)
        all_results.append(metrics)

    # Summary comparison
    print("\n" + "=" * 60)
    print("🏆 MODEL COMPARISON SUMMARY")
    print("=" * 60)
    print(f"{'Model':<35} {'Accuracy':<12} {'Avg Latency':<15}")
    print("-" * 60)

    for result in all_results:
        print(
            f"{result['model']:<35} {result['accuracy']:<12.1%} "
            f"{result['latency']['avg']:<15.1f}ms"
        )

    # Recommendation
    best_model = max(all_results, key=lambda x: x["accuracy"])
    print(f"\n✨ RECOMMENDED MODEL: {best_model['model']}")
    print(f"   Accuracy: {best_model['accuracy']:.1%}")
    print(f"   Latency: {best_model['latency']['avg']:.1f}ms (avg)")

    # Save results
    output_file = "huggingface_test_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Detailed results saved to: {output_file}")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    # Check if running in interactive mode
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print(__doc__)
        sys.exit(0)

    print("🚀 Starting HuggingFace model testing...")
    print("⏳ This may take 2-5 minutes depending on API response time\n")

    main()
