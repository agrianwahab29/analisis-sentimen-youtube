import type { Sentiment } from "./sentiment";
import { withRetry, classifyHuggingFaceError } from "@/lib/error-handling";

interface HuggingFaceResponse {
  label: string;
  score: number;
}

export interface SentimentResult {
  text: string;
  sentiment: Sentiment;
  confidence: number;
}

// Model config - bisa ganti dengan model custom yang sudah di-train
const HUGGINGFACE_MODEL = "indobenchmark/indobert-base-p2-finetuned-sentiment";
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

/**
 * Analyze sentiment using HuggingFace Inference API with retry mechanism
 * FREE tier: 30k input tokens/minute
 * With token: Higher rate limits and reliability
 */
export async function analyzeSentimentHuggingFace(text: string): Promise<SentimentResult> {
  return withRetry(
    async () => {
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add HF token for higher rate limits
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN || ""}`
        },
        body: JSON.stringify({ inputs: text }),
      });

      if (!response.ok) {
        const error = new Error(`HuggingFace API error: ${response.status}`);
        (error as any).statusCode = response.status;
        throw error;
      }

      const result = await response.json() as HuggingFaceResponse[];
      
      // Map HuggingFace labels ke Sentiment
      const labelMap: Record<string, Sentiment> = {
        "LABEL_0": "negative",
        "LABEL_1": "neutral", 
        "LABEL_2": "positive",
        "negative": "negative",
        "neutral": "neutral",
        "positive": "positive",
      };

      const sentiment = labelMap[result[0]?.label] || "neutral";
      const confidence = result[0]?.score || 0.5;

      return {
        text,
        sentiment,
        confidence,
      };
    },
    {
      maxRetries: 3,
      baseDelay: 1000, // Reduced from 2000 for faster retry
      maxDelay: 8000,  // Reduced from 15000 for faster recovery
      backoffMultiplier: 2,
    },
    classifyHuggingFaceError
  ).catch((error) => {
    console.error("HuggingFace API failed after retries:", error);
    // Fallback ke keyword-based
    return analyzeSentimentKeyword(text);
  });
}

/**
 * Analyze batch dengan HuggingFace
 * Process in chunks untuk menghindari rate limit
 * Optimized: batch size 32, parallel batch processing (5 concurrent)
 */
export async function analyzeSentimentBatch(texts: string[]): Promise<SentimentResult[]> {
  const batchSize = 32; // HuggingFace free tier: 30k tokens/min, ~20 tokens/sentence → safe
  const PARALLEL_BATCHES = 5; // Process 5 batches concurrently

  // Split texts into batches
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push(texts.slice(i, i + batchSize));
  }

  // Process batches in parallel chunks of PARALLEL_BATCHES
  const allResults: SentimentResult[] = [];

  for (let chunkStart = 0; chunkStart < batches.length; chunkStart += PARALLEL_BATCHES) {
    const chunk = batches.slice(chunkStart, chunkStart + PARALLEL_BATCHES);

    const chunkResults = await Promise.all(
      chunk.map(async (batch) => {
        const batchResults: SentimentResult[] = [];
        try {
          // Process all texts in this batch using HuggingFace API in parallel
          const hfResults = await Promise.all(
            batch.map(text => analyzeSentimentHuggingFace(text))
          );
          batchResults.push(...hfResults);
        } catch (error) {
          // Fallback ke keyword-based for entire batch
          console.log("HuggingFace unavailable, using keyword fallback");
          const fallbackResults = batch.map(text => analyzeSentimentKeyword(text));
          batchResults.push(...fallbackResults);
        }
        return batchResults;
      })
    );

    for (const results of chunkResults) {
      allResults.push(...results);
    }

    // Minimal delay between parallel chunks (reduced from 100ms to 20ms)
    if (chunkStart + PARALLEL_BATCHES < batches.length) {
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  return allResults;
}

/**
 * Keyword-based fallback (100% gratis, tidak perlu API)
 */
function analyzeSentimentKeyword(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = [
    "bagus", "mantap", "keren", "suka", "love", "top", "nice", "good", "great",
    "excellent", "amazing", "wow", "keren banget", "the best", "terbaik",
    "luar biasa", "hebat", "sukses", "senang", "happy", "bangga",
    "terima kasih", "thanks", "kereeen", "jos", "oke", "sip", "sipp",
    "bermanfaat", "membantu", "recommended", "bintang 5", "5 stars",
    "sangat bagus", "sangat suka", "sangat membantu", "paling suka",
    "suka banget", "keren banget", "bagus banget", "mantap jiwa"
  ];
  
  // Negative keywords
  const negativeWords = [
    "jelek", "buruk", "benci", "hate", "worst", "bad", "disappointed",
    "kecewa", "tidak bagus", "parah", "sangat buruk", "menyedihkan",
    "sucks", "terrible", "horrible", "ga bagus", "gak bagus", "tidak suka",
    "gak suka", "ga suka", "benci banget", "jelek banget", "buruk banget",
    "parah banget", "kecewa banget", "sangat kecewa", "menyesal",
    "rugi", "buang-buang waktu", "tidak recommended", "jangan beli",
    "kurang", "kurang bagus", "kurang jelas"
  ];
  
  // Count matches
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  // Determine sentiment
  let sentiment: Sentiment;
  let confidence: number;
  
  if (positiveScore > negativeScore) {
    sentiment = "positive";
    confidence = Math.min(0.95, 0.6 + (positiveScore / (positiveScore + negativeScore + 1)) * 0.35);
  } else if (negativeScore > positiveScore) {
    sentiment = "negative";
    confidence = Math.min(0.95, 0.6 + (negativeScore / (positiveScore + negativeScore + 1)) * 0.35);
  } else {
    sentiment = "neutral";
    confidence = 0.5;
  }
  
  // Check emojis
  const positiveEmojis = /[😊😄😁😃😆🥰❤️👍🙏🎉✨🌟💯🔥]/g;
  const negativeEmojis = /[😢😭😠😡🤬👎💔😞😔😟😕😒]/g;
  
  const posEmojis = text.match(positiveEmojis)?.length || 0;
  const negEmojis = text.match(negativeEmojis)?.length || 0;
  
  if (posEmojis > negEmojis && sentiment !== "positive") {
    confidence = Math.max(confidence, 0.7);
  } else if (negEmojis > posEmojis && sentiment !== "negative") {
    sentiment = "negative";
    confidence = 0.7;
  }
  
  return {
    text,
    sentiment,
    confidence,
  };
}

/**
 * Calculate sentiment statistics
 */
export function calculateSentimentStats(results: SentimentResult[]) {
  const total = results.length;
  const positive = results.filter((r) => r.sentiment === "positive").length;
  const negative = results.filter((r) => r.sentiment === "negative").length;
  const neutral = results.filter((r) => r.sentiment === "neutral").length;

  return {
    total,
    positive,
    negative,
    neutral,
    percentages: {
      positive: total > 0 ? ((positive / total) * 100).toFixed(1) : "0",
      negative: total > 0 ? ((negative / total) * 100).toFixed(1) : "0",
      neutral: total > 0 ? ((neutral / total) * 100).toFixed(1) : "0",
    },
  };
}