import { NextRequest, NextResponse } from "next/server";
import { 
  extractVideoId, 
  getVideoInfo, 
  getVideoComments, 
  preprocessText 
} from "@/lib/services/youtube";
import { 
  analyzeSentimentBatch, 
  calculateSentimentStats,
  SentimentResult 
} from "@/lib/services/huggingface";
import { generateAIInsight } from "@/lib/services/openrouter";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeCreditBalance } from "@/lib/normalize-credit-balance";
import { formatErrorForUser, APIError } from "@/lib/error-handling";

export async function POST(request: NextRequest) {
  try {
    const { url, isPremium } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL video diperlukan" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "URL YouTube tidak valid" },
        { status: 400 }
      );
    }

    // Check YouTube API key
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;

    // Check user credits first
    const { supabase } = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const requiredCredits = isPremium ? 15 : 5;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const adminClient =
      supabaseUrl && serviceKey
        ? createClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : null;

    if (user) {
      const { data: profile } = adminClient
        ? await adminClient
            .from("users")
            .select("credit_balance")
            .eq("id", user.id)
            .maybeSingle()
        : await supabase
            .from("users")
            .select("credit_balance")
            .eq("id", user.id)
            .maybeSingle();

      const balance = normalizeCreditBalance(profile?.credit_balance);
      if (balance < requiredCredits) {
        return NextResponse.json(
          { error: `Kredit tidak cukup. Butuh ${requiredCredits} kredit, saldo Anda ${balance}.` },
          { status: 402 }
        );
      }
    }

    // === CACHE CHECK ===
    // Check if we have a recent analysis for this video (within 24 hours)
    if (user) {
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: cachedAnalysis } = await supabase
          .from("analysis_history")
          .select("id, result_snapshot, created_at")
          .eq("user_id", user.id)
          .eq("video_id", videoId)
          .gte("created_at", twentyFourHoursAgo)
          .not("result_snapshot", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cachedAnalysis?.result_snapshot) {
          const snapshot = cachedAnalysis.result_snapshot as Record<string, any>;
          const cacheAgeMinutes = Math.round(
            (Date.now() - new Date(cachedAnalysis.created_at).getTime()) / 60000
          );

          return NextResponse.json({
            ...snapshot,
            success: true,
            analysisId: cachedAnalysis.id,
            fromCache: true,
            cacheAge: cacheAgeMinutes,
            comments: snapshot.comments,
            allComments: snapshot.comments,
          });
        }
      } catch (cacheError) {
        // Cache lookup failed - proceed with fresh analysis
        console.log("Cache lookup failed, proceeding with fresh analysis");
      }
    }

    if (!youtubeApiKey || youtubeApiKey === "your_youtube_api_key_here") {
      // Use HuggingFace model with demo data
      const demoResult = await getHuggingFaceDemoData(videoId, isPremium);
      return NextResponse.json({
        ...demoResult,
        demo: true,
        demoBadge: {
          type: "warning",
          title: "Demo Mode",
          message: "Analisis menggunakan data simulasi. Tambahkan YOUTUBE_API_KEY di environment variables untuk analisis data real.",
          action: {
            label: "Panduan Setup",
            href: "#setup-guide"
          }
        }
      });
    }

    // Real data flow
    let videoInfo;
    let rawComments;
    
    try {
      [videoInfo, rawComments] = await Promise.all([
        getVideoInfo(videoId),
        getVideoComments(videoId, 1000),
      ]);
    } catch (youtubeError: any) {
      console.error("YouTube API error:", youtubeError);
      
      // Format error for user-friendly display
      const formattedError = formatErrorForUser(youtubeError);
      
      return NextResponse.json(
        { 
          error: formattedError.message,
          errorCode: (youtubeError as APIError).code || "YOUTUBE_ERROR",
          title: formattedError.title,
          action: formattedError.action,
        },
        { status: (youtubeError as APIError).statusCode || 500 }
      );
    }

    if (!videoInfo) {
      return NextResponse.json(
        { 
          error: "Video tidak ditemukan atau tidak dapat diakses",
          errorCode: "VIDEO_NOT_FOUND",
          title: "Video Tidak Ditemukan",
          action: "Pastikan video bersifat publik dan URL sudah benar."
        },
        { status: 404 }
      );
    }
    
    if (!rawComments || rawComments.length === 0) {
      return NextResponse.json(
        { 
          error: "Tidak ada komentar yang dapat dianalisis pada video ini",
          errorCode: "NO_COMMENTS",
          title: "Tidak Ada Komentar",
          action: "Pilih video lain yang memiliki komentar aktif."
        },
        { status: 400 }
      );
    }

    // Preprocess comments
    const processedComments = rawComments.map((comment) => ({
      ...comment,
      text: preprocessText(comment.text),
    }));

    // Analyze sentiment using HuggingFace (with retry mechanism built-in)
    let sentimentResults: SentimentResult[];
    try {
      sentimentResults = await analyzeSentimentBatch(
        processedComments.map((c) => c.text)
      );
    } catch (sentimentError: any) {
      console.error("Sentiment analysis error:", sentimentError);
      
      const formattedError = formatErrorForUser(sentimentError);
      
      return NextResponse.json(
        { 
          error: formattedError.message,
          errorCode: (sentimentError as APIError).code || "SENTIMENT_ERROR",
          title: formattedError.title,
          action: formattedError.action,
        },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = calculateSentimentStats(sentimentResults);

    // Combine comments with sentiment
    const analyzedComments = processedComments.map((comment, index) => ({
      id: comment.id,
      text: rawComments[index].text,
      sentiment: sentimentResults[index].sentiment,
      confidence: sentimentResults[index].confidence,
      author: comment.author,
      likes: comment.likeCount,
    }));

    // Fixed credit cost per analysis
    const creditsUsed = isPremium ? 15 : 5;

    // Generate word cloud
    const wordCloud = generateWordCloud(analyzedComments.map((c) => c.text));

    // Generate AI Insight if premium (with retry mechanism built-in)
    let aiInsight = null;
    if (isPremium) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      try {
        aiInsight = await generateAIInsight(
          { title: videoInfo.title, totalComments: stats.total },
          { positive: stats.positive, negative: stats.negative, neutral: stats.neutral },
          analyzedComments,
          openRouterKey
        );
      } catch (insightError: any) {
        console.error("AI insight generation error:", insightError);
        // AI insight is optional - continue without it
        aiInsight = null;
      }
    }

    const resultSnapshot = {
      videoInfo: {
        id: videoId,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        totalComments: stats.total,
        channelTitle: videoInfo.channelTitle,
        viewCount: videoInfo.viewCount,
        likeCount: videoInfo.likeCount,
      },
      sentimentStats: {
        positive: stats.positive,
        negative: stats.negative,
        neutral: stats.neutral,
        total: stats.total,
      },
      percentages: stats.percentages,
      comments: analyzedComments.slice(0, 100).map((c) => ({
        id: c.id,
        text: c.text,
        sentiment: c.sentiment,
        confidence: c.confidence,
        author: c.author,
        likes: c.likes,
      })),
      creditsUsed,
      aiInsight,
      wordCloud,
    };

    // Save to database and deduct credits
    let savedAnalysisId: string | undefined;
    try {
      if (user) {
        const { data: insertedData, error: insertError } = await supabase.from("analysis_history").insert({
          user_id: user.id,
          video_url: url,
          video_title: videoInfo.title,
          video_id: videoId,
          total_comments: stats.total,
          positive_count: stats.positive,
          negative_count: stats.negative,
          neutral_count: stats.neutral,
          credits_used: creditsUsed,
          is_premium: isPremium,
          result_snapshot: resultSnapshot,
        }).select("id").single();

        if (insertError) {
          console.error("Failed to save analysis:", insertError);
        } else if (insertedData) {
          savedAnalysisId = insertedData.id;
        }

        try {
          const { data: currentProfile } = adminClient
            ? await adminClient
                .from("users")
                .select("credit_balance")
                .eq("id", user.id)
                .maybeSingle()
            : await supabase
                .from("users")
                .select("credit_balance")
                .eq("id", user.id)
                .maybeSingle();

          if (currentProfile) {
            const newBalance = Math.max(
              0,
              normalizeCreditBalance(currentProfile.credit_balance) - creditsUsed
            );
            const creditsUpdateClient = adminClient ?? supabase;
            const { error: updateError } = await creditsUpdateClient
              .from("users")
              .update({ credit_balance: newBalance })
              .eq("id", user.id);

            if (updateError) {
              console.error("Failed to update credits:", updateError);
            } else {
              console.log(
                `Credits updated: ${normalizeCreditBalance(currentProfile.credit_balance)} -> ${newBalance}`
              );
            }
          }
        } catch (creditErr) {
          console.error("Database update error:", creditErr);
        }
      }
    } catch (dbError) {
      console.error("Database save error:", dbError);
    }

    return NextResponse.json({
      success: true,
      videoInfo: {
        id: videoId,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        totalComments: stats.total,
        channelTitle: videoInfo.channelTitle,
        viewCount: videoInfo.viewCount,
        likeCount: videoInfo.likeCount,
      },
      sentimentStats: {
        positive: stats.positive,
        negative: stats.negative,
        neutral: stats.neutral,
        total: stats.total,
      },
      percentages: stats.percentages,
      comments: analyzedComments.slice(0, 100),
      allComments: analyzedComments,
      analysisId: savedAnalysisId,
      creditsUsed,
      aiInsight,
      wordCloud,
    });

  } catch (error) {
    console.error("Analysis error:", error);
    
    const formattedError = formatErrorForUser(error as Error);
    
    return NextResponse.json(
      { 
        error: formattedError.message,
        errorCode: "ANALYSIS_ERROR",
        title: formattedError.title,
        action: formattedError.action,
      },
      { status: 500 }
    );
  }
}

