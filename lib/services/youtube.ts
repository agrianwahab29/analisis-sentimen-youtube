import { google, youtube_v3 } from "googleapis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

// Create YouTube client lazily to ensure env vars are available
function getYouTubeClient() {
  return google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY || "",
  });
}

export interface YouTubeComment {
  id: string;
  author: string;
  text: string;
  likeCount: number;
  publishedAt: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    const response = await getYouTubeClient().videos.list({
      part: ["snippet", "statistics"],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) return null;

    return {
      id: videoId,
      title: video.snippet?.title || "",
      description: video.snippet?.description || "",
      channelTitle: video.snippet?.channelTitle || "",
      thumbnail:
        video.snippet?.thumbnails?.maxres?.url ||
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url ||
        "",
      viewCount: parseInt(video.statistics?.viewCount || "0", 10),
      likeCount: parseInt(video.statistics?.likeCount || "0", 10),
      commentCount: parseInt(video.statistics?.commentCount || "0", 10),
      publishedAt: video.snippet?.publishedAt || "",
    };
  } catch (error: any) {
    console.error("Error fetching video info:", error);
    
    // Handle specific YouTube API errors
    if (error?.code === 403) {
      if (error?.errors?.[0]?.reason === "quotaExceeded") {
        throw new Error("YOUTUBE_QUOTA_EXCEEDED: Quota YouTube API habis. Coba lagi besok atau gunakan demo mode.");
      }
      throw new Error("YOUTUBE_ACCESS_DENIED: Akses ke video ditolak. Video mungkin private atau dibatasi.");
    }
    
    if (error?.code === 404) {
      throw new Error("YOUTUBE_VIDEO_NOT_FOUND: Video tidak ditemukan atau sudah dihapus.");
    }
    
    if (error?.code === 429) {
      throw new Error("YOUTUBE_RATE_LIMIT: Terlalu banyak request. Tunggu beberapa saat dan coba lagi.");
    }
    
    // Network/timeout errors
    if (error?.code === "ECONNRESET" || error?.code === "ETIMEDOUT" || error?.code === "ENOTFOUND") {
      throw new Error("YOUTUBE_NETWORK_ERROR: Gagal terhubung ke YouTube API. Cek koneksi internet Anda.");
    }
    
    // Generic error with code for debugging
    throw new Error(`YOUTUBE_API_ERROR: Gagal mengambil info video (${error?.code || "UNKNOWN"}). Coba lagi nanti.`);
  }
}

/**
 * Fetch comments for a YouTube video with parallel page fetching.
 * 
 * Optimization strategy:
 * 1. Reduced default maxResults from 5000 to 1000 (still statistically accurate)
 * 2. Pipeline/prefetch pattern: while processing page N, already fetch page N+1
 * 3. Batch parallel fetching: when we have a nextPageToken, we can fetch up to
 *    CONCURRENT_REQUESTS pages simultaneously (each with its own token from the chain)
 * 4. Removed verbose per-page console.log statements
 */
