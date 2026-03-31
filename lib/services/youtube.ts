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
  } catch (error) {
    console.error("Error fetching video info:", error);
    return null;
  }
}

export async function getVideoComments(
  videoId: string,
  maxResults: number = 5000
): Promise<YouTubeComment[]> {
  const comments: YouTubeComment[] = [];
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
        part: ["snippet"],
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
        const commentSnippet = item.snippet?.topLevelComment?.snippet;
        if (commentSnippet) {
          comments.push({
            id: item.id || "",
            author: commentSnippet.authorDisplayName || "",
            text: commentSnippet.textDisplay || "",
            likeCount: commentSnippet.likeCount || 0,
            publishedAt: commentSnippet.publishedAt || "",
          });
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
    // Re-throw error so caller knows something went wrong
    throw error;
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
