import { pipeline } from "@huggingface/transformers";

// Initialize sentiment analysis pipeline
// Using IndoBERT model for Indonesian sentiment analysis
let sentimentPipeline: Awaited<ReturnType<typeof pipeline>> | null = null;

export async function initSentimentAnalysis() {
  if (!sentimentPipeline) {
    // Using a smaller model for faster inference
    // In production, consider using a Python microservice with the full model
    sentimentPipeline = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );
  }
  return sentimentPipeline;
}

export type Sentiment = "positive" | "negative" | "neutral";

export interface SentimentResult {
  text: string;
  sentiment: Sentiment;
  confidence: number;
}

// Simple Indonesian sentiment keywords
const indonesianSentimentKeywords: Record<Sentiment, string[]> = {
  positive: [
    "bagus", "mantap", "keren", "suka", "love", "top", "nice", "good", "great",
    "excellent", "amazing", "wow", "keren banget", "the best", "terbaik",
    "luar biasa", "hebat", "sukses", "senang", "happy", "senang", "bangga",
    "terima kasih", "thanks", "thank you", "kereeen", "jos", "jos gandos",
    "oke", "ok", "sip", "sipp", "makasih", "terimakasih", "bermanfaat",
    "membantu", "recommended", "rekomendasi", "bintang 5", "5 stars",
    "sangat bagus", "sangat suka", "sangat membantu", "paling suka",
    "suka banget", "keren banget", "bagus banget", "mantap jiwa"
  ],
  negative: [
    "jelek", "buruk", "benci", "hate", "worst", "bad", "disappointed",
    "kecewa", "tidak bagus", "parah", "sangat buruk", "menyedihkan",
    "sucks", "terrible", "horrible", "ga bagus", "gak bagus", "tidak suka",
    "gak suka", "ga suka", "benci banget", "jelek banget", "buruk banget",
    "parah banget", "kecewa banget", "sangat kecewa", "sangat mengecewakan",
    "menyesal", "sayang sekali", "rugi", "buang-buang waktu", "tidak recommended",
    "gak recommended", "jangan beli", "jangan tonton", "skip aja", "gajelas",
    "kurang", "kurang bagus", "kurang jelas", "kurang suka"
  ],
  neutral: [
    "biasa", "biasa saja", "lumayan", "cukup", "okelah", "standar", "normal",
    "rata-rata", "menengah", "sedang", "gitu-gitu aja", "gitu doang",
    "biasa aja sih", "ga ada yang spesial", "gak ada yang spesial",
    "biasalah", "seperti biasa"
  ]
};

// Count sentiment based on Indonesian keywords
function countSentimentKeywords(text: string): Record<Sentiment, number> {
  const lowerText = text.toLowerCase();
  const counts: Record<Sentiment, number> = {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  for (const [sentiment, keywords] of Object.entries(indonesianSentimentKeywords)) {
    for (const keyword of keywords) {
      // Use regex to match whole words
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        counts[sentiment as Sentiment] += matches.length;
      }
    }
  }

  return counts;
}

// Simple heuristic-based sentiment analysis for Indonesian
export function analyzeSentimentHeuristic(text: string): SentimentResult {
  const counts = countSentimentKeywords(text);
  
  // If no sentiment keywords found, analyze based on exclamation and emoji
  const totalKeywords = counts.positive + counts.negative + counts.neutral;
  
  if (totalKeywords === 0) {
    // Check for positive emojis
    const positiveEmojis = /[😊😄😁😃😆🥰❤️👍🙏🎉✨🌟💯🔥]/g;
    const negativeEmojis = /[😢😭😠😡🤬👎💔😞😔😟😕😒]/g;
    
    const posEmojis = text.match(positiveEmojis)?.length || 0;
    const negEmojis = text.match(negativeEmojis)?.length || 0;
    
    if (posEmojis > negEmojis) {
      return { text, sentiment: "positive", confidence: 0.7 };
    } else if (negEmojis > posEmojis) {
      return { text, sentiment: "negative", confidence: 0.7 };
    } else {
      return { text, sentiment: "neutral", confidence: 0.5 };
    }
  }
  
  // Determine sentiment based on keyword counts
  if (counts.positive > counts.negative && counts.positive >= counts.neutral) {
    const confidence = Math.min(0.95, 0.6 + (counts.positive / (totalKeywords + 1)) * 0.4);
    return { text, sentiment: "positive", confidence };
  } else if (counts.negative > counts.positive && counts.negative >= counts.neutral) {
    const confidence = Math.min(0.95, 0.6 + (counts.negative / (totalKeywords + 1)) * 0.4);
    return { text, sentiment: "negative", confidence };
  } else {
    const confidence = Math.min(0.8, 0.5 + (counts.neutral / (totalKeywords + 1)) * 0.3);
    return { text, sentiment: "neutral", confidence };
  }
}

// Main sentiment analysis function
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // Use heuristic-based analysis (fast and works well for Indonesian)
  return analyzeSentimentHeuristic(text);
}

export async function analyzeBatch(
  texts: string[]
): Promise<SentimentResult[]> {
  // Process in batches to avoid blocking
  const batchSize = 32;
  const results: SentimentResult[] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = batch.map((text) => analyzeSentimentHeuristic(text));
    results.push(...batchResults);
    
    // Small delay to prevent blocking
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  return results;
}

// Calculate statistics from sentiment results
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
