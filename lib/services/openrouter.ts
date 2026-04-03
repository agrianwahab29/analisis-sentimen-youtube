export interface AIInsightResult {
  summary: string;
  complaints: string[];
  suggestions: string[];
}

interface CommentSummary {
  positive: string[];
  negative: string[];
  neutral: string[];
}

export async function generateAIInsight(
  videoInfo: { title: string; totalComments: number },
  sentimentStats: { positive: number; negative: number; neutral: number },
  comments: { text: string; sentiment: string; likes?: number; confidence?: number }[],
  apiKey?: string
): Promise<AIInsightResult | null> {
  try {
    // If no API key provided, return mock data for development
    if (!apiKey) {
      return generateMockInsight(videoInfo, sentimentStats);
    }

    // Sample comments for analysis: prioritize high-signal comments.
    const sortBySignal = (
      a: { likes?: number; confidence?: number },
      b: { likes?: number; confidence?: number }
    ) => {
      const aScore = (a.likes ?? 0) * 0.2 + (a.confidence ?? 0) * 100;
      const bScore = (b.likes ?? 0) * 0.2 + (b.confidence ?? 0) * 100;
      return bScore - aScore;
    };

    const positiveComments = comments
      .filter((c) => c.sentiment === "positive")
      .sort(sortBySignal)
      .slice(0, 5)
      .map((c) => c.text);
    const negativeComments = comments
      .filter((c) => c.sentiment === "negative")
      .sort(sortBySignal)
      .slice(0, 5)
      .map((c) => c.text);
    const neutralComments = comments
      .filter((c) => c.sentiment === "neutral")
      .sort(sortBySignal)
      .slice(0, 5)
      .map((c) => c.text);

    const prompt = `Analisis komentar video YouTube berikut:

Judul Video: ${videoInfo.title}
Total Komentar: ${videoInfo.totalComments}
Sentimen Positif: ${sentimentStats.positive}
Sentimen Negatif: ${sentimentStats.negative}
Sentimen Netral: ${sentimentStats.neutral}

Contoh Komentar Positif:
${positiveComments.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Contoh Komentar Negatif:
${negativeComments.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Contoh Komentar Netral:
${neutralComments.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Berikan analisis dalam format berikut (gunakan Bahasa Indonesia):

1. Ringkasan: [Ringkasan singkat tentang sentimen penonton]

2. Keluhan Utama (maksimal 3):
- [Keluhan 1]
- [Keluhan 2]
- [Keluhan 3]

3. Saran Konten Berikutnya (maksimal 3, spesifik dan bisa dieksekusi):
- [Saran 1]
- [Saran 2]
- [Saran 3]`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "VidSense AI Analysis",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3-8b-instruct:free",
          messages: [
            {
              role: "system",
              content:
                "Kamu adalah AI analis sentimen senior untuk content creator YouTube. Jawaban harus spesifik, berbasis data, non-generik, dan langsung bisa ditindaklanjuti. Hindari saran klise. Gunakan Bahasa Indonesia.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the response
    return parseAIResponse(content);
  } catch (error) {
    console.error("Error generating AI insight:", error);
    // Return mock data as fallback
    return generateMockInsight(videoInfo, sentimentStats);
  }
}

function generateMockInsight(
  videoInfo: { title: string; totalComments: number },
  sentimentStats: { positive: number; negative: number; neutral: number }
): AIInsightResult {
  const total = sentimentStats.positive + sentimentStats.negative + sentimentStats.neutral;
  const positivePercent = total > 0 ? ((sentimentStats.positive / total) * 100).toFixed(0) : "0";
  const negativePercent = total > 0 ? ((sentimentStats.negative / total) * 100).toFixed(0) : "0";

  return {
    summary: `Dari ${total} komentar yang dianalisis, mayoritas penonton (${positivePercent}%) merespons secara positif terhadap video "${videoInfo.title}". Sentimen positif ini menunjukkan konten yang berkualitas dan sesuai dengan ekspektasi audiens. Namun, ada ${negativePercent}% komentar negatif yang bisa menjadi bahan evaluasi untuk perbaikan ke depannya.`,
    complaints: [
      "Beberapa penonton menyebutkan bahwa durasi video terlalu panjang dan membosankan",
      "Ada yang merasa penjelasan kurang detail di beberapa bagian penting",
      "Kualitas audio perlu ditingkatkan karena sulit didengar di bagian tertentu",
    ],
    suggestions: [
      "Pertimbangkan untuk membuat video dengan durasi lebih pendek namun padat informasi",
      "Tambahkan visualisasi atau contoh praktis untuk mendukung penjelasan",
      "Lakukan tes audio sebelum publish untuk memastikan kualitas suara optimal",
    ],
  };
}

function parseAIResponse(content: string): AIInsightResult {
  const lines = content.split("\n").filter((line) => line.trim());

  let summary = "";
  const complaints: string[] = [];
  const suggestions: string[] = [];

  let currentSection: "summary" | "complaints" | "suggestions" | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("1.") || trimmedLine.toLowerCase().includes("ringkasan")) {
      currentSection = "summary";
      summary = trimmedLine.replace(/^1\.\s*/, "").replace(/ringkasan:\s*/i, "");
      continue;
    }

    if (trimmedLine.startsWith("2.") || trimmedLine.toLowerCase().includes("keluhan")) {
      currentSection = "complaints";
      continue;
    }

    if (trimmedLine.startsWith("3.") || trimmedLine.toLowerCase().includes("saran")) {
      currentSection = "suggestions";
      continue;
    }

    if (trimmedLine.startsWith("-") || trimmedLine.match(/^\d+\./)) {
      const cleanLine = trimmedLine.replace(/^[-\d\.\s]+/, "").trim();

      if (currentSection === "complaints" && cleanLine) {
        complaints.push(cleanLine);
      } else if (currentSection === "suggestions" && cleanLine) {
        suggestions.push(cleanLine);
      }
    } else if (currentSection === "summary" && trimmedLine) {
      summary += " " + trimmedLine;
    }
  }

  // Ensure we have at least some data
  if (!summary) {
    summary = "Analisis sentimen menunjukkan mayoritas penonton merespons positif terhadap video ini.";
  }

  return {
    summary: summary.trim(),
    complaints: complaints.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
  };
}