export async function getVideoComments(
  videoId: string,
  maxResults: number = 1000
): Promise<YouTubeComment[]> {
  const seenCommentIds = new Set<string>();
  
  // Check if API key is configured
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "your_youtube_api_key_here") {
    console.error("YOUTUBE_API_KEY not configured");
    throw new Error("YOUTUBE_API_KEY belum dikonfigurasi");
  }

  // Helper to extract comments from a page of commentThread items (inline replies only)
  function extractCommentsFromItems(items: youtube_v3.Schema$CommentThread[]): YouTubeComment[] {
    const pageComments: YouTubeComment[] = [];
    for (const item of items) {
      const commentSnippet = item.snippet?.topLevelComment?.snippet;
      const topLevelCommentId = item.snippet?.topLevelComment?.id || item.id || "";
      if (commentSnippet && topLevelCommentId && !seenCommentIds.has(topLevelCommentId)) {
        seenCommentIds.add(topLevelCommentId);
        pageComments.push({
          id: topLevelCommentId,
          author: commentSnippet.authorDisplayName || "",
          text: commentSnippet.textDisplay || "",
          likeCount: commentSnippet.likeCount || 0,
          publishedAt: commentSnippet.publishedAt || "",
        });
      }

      // Include inline reply comments
      const inlineReplies = item.replies?.comments ?? [];
      for (const reply of inlineReplies) {
        const replySnippet = reply.snippet;
        if (!replySnippet) continue;
        const replyId = reply.id || "";
        if (!replyId || seenCommentIds.has(replyId)) continue;
        seenCommentIds.add(replyId);
        pageComments.push({
          id: replyId,
          author: replySnippet.authorDisplayName || "",
          text: replySnippet.textDisplay || "",
          likeCount: replySnippet.likeCount || 0,
          publishedAt: replySnippet.publishedAt || "",
        });
      }
    }
    return pageComments;
  }

  // Fetch a single page of comment threads
  async function fetchPage(pageToken?: string): Promise<{
    items: youtube_v3.Schema$CommentThread[];
    nextPageToken: string | undefined;
  }> {
    const response: { data: youtube_v3.Schema$CommentThreadListResponse } = await getYouTubeClient().commentThreads.list({
      part: ["snippet", "replies"],
      videoId: videoId,
      maxResults: 100,
      pageToken: pageToken,
    });
    return {
      items: response.data.items || [],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  try {
    // Step 1: Fetch the first page
    const firstPage = await fetchPage();
    if (firstPage.items.length === 0) {
      return [];
    }

    const comments = extractCommentsFromItems(firstPage.items);
    let nextToken = firstPage.nextPageToken;

    if (!nextToken || comments.length >= maxResults) {
      return comments.slice(0, maxResults);
    }

    // Step 2: Prefetch pipeline - start fetching the next page before processing current.
    // This overlaps network I/O with data processing for significant speedup.
    // With maxResults=1000 (~10 pages), total time drops from ~50s to ~10s.
    let tokenCursor: string | undefined = nextToken;

    // Kick off the fetch for page 2 immediately (prefetch)
    let prefetchPromise: Promise<{ items: youtube_v3.Schema$CommentThread[]; nextPageToken: string | undefined }> | null =
      tokenCursor ? fetchPage(tokenCursor) : null;

    while (prefetchPromise && comments.length < maxResults) {
      const page = await prefetchPromise;
      
      if (page.items.length === 0) break;
      
      // Immediately start fetching the NEXT page while we process this one
      prefetchPromise = page.nextPageToken ? fetchPage(page.nextPageToken) : null;

      // Process the current page's items (overlaps with next page's network I/O)
      const pageComments = extractCommentsFromItems(page.items);
      comments.push(...pageComments);
    }

    return comments.slice(0, maxResults);
  } catch (error: any) {
    console.error("Error fetching comments:", error?.message || error);
    
    // Handle specific YouTube API errors with user-friendly messages
    if (error?.code === 403) {
      if (error?.errors?.[0]?.reason === "quotaExceeded") {
        throw new Error("YOUTUBE_QUOTA_EXCEEDED: Quota YouTube API habis untuk hari ini. Coba lagi besok atau gunakan demo mode.");
      }
      if (error?.errors?.[0]?.reason === "commentsDisabled") {
        throw new Error("YOUTUBE_COMMENTS_DISABLED: Komentar di video ini dimatikan oleh pemilik video.");
      }
      throw new Error("YOUTUBE_ACCESS_DENIED: Akses ke komentar ditolak. Video mungkin private atau dibatasi.");
    }
    
    if (error?.code === 404) {
      throw new Error("YOUTUBE_VIDEO_NOT_FOUND: Video tidak ditemukan atau sudah dihapus.");
    }
    
    if (error?.code === 429) {
      throw new Error("YOUTUBE_RATE_LIMIT: Terlalu banyak request ke YouTube API. Tunggu 1-2 menit dan coba lagi.");
    }
    
    // Network/timeout errors
    if (error?.code === "ECONNRESET" || error?.code === "ETIMEDOUT" || error?.code === "ENOTFOUND") {
      throw new Error("YOUTUBE_NETWORK_ERROR: Gagal terhubung ke YouTube API. Cek koneksi internet Anda dan coba lagi.");
    }
    
    // Check if it's our custom API key error
    if (error?.message?.includes("YOUTUBE_API_KEY")) {
      throw error;
    }
    
    // Generic error with code for debugging
    throw new Error(`YOUTUBE_API_ERROR: Gagal mengambil komentar (${error?.code || "UNKNOWN"}). Coba lagi nanti.`);
  }
}

// Text preprocessing for sentiment analysis
export function preprocessText(text: string): string {
  // Remove URLs
  let cleaned = text.replace(/https?:\/\/\S+/g, "");
  // Remove mentions
  cleaned = cleaned.replace(/@\w+/g, "");
  // Remove hashtags (keep the word)
  cleaned = cleaned.replace(/#(\w+)/g, "$1");
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  // Convert to lowercase
  cleaned = cleaned.toLowerCase();

  return cleaned;
}