/**
 * Error handling utilities for external API calls
 * AGR-26: Comprehensive error handling with retry mechanism
 */

export interface APIError extends Error {
  code: string;
  statusCode?: number;
  retryable: boolean;
  originalError?: any;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Create a structured API error
 */
export function createAPIError(
  code: string,
  message: string,
  statusCode?: number,
  retryable: boolean = false,
  originalError?: any
): APIError {
  const error = new Error(message) as APIError;
  error.code = code;
  error.statusCode = statusCode;
  error.retryable = retryable;
  error.originalError = originalError;
  return error;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  errorClassifier?: (error: any) => { retryable: boolean; code: string; message: string }
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Classify error
      let errorInfo: { retryable: boolean; code: string; message: string };
      
      if (errorClassifier) {
        errorInfo = errorClassifier(error);
      } else {
        errorInfo = classifyGenericError(error);
      }

      // Don't retry if not retryable or this was the last attempt
      if (!errorInfo.retryable || attempt === fullConfig.maxRetries) {
        throw createAPIError(
          errorInfo.code,
          errorInfo.message,
          (error as any)?.statusCode || (error as any)?.code,
          errorInfo.retryable,
          error
        );
      }

      // Calculate delay and wait
      const delay = calculateBackoffDelay(attempt, fullConfig);
      console.log(`Retry attempt ${attempt + 1}/${fullConfig.maxRetries} after ${delay}ms. Error: ${errorInfo.code}`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Classify generic errors
 */
function classifyGenericError(error: any): { retryable: boolean; code: string; message: string } {
  // Network errors - retryable
  if (error?.code === "ECONNRESET" || error?.code === "ETIMEDOUT" || error?.code === "ENOTFOUND") {
    return {
      retryable: true,
      code: "NETWORK_ERROR",
      message: "Koneksi terputus. Mencoba ulang...",
    };
  }

  // Rate limiting - retryable with backoff
  if (error?.statusCode === 429 || error?.code === 429) {
    return {
      retryable: true,
      code: "RATE_LIMIT",
      message: "Terlalu banyak permintaan. Menunggu...",
    };
  }

  // Server errors (5xx) - retryable
  if (error?.statusCode >= 500 && error?.statusCode < 600) {
    return {
      retryable: true,
      code: "SERVER_ERROR",
      message: "Server sementara tidak tersedia. Mencoba ulang...",
    };
  }

  // Client errors (4xx) - not retryable
  if (error?.statusCode >= 400 && error?.statusCode < 500) {
    return {
      retryable: false,
      code: "CLIENT_ERROR",
      message: error?.message || "Permintaan tidak valid",
    };
  }

  // Default - not retryable
  return {
    retryable: false,
    code: "UNKNOWN_ERROR",
    message: error?.message || "Terjadi kesalahan yang tidak diketahui",
  };
}

/**
 * YouTube API error classifier
 */
export function classifyYouTubeError(error: any): { retryable: boolean; code: string; message: string } {
  if (error?.code === 403) {
    if (error?.errors?.[0]?.reason === "quotaExceeded") {
      return {
        retryable: false,
        code: "YOUTUBE_QUOTA_EXCEEDED",
        message: "Quota YouTube API habis untuk hari ini. Silakan coba lagi besok atau gunakan demo mode.",
      };
    }
    if (error?.errors?.[0]?.reason === "commentsDisabled") {
      return {
        retryable: false,
        code: "YOUTUBE_COMMENTS_DISABLED",
        message: "Komentar di video ini dimatikan oleh pemilik video.",
      };
    }
    return {
      retryable: false,
      code: "YOUTUBE_ACCESS_DENIED",
      message: "Akses ke video ditolak. Video mungkin private atau dibatasi.",
    };
  }

  if (error?.code === 404) {
    return {
      retryable: false,
      code: "YOUTUBE_VIDEO_NOT_FOUND",
      message: "Video tidak ditemukan atau sudah dihapus.",
    };
  }

  if (error?.code === 429) {
    return {
      retryable: true,
      code: "YOUTUBE_RATE_LIMIT",
      message: "Terlalu banyak request ke YouTube API. Menunggu sebentar...",
    };
  }

  if (error?.code === "ECONNRESET" || error?.code === "ETIMEDOUT" || error?.code === "ENOTFOUND") {
    return {
      retryable: true,
      code: "YOUTUBE_NETWORK_ERROR",
      message: "Gagal terhubung ke YouTube API. Mencoba ulang...",
    };
  }

  return {
    retryable: true,
    code: "YOUTUBE_API_ERROR",
    message: "Gagal mengambil data dari YouTube. Mencoba ulang...",
  };
}

/**
 * HuggingFace API error classifier
 */
export function classifyHuggingFaceError(error: any): { retryable: boolean; code: string; message: string } {
  // Model loading - retryable (model might be warming up)
  if (error?.message?.includes("currently loading") || error?.statusCode === 503) {
    return {
      retryable: true,
      code: "HF_MODEL_LOADING",
      message: "Model sedang dimuat. Menunggu...",
    };
  }

  // Rate limiting
  if (error?.statusCode === 429) {
    return {
      retryable: true,
      code: "HF_RATE_LIMIT",
      message: "Rate limit HuggingFace tercapai. Menunggu...",
    };
  }

  // Authentication error
  if (error?.statusCode === 401 || error?.statusCode === 403) {
    return {
      retryable: false,
      code: "HF_AUTH_ERROR",
      message: "Token HuggingFace tidak valid atau expired.",
    };
  }

  // Model not found
  if (error?.statusCode === 404) {
    return {
      retryable: false,
      code: "HF_MODEL_NOT_FOUND",
      message: "Model analisis sentimen tidak ditemukan.",
    };
  }

  // Timeout - retryable
  if (error?.code === "ETIMEDOUT" || error?.message?.includes("timeout")) {
    return {
      retryable: true,
      code: "HF_TIMEOUT",
      message: "Request ke HuggingFace timeout. Mencoba ulang...",
    };
  }

  // Network errors - retryable
  if (error?.code === "ECONNRESET" || error?.code === "ENOTFOUND") {
    return {
      retryable: true,
      code: "HF_NETWORK_ERROR",
      message: "Koneksi ke HuggingFace terputus. Mencoba ulang...",
    };
  }

  return {
    retryable: true,
    code: "HF_API_ERROR",
    message: "Gagal menganalisis sentimen. Mencoba ulang...",
  };
}

/**
 * OpenRouter API error classifier
 */
export function classifyOpenRouterError(error: any): { retryable: boolean; code: string; message: string } {
  // Rate limiting
  if (error?.statusCode === 429) {
    return {
      retryable: true,
      code: "OR_RATE_LIMIT",
      message: "Rate limit OpenRouter tercapai. Menunggu...",
    };
  }

  // Authentication
  if (error?.statusCode === 401) {
    return {
      retryable: false,
      code: "OR_AUTH_ERROR",
      message: "API key OpenRouter tidak valid.",
    };
  }

  // Model not found
  if (error?.statusCode === 404) {
    return {
      retryable: false,
      code: "OR_MODEL_NOT_FOUND",
      message: "Model AI tidak ditemukan.",
    };
  }

  // Context too long
  if (error?.statusCode === 413 || error?.message?.includes("context length")) {
    return {
      retryable: false,
      code: "OR_CONTEXT_TOO_LONG",
      message: "Data terlalu besar untuk diproses AI.",
    };
  }

  // Server errors - retryable
  if (error?.statusCode >= 500 && error?.statusCode < 600) {
    return {
      retryable: true,
      code: "OR_SERVER_ERROR",
      message: "Server OpenRouter sementara tidak tersedia. Mencoba ulang...",
    };
  }

  // Timeout
  if (error?.code === "ETIMEDOUT" || error?.message?.includes("timeout")) {
    return {
      retryable: true,
      code: "OR_TIMEOUT",
      message: "Request ke OpenRouter timeout. Mencoba ulang...",
    };
  }

  // Network errors
  if (error?.code === "ECONNRESET" || error?.code === "ENOTFOUND") {
    return {
      retryable: true,
      code: "OR_NETWORK_ERROR",
      message: "Koneksi ke OpenRouter terputus. Mencoba ulang...",
    };
  }

  return {
    retryable: false,
    code: "OR_API_ERROR",
    message: "Gagal menghasilkan insight AI. Menggunakan fallback...",
  };
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: APIError | Error): {
  title: string;
  message: string;
  action?: string;
} {
  const code = (error as APIError).code || "UNKNOWN";
  
  const errorMessages: Record<string, { title: string; message: string; action?: string }> = {
    YOUTUBE_QUOTA_EXCEEDED: {
      title: "Quota YouTube Habis",
      message: "Quota API YouTube untuk hari ini sudah habis.",
      action: "Silakan coba lagi besok atau gunakan demo mode untuk testing.",
    },
    YOUTUBE_COMMENTS_DISABLED: {
      title: "Komentar Dimatikan",
      message: "Pemilik video telah mematikan fitur komentar.",
      action: "Pilih video lain yang memiliki komentar aktif.",
    },
    YOUTUBE_ACCESS_DENIED: {
      title: "Akses Ditolak",
      message: "Video ini mungkin private atau dibatasi.",
      action: "Pastikan video bersifat publik dan dapat diakses.",
    },
    YOUTUBE_VIDEO_NOT_FOUND: {
      title: "Video Tidak Ditemukan",
      message: "Video yang Anda cari tidak ditemukan atau sudah dihapus.",
      action: "Periksa kembali URL video Anda.",
    },
    YOUTUBE_RATE_LIMIT: {
      title: "Terlalu Banyak Request",
      message: "Anda telah melakukan terlalu banyak request ke YouTube.",
      action: "Tunggu beberapa saat dan coba lagi.",
    },
    HF_RATE_LIMIT: {
      title: "Rate Limit Tercapai",
      message: "Rate limit untuk analisis sentimen tercapai.",
      action: "Tunggu sebentar dan coba lagi.",
    },
    HF_AUTH_ERROR: {
      title: "Autentikasi Gagal",
      message: "Token HuggingFace tidak valid.",
      action: "Hubungi admin untuk memeriksa konfigurasi API.",
    },
    HF_MODEL_NOT_FOUND: {
      title: "Model Tidak Tersedia",
      message: "Model analisis sentimen tidak ditemukan.",
      action: "Sistem akan menggunakan metode alternatif.",
    },
    OR_RATE_LIMIT: {
      title: "Rate Limit AI Tercapai",
      message: "Rate limit untuk AI insight tercapai.",
      action: "Tunggu sebentar dan coba lagi, atau gunakan analisis basic.",
    },
    OR_AUTH_ERROR: {
      title: "Autentikasi AI Gagal",
      message: "API key OpenRouter tidak valid.",
      action: "Hubungi admin untuk memeriksa konfigurasi API.",
    },
    OR_CONTEXT_TOO_LONG: {
      title: "Data Terlalu Besar",
      message: "Jumlah komentar terlalu banyak untuk diproses AI.",
      action: "Coba analisis dengan video yang memiliki komentar lebih sedikit.",
    },
    NETWORK_ERROR: {
      title: "Masalah Koneksi",
      message: "Gagal terhubung ke server. Periksa koneksi internet Anda.",
      action: "Coba lagi dalam beberapa saat.",
    },
    RATE_LIMIT: {
      title: "Terlalu Banyak Request",
      message: "Anda telah melakukan terlalu banyak request.",
      action: "Tunggu beberapa saat dan coba lagi.",
    },
    SERVER_ERROR: {
      title: "Server Error",
      message: "Server sementara mengalami masalah.",
      action: "Tim kami telah diberitahu. Silakan coba lagi nanti.",
    },
  };

  const formatted = errorMessages[code];
  if (formatted) {
    return formatted;
  }

  // Generic error
  return {
    title: "Terjadi Kesalahan",
    message: error.message || "Terjadi kesalahan yang tidak diketahui.",
    action: "Silakan coba lagi. Jika masalah berlanjut, hubungi support.",
  };
}
