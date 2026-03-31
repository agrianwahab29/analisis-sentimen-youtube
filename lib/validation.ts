/**
 * VidSense AI - Input Validation Utilities
 * Validasi untuk URL, input user, dan data sanitization
 */

// Regex patterns untuk validasi
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
];

const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_MIN_LENGTH = 8;

// Types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validasi URL YouTube
 * Mengecek apakah URL valid dan extract video ID
 */
export function validateYouTubeURL(url: string): ValidationResult {
  // Check empty
  if (!url || url.trim() === "") {
    return {
      isValid: false,
      error: "URL video tidak boleh kosong",
    };
  }

  const trimmedUrl = url.trim();

  // Check URL format dasar
  if (!URL_REGEX.test(trimmedUrl)) {
    return {
      isValid: false,
      error: "Format URL tidak valid",
    };
  }

  // Check YouTube patterns
  let isYouTube = false;
  let videoId: string | null = null;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      isYouTube = true;
      videoId = match[1];
      break;
    }
  }

  if (!isYouTube) {
    return {
      isValid: false,
      error: "URL bukan link YouTube yang valid. Format yang didukung: youtube.com/watch?v=... atau youtu.be/...",
    };
  }

  // Validate video ID length
  if (videoId && videoId.length !== 11) {
    return {
      isValid: false,
      error: "ID video YouTube tidak valid",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Extract video ID dari URL YouTube
 */
export function extractVideoId(url: string): string | null {
  const trimmedUrl = url.trim();

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validasi email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === "") {
    return {
      isValid: false,
      error: "Email tidak boleh kosong",
    };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: "Format email tidak valid (contoh: nama@email.com)",
    };
  }

  // Check common email domains (optional validation)
  const validDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  const domain = trimmedEmail.split("@")[1];

  if (!domain) {
    return {
      isValid: false,
      error: "Domain email tidak valid",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validasi password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: "Password tidak boleh kosong",
    };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password minimal ${PASSWORD_MIN_LENGTH} karakter`,
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: "Password harus mengandung minimal 1 angka",
    };
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password harus mengandung minimal 1 huruf",
    };
  }

  // Check for at least one uppercase
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password harus mengandung minimal 1 huruf besar",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validasi nama
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim() === "") {
    return {
      isValid: false,
      error: "Nama tidak boleh kosong",
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: "Nama minimal 2 karakter",
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: "Nama maksimal 100 karakter",
    };
  }

  // Check for valid characters (letters, spaces, and common Indonesian characters)
  if (!/^[\p{L}\s\-'\.]+$/u.test(trimmedName)) {
    return {
      isValid: false,
      error: "Nama hanya boleh mengandung huruf, spasi, dan tanda baca standar",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Sanitasi input teks
 * Mencegah XSS dan injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .trim()
    // Remove potentially dangerous HTML
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    // Remove null bytes
    .replace(/\0/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ");
}

/**
 * Sanitasi untuk display (HTML encoding)
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return "";

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validasi kode voucher
 */
export function validateVoucherCode(code: string): ValidationResult {
  if (!code || code.trim() === "") {
    return {
      isValid: false,
      error: "Kode voucher tidak boleh kosong",
    };
  }

  const trimmedCode = code.trim().toUpperCase();

  // Check format (alphanumeric, 6-20 characters)
  if (!/^[A-Z0-9]{6,20}$/.test(trimmedCode)) {
    return {
      isValid: false,
      error: "Kode voucher tidak valid (6-20 karakter alphanumeric)",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validasi jumlah komentar
 */
export function validateCommentCount(count: number): ValidationResult {
  if (isNaN(count) || count <= 0) {
    return {
      isValid: false,
      error: "Jumlah komentar harus lebih dari 0",
    };
  }

  if (count > 5000) {
    return {
      isValid: false,
      error: "Maksimal 5000 komentar per analisis",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validasi URL secara umum
 */
export function validateURL(url: string): ValidationResult {
  if (!url || url.trim() === "") {
    return {
      isValid: false,
      error: "URL tidak boleh kosong",
    };
  }

  try {
    new URL(url.trim());
    return {
      isValid: true,
    };
  } catch {
    return {
      isValid: false,
      error: "Format URL tidak valid",
    };
  }
}

// Re-export untuk kompatibilitas
export * from "./utils";
