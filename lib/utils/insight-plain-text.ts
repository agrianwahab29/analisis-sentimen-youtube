/**
 * Converts model output that may contain HTML/Markdown-ish syntax into plain text
 * suitable for end users (no raw tags like <a>, <br>, etc.).
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\u0022",
  apos: "\u0027",
  nbsp: " ",
};

function decodeHtmlEntities(text: string): string {
  let s = text;
  s = s.replace(/&#x([0-9a-f]{1,6});/gi, (match, hex: string) => {
    const code = parseInt(hex, 16);
    if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
    try {
      return String.fromCodePoint(code);
    } catch {
      return match;
    }
  });
  s = s.replace(/&#(\d{1,7});/g, (match, dec: string) => {
    const code = parseInt(dec, 10);
    if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
    try {
      return String.fromCodePoint(code);
    } catch {
      return match;
    }
  });
  s = s.replace(/&([a-z]+);/gi, (match, name: string) => {
    const key = name.toLowerCase();
    return NAMED_ENTITIES[key] ?? match;
  });
  return s;
}

/** Collapse repeated passes so &amp;lt; etc. eventually flatten */
function decodeHtmlEntitiesDeep(text: string, maxPasses = 4): string {
  let prev = "";
  let cur = text;
  for (let i = 0; i < maxPasses && cur !== prev; i++) {
    prev = cur;
    cur = decodeHtmlEntities(cur);
  }
  return cur;
}

function stripHtmlNoise(s: string): string {
  let out = s;
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, "\n");
  out = out.replace(/<\s*(p|div|li|tr|span)\b[^>]*>/gi, "");
  out = out.replace(/<[^>]+>/g, "");
  return out;
}

/**
 * Model sometimes returns entity-encoded HTML (`&lt;a...`) — decode and strip
 * again in a loop until stable so users never see markup.
 */
export function sanitizeInsightPlainText(input: string): string {
  if (!input || typeof input !== "string") return "";

  let s = input.trim();
  for (let pass = 0; pass < 6; pass++) {
    const before = s;
    s = stripHtmlNoise(s);
    s = decodeHtmlEntitiesDeep(s);
    if (s === before) break;
  }
  s = stripHtmlNoise(s);

  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  s = s.replace(/\r\n/g, "\n");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/[ \t]{2,}/g, " ");

  return s.trim();
}
