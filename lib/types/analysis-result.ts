export interface AnalysisComment {
  id: string;
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  author: string;
  likes: number;
}

export interface AnalysisResult {
  videoInfo: {
    id: string;
    title: string;
    thumbnail: string;
    totalComments: number;
    channelTitle: string;
    viewCount: number;
    likeCount: number;
  };
  sentimentStats: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
  percentages: {
    positive: string;
    negative: string;
    neutral: string;
  };
  creditsUsed: number;
  aiInsight: {
    summary: string;
    complaints: string[];
    suggestions: string[];
  } | null;
  wordCloud: Array<{ text: string; value: number }>;
  comments: AnalysisComment[];
  allComments?: AnalysisComment[];
  analysisId?: string;
  demo?: boolean;
  message?: string;
  demoBadge?: {
    type: string;
    title: string;
    message: string;
    action?: { label: string; href: string };
  } | null;
}
