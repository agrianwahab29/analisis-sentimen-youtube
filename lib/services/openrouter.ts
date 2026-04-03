import { sanitizeInsightPlainText } from "@/lib/utils/insight-plain-text";

export interface AIInsightResult {
  summary: string;
  complaints: string[];
  suggestions: string[];
}

function sanitizeInsightResult(data: AIInsightResult): AIInsightResult {
  return {
    summary: sanitizeInsightPlainText(data.summary),
    complaints: data.complaints.map(sanitizeInsightPlainText),
    suggestions: data.suggestions.map(sanitizeInsightPlainText),
  };
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
      return sanitizeInsightResult(
        generateMockInsight(videoInfo, sentimentStats, comments)
      );
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

Berikan analisis dalam format berikut (gunakan Bahasa Indonesia, tanpa HTML/Markdown):

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
                "Kamu adalah AI analis sentimen senior untuk content creator YouTube. Jawaban harus spesifik, berbasis data, non-generik, dan langsung bisa ditindaklanjuti. Hindari saran klise. Gunakan Bahasa Indonesia. PENTING: tulis hanya teks biasa (plain text). Jangan gunakan HTML, tag apa pun (<a>, <br>, <p>, dan lainnya), Markdown, atau kode. Jangan sertakan tautan atau markup — cukup kalimat biasa.",
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

    return sanitizeInsightResult(parseAIResponse(content));
  } catch (error) {
    console.error("Error generating AI insight:", error);
    // Return data-driven fallback when LLM is unavailable
    return sanitizeInsightResult(
      generateMockInsight(videoInfo, sentimentStats, comments)
    );
  }
}

function generateMockInsight(
  videoInfo: { title: string; totalComments: number },
  sentimentStats: { positive: number; negative: number; neutral: number },
  comments: { text: string; sentiment: string; likes?: number; confidence?: number }[]
): AIInsightResult {
  const total = sentimentStats.positive + sentimentStats.negative + sentimentStats.neutral;
  const positivePercent = total > 0 ? ((sentimentStats.positive / total) * 100).toFixed(0) : "0";
  const negativePercent = total > 0 ? ((sentimentStats.negative / total) * 100).toFixed(0) : "0";

  const negativeExamples = comments
    .filter((c) => c.sentiment === "negative")
    .sort((a, b) => ((b.likes ?? 0) + (b.confidence ?? 0) * 10) - ((a.likes ?? 0) + (a.confidence ?? 0) * 10))
    .slice(0, 3)
    .map((c) => c.text.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const positiveExamples = comments
    .filter((c) => c.sentiment === "positive")
    .sort((a, b) => ((b.likes ?? 0) + (b.confidence ?? 0) * 10) - ((a.likes ?? 0) + (a.confidence ?? 0) * 10))
    .slice(0, 3)
    .map((c) => c.text.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const toComplaint = (text: string): string => {
    const t = text.length > 140 ? `${text.slice(0, 137)}...` : text;
    return `Komentar negatif dominan menyoroti: "${t}"`;
  };

  const toSuggestion = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("audio") || lower.includes("suara")) {
      return "Perbaiki kualitas audio (noise reduction + level volume konsisten) sebelum publish.";
    }
    if (lower.includes("panjang") || lower.includes("durasi")) {
      return "Buat struktur chapter yang lebih ringkas agar durasi terasa padat dan mudah diikuti.";
    }
    if (lower.includes("jelas") || lower.includes("detail")) {
      return "Tambahkan contoh praktis langkah demi langkah pada bagian yang sering dianggap kurang jelas.";
    }
    return `Tindaklanjuti tema komentar ini pada video berikutnya: "${text.slice(0, 80)}${text.length > 80 ? "..." : ""}".`;
  };

  const complaints =
    negativeExamples.length > 0
      ? negativeExamples.map(toComplaint).slice(0, 3)
      : [
          "Tidak ada keluhan dominan yang benar-benar menonjol dari sampel komentar.",
          "Sebagian kritik bersifat minor dan tidak konsisten antar komentar.",
          "Perlu observasi lanjutan pada video berikutnya untuk melihat pola keluhan yang stabil.",
        ];

  const suggestions = (
    negativeExamples.length > 0 ? negativeExamples.map(toSuggestion) : positiveExamples.map(toSuggestion)
  ).slice(0, 3);

  while (suggestions.length < 3) {
    suggestions.push(
      "Uji dua variasi format konten (lebih singkat vs lebih detail) dan bandingkan sentimen komentarnya."
    );
  }

  return {
    summary: `Dari ${total} komentar yang dianalisis pada video "${videoInfo.title}", ${positivePercent}% bernada positif, ${negativePercent}% bernada negatif, dan sisanya netral. Temuan ini menunjukkan respons audiens cenderung positif, namun masih ada sinyal perbaikan pada beberapa aspek konten yang berulang di komentar negatif paling berpengaruh.`,
    complaints,
    suggestions,
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
