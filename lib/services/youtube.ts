import { google, youtube_v3 } from "googleapis";

// Initialize YouTube API client
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY || "",
});

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
    const response = await youtube.videos.list({
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

  try {
    while (comments.length < maxResults) {
      const response = await youtube.commentThreads.list({
        part: ["snippet"],
        videoId: videoId,
        maxResults: Math.min(100, maxResults - comments.length),
        pageToken: nextPageToken,
      }) as youtube_v3.Schema$CommentThreadListResponse;

      const items = response.items || [];

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

      nextPageToken = response.nextPageToken || undefined;
      if (!nextPageToken) break;
    }

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    // Return empty array if comments are disabled or other error
    return [];
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
