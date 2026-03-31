import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// Default rate limits
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  api_analyze: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 analysis requests per minute
  },
  api_auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 auth attempts per hour
  },
};

// In-memory store untuk rate limiting (gunakan Redis untuk production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export function rateLimiter(
  request: NextRequest,
  type: string = "default"
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[type] || RATE_LIMITS.default;
  
  // Get client IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous";
  
  const key = `${ip}:${type}`;
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  // Reset jika window sudah lewat
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  // Check limit
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }
  
  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * CORS middleware configuration
 */
export function corsConfig(response: NextResponse): NextResponse {
  // Allowed origins
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "https://vidsense-ai.vercel.app",
    // Add your production domain here
  ];
  
  const origin = allowedOrigins.includes("*")
    ? "*"
    : allowedOrigins.join(",");
  
  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  
  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  
  // Content Security Policy (CSP)
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api-inference.huggingface.co https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  
  return response;
}

/**
 * Security headers untuk semua responses
 */
export function securityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Strict Transport Security (HSTS) - only for HTTPS
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  
  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  return response;
}

/**
 * API response wrapper dengan error handling
 */
export function apiResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Apply CORS and security headers
  corsConfig(response);
  securityHeaders(response);
  
  // Apply custom headers
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

/**
 * API error response wrapper
 */
export function apiError(
  message: string,
  status: number = 500,
  code?: string
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      code: code || "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    },
    { status }
  );
  
  // Apply CORS and security headers
  corsConfig(response);
  securityHeaders(response);
  
  return response;
}

/**
 * Validate API key (jika menggunakan custom API keys)
 */
export function validateAPIKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  
  if (!apiKey) {
    return false;
  }
  
  // In production, validate against database or environment
  const validKeys = process.env.API_KEYS?.split(",") || [];
  
  return validKeys.includes(apiKey);
}

/**
 * Log API requests untuk monitoring
 */
export function logAPIRequest(
  request: NextRequest,
  response: NextResponse,
  duration: number
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    duration: `${duration}ms`,
    ip: request.headers.get("x-forwarded-for") || "anonymous",
    userAgent: request.headers.get("user-agent"),
  };
  
  // Log ke console (gunakan logging service untuk production)
  console.log("API Request:", JSON.stringify(logData));
}

/**
 * Middleware wrapper untuk API routes
 */
export function withAPIMiddleware(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: string;
    requireAuth?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      // Check rate limit
      if (options.rateLimit) {
        const rateLimit = rateLimiter(request, options.rateLimit);
        
        if (!rateLimit.allowed) {
          const response = apiError(
            "Terlalu banyak request. Silakan coba lagi nanti.",
            429,
            "RATE_LIMIT_EXCEEDED"
          );
          
          response.headers.set(
            "Retry-After",
            Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          );
          
          return response;
        }
      }
      
      // Check auth (jika diperlukan)
      if (options.requireAuth) {
        // Implementasi auth check di sini
        // Contoh: validateJWT(request)
      }
      
      // Execute handler
      const response = await handler(request);
      
      // Log request
      const duration = Date.now() - startTime;
      logAPIRequest(request, response, duration);
      
      return response;
    } catch (error) {
      console.error("API Error:", error);
      
      const duration = Date.now() - startTime;
      const errorResponse = apiError(
        error instanceof Error ? error.message : "Terjadi kesalahan internal",
        500,
        "INTERNAL_ERROR"
      );
      
      logAPIRequest(request, errorResponse, duration);
      
      return errorResponse;
    }
  };
}
