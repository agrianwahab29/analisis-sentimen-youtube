import type { Sentiment } from "./sentiment";

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
 * Analyze sentiment using HuggingFace Inference API
 * FREE tier: 30k input tokens/minute
 * With token: Higher rate limits and reliability
 */
export async function analyzeSentimentHuggingFace(text: string): Promise<SentimentResult> {
  try {
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
      throw new Error(`HuggingFace API error: ${response.status}`);
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
  } catch (error) {
    console.error("HuggingFace API error:", error);
    // Fallback ke keyword-based
    return analyzeSentimentKeyword(text);
  }
}

/**
 * Analyze batch dengan HuggingFace
 * Process in chunks untuk menghindari rate limit
 */
export async function analyzeSentimentBatch(texts: string[]): Promise<SentimentResult[]> {
  const results: SentimentResult[] = [];
  const batchSize = 10; // HuggingFace rate limit

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    try {
      // Try HuggingFace API
      const batchResults = await Promise.all(
        batch.map(text => analyzeSentimentHuggingFace(text))
      );
      results.push(...batchResults);
    } catch (error) {
      // Fallback ke keyword-based
      console.log("HuggingFace unavailable, using keyword fallback");
      const fallbackResults = batch.map(text => analyzeSentimentKeyword(text));
      results.push(...fallbackResults);
    }

    // Rate limiting delay
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
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