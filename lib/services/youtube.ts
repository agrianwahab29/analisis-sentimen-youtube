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
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^\&\s]+)/,
    /youtube\.com\/shorts\/([^\&\s]+)/,
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

export async function getVideoComments(
  videoId: string,
  maxResults: number = 5000
): Promise<YouTubeComment[]> {
  const comments: YouTubeComment[] = [];
  const seenCommentIds = new Set<string>();
  let nextPageToken: string | undefined = undefined;
  
  // Check if API key is configured
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "your_youtube_api_key_here") {
    console.error("YOUTUBE_API_KEY not configured");
    throw new Error("YOUTUBE_API_KEY belum dikonfigurasi");
  }

  try {
    console.log(`Fetching comments for video: ${videoId}`);
    let pageCount = 0;
    
    while (comments.length < maxResults) {
      pageCount++;
      console.log(`Fetching page ${pageCount}, current comments: ${comments.length}`);
      
      const response: { data: youtube_v3.Schema$CommentThreadListResponse } = await getYouTubeClient().commentThreads.list({
        part: ["snippet", "replies"],
        videoId: videoId,
        maxResults: Math.min(100, maxResults - comments.length),
        pageToken: nextPageToken,
      });

      const items = response.data.items || [];
      console.log(`Received ${items.length} items from YouTube API`);

      if (items.length === 0) {
        console.log("No more comments available");
        break;
      }

      for (const item of items) {
        if (comments.length >= maxResults) break;
        const commentSnippet = item.snippet?.topLevelComment?.snippet;
        const topLevelCommentId = item.snippet?.topLevelComment?.id || item.id || "";
        if (commentSnippet) {
          if (topLevelCommentId && !seenCommentIds.has(topLevelCommentId)) {
            seenCommentIds.add(topLevelCommentId);
            comments.push({
              id: topLevelCommentId,
              author: commentSnippet.authorDisplayName || "",
              text: commentSnippet.textDisplay || "",
              likeCount: commentSnippet.likeCount || 0,
              publishedAt: commentSnippet.publishedAt || "",
            });
          }
        }

        if (comments.length >= maxResults) break;

        // Include reply comments as well (to align with YouTube comment count closer).
        const inlineReplies = item.replies?.comments ?? [];
        for (const reply of inlineReplies) {
          if (comments.length >= maxResults) break;
          const replySnippet = reply.snippet;
          if (!replySnippet) continue;
          const replyId = reply.id || "";
          if (!replyId || seenCommentIds.has(replyId)) continue;
          seenCommentIds.add(replyId);
          comments.push({
            id: replyId,
            author: replySnippet.authorDisplayName || "",
            text: replySnippet.textDisplay || "",
            likeCount: replySnippet.likeCount || 0,
            publishedAt: replySnippet.publishedAt || "",
          });
        }

        // If there are more replies than inline payload, fetch the rest by parentId.
        const totalReplyCount = item.snippet?.totalReplyCount || 0;
        if (
          comments.length < maxResults &&
          totalReplyCount > inlineReplies.length &&
          item.snippet?.topLevelComment?.id
        ) {
          let replyPageToken: string | undefined = undefined;
          do {
            const remaining = maxResults - comments.length;
            if (remaining <= 0) break;

            const replyResponse: { data: youtube_v3.Schema$CommentListResponse } =
              await getYouTubeClient().comments.list({
                part: ["snippet"],
                parentId: item.snippet.topLevelComment.id,
                maxResults: Math.min(100, remaining),
                pageToken: replyPageToken,
              });

            const replyItems = replyResponse.data.items || [];
            for (const reply of replyItems) {
              if (comments.length >= maxResults) break;
              const replySnippet = reply.snippet;
              if (!replySnippet) continue;
              const replyId = reply.id || "";
              if (!replyId || seenCommentIds.has(replyId)) continue;
              seenCommentIds.add(replyId);
              comments.push({
                id: replyId,
                author: replySnippet.authorDisplayName || "",
                text: replySnippet.textDisplay || "",
                likeCount: replySnippet.likeCount || 0,
                publishedAt: replySnippet.publishedAt || "",
              });
            }

            replyPageToken = replyResponse.data.nextPageToken || undefined;
          } while (replyPageToken && comments.length < maxResults);
        }
      }

      nextPageToken = response.data.nextPageToken || undefined;
      if (!nextPageToken) {
        console.log("No more pages available");
        break;
      }
    }

    console.log(`Total comments fetched: ${comments.length}`);
    return comments;
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
