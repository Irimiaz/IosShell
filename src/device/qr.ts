// Error correction levels: how much of the code can be damaged and still be read.
// Higher levels make the code bigger, so they hold less data.
export const ECL_LEVELS = ['L', 'M', 'Q', 'H'] as const;
export type ErrorCorrectionLevel = (typeof ECL_LEVELS)[number];

// Most bytes a single QR code can hold (byte mode), per error correction level.
const MAX_BYTES: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

// Size of the text in bytes as UTF-8, which is what a QR code stores.
export function utf8Bytes(text: string): number {
  return unescape(encodeURIComponent(text)).length;
}

export function maxBytesFor(level: ErrorCorrectionLevel): number {
  return MAX_BYTES[level];
}

// True for colours written as #RGB or #RRGGBB.
export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

// ---- Document codes: a JSON object stored in a QR code ----

// Marks a QR code as holding a document object, so the app knows to build a PDF from it.
export const DOCUMENT_PREFIX = 'IOSSHELL-DOC:1:';

export type DocumentData = Record<string, unknown>;

function isObject(value: unknown): value is DocumentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Turns JSON text (which must be an object) into the text stored in the QR code.
export function encodeDocument(
  json: string,
): { ok: true; value: string } | { ok: false; reason: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'The data is not valid JSON.' };
  }
  if (!isObject(parsed)) {
    return {
      ok: false,
      reason: 'The data must be a JSON object, like {"name": "Ana"}.',
    };
  }
  const value = DOCUMENT_PREFIX + JSON.stringify(parsed);
  return { ok: true, value };
}

// Reads a scanned value. Returns the object, or null when the code is not a document.
export function decodeDocument(value: string): DocumentData | null {
  if (!value.startsWith(DOCUMENT_PREFIX)) return null;
  try {
    const parsed: unknown = JSON.parse(value.slice(DOCUMENT_PREFIX.length));
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