// HuggingFace Integration with Demo Data
async function getHuggingFaceDemoData(videoId: string, isPremium: boolean) {
  // Test HuggingFace model
  const testSentences = [
    "Produk ini sangat bagus dan berkualitas",
    "Saya kecewa dengan pelayanannya",
    "Biasa saja, tidak ada yang spesial",
  ];

  try {
    // Test model availability
    const testResults = await analyzeSentimentBatch(testSentences);
    console.log("HuggingFace model test:", testResults);
  } catch (e) {
    console.log("HuggingFace model not available, using keyword fallback");
  }

  // Demo dataset
  const total = 2000;
  const positive = 1247;
  const negative = 423;
  const neutral = 330;

  const demoComments = [
    { id: "1", text: "Video ini sangat bagus dan informatif! Suka banget", sentiment: "positive" as const, confidence: 0.95, author: "User123", likes: 45 },
    { id: "2", text: "Keren banget kontennya, penjelasan sangat jelas", sentiment: "positive" as const, confidence: 0.92, author: "Viewer456", likes: 32 },
    { id: "3", text: "Tidak terlalu bagus, kurang jelas penjelasannya", sentiment: "negative" as const, confidence: 0.88, author: "Critic789", likes: 12 },
    { id: "4", text: "Mantap! Penjelasan sangat detail dan mudah dipahami", sentiment: "positive" as const, confidence: 0.94, author: "Fan012", likes: 67 },
    { id: "5", text: "Kurang suka sama videonya, terlalu panjang", sentiment: "negative" as const, confidence: 0.85, author: "Hater345", likes: 8 },
    { id: "6", text: "Top markotop! Sangat bermanfaat", sentiment: "positive" as const, confidence: 0.96, author: "Support678", likes: 89 },
    { id: "7", text: "Biasa saja, tidak spesial", sentiment: "neutral" as const, confidence: 0.78, author: "Neutral901", likes: 5 },
    { id: "8", text: "Sangat membantu, terima kasih banyak!", sentiment: "positive" as const, confidence: 0.93, author: "Thankful234", likes: 23 },
    { id: "9", text: "Jelek, tidak recommended", sentiment: "negative" as const, confidence: 0.91, author: "Dislike567", likes: 3 },
    { id: "10", text: "Bagus sekali, lanjutkan kontennya!", sentiment: "positive" as const, confidence: 0.97, author: "Encourage890", likes: 56 },
  ];

  const allComments = Array(200).fill(null).flatMap((_, i) =>
    demoComments.map((c, j) => ({
      ...c,
      id: `${i}-${j}`,
      likes: Math.floor(Math.random() * 100),
      confidence: 0.8 + Math.random() * 0.15,
    }))
  );

  const creditCost = isPremium ? 2 : 1;
  const creditsUsed = Math.ceil(total / 10) * creditCost;

  return {
    success: true,
    videoInfo: {
      id: videoId,
      title: "Demo Video - Install API Key untuk Data Real",
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      totalComments: total,
      channelTitle: "Demo Channel",
      viewCount: 150000,
      likeCount: 8500,
    },
    sentimentStats: {
      positive,
      negative,
      neutral,
      total,
    },
    percentages: {
      positive: ((positive / total) * 100).toFixed(1),
      negative: ((negative / total) * 100).toFixed(1),
      neutral: ((neutral / total) * 100).toFixed(1),
    },
    comments: allComments.slice(0, 100),
    allComments: allComments,
    analysisId: undefined,
    creditsUsed,
    aiInsight: isPremium ? {
      summary: `Dari ${total} komentar yang dianalisis, mayoritas penonton (${((positive/total)*100).toFixed(0)}%) merespons positif terhadap video ini. Sentimen positif menunjukkan konten yang berkualitas dan engaging. Namun, ada beberapa area yang perlu diperbaiki.`,
      complaints: [
        "Beberapa penonton menyebutkan bahwa audio kurang jelas di bagian tertentu",
        "Ada yang merasa penjelasan kurang detail untuk pemula",
        "Kualitas visual perlu ditingkatkan di beberapa bagian"
      ],
      suggestions: [
        "Tingkatkan kualitas audio dengan menggunakan microphone yang lebih baik",
        "Tambahkan contoh kasus yang lebih relevan dengan audiens target",
        "Pertimbangkan untuk membuat video series untuk pembahasan mendalam"
      ]
    } : null,
    wordCloud: [
      { text: "bagus", value: 150 },
      { text: "keren", value: 120 },
      { text: "mantap", value: 95 },
      { text: "terima kasih", value: 88 },
      { text: "jelek", value: 45 },
      { text: "oke", value: 42 },
      { text: "suka", value: 38 },
      { text: "top", value: 35 },
      { text: "hebat", value: 32 },
      { text: "buruk", value: 28 },
      { text: "biasa", value: 25 },
      { text: "recommended", value: 22 },
      { text: "sangat bagus", value: 20 },
      { text: "kurang", value: 18 },
      { text: "membantu", value: 16 },
    ],
    demo: true,
    message: "Demo mode: Tambahkan YOUTUBE_API_KEY dan setup HuggingFace untuk analisis real.",
  };
}

function generateWordCloud(texts: string[]): { text: string; value: number }[] {
  const wordFreq: Record<string, number> = {};
  const stopWords = new Set([
    "yang", "dan", "di", "ke", "dari", "ini", "itu", "dengan", "untuk", "pada",
    "dalam", "seperti", "adalah", "saya", "kamu", "dia", "kita", "mereka", "sudah",
    "belum", "bisa", "akan", "ada", "tidak", "ya", "no", "the", "is", "a", "an",
    "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
    "video", "komen", "comment"
  ]);

  texts.forEach((text) => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
  });

  return Object.entries(wordFreq)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 30);
}