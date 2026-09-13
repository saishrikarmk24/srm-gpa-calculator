/**
 * Security and Data Sanitization Utilities
 * Hardens user inputs, file uploads, and prevents injection/DoS attacks.
 */

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
export const MAX_COURSES_LIMIT = 30;
export const MAX_SEMESTERS_LIMIT = 12;

/**
 * Sanitizes text input by removing control characters, stripping HTML tags,
 * and restricting length to prevent script injection and layout breaking.
 */
export function sanitizeText(input: unknown, maxLength: number = 60): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Strip null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Strip HTML markup
    .replace(/<[^>]*>?/gm, '')
    // Normalize excessive whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates an uploaded screenshot file against strict security rules.
 */
export function validateUploadedFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  // 1. File size check (DoS prevention)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File is too large (${sizeInMb} MB). Maximum allowed size is 10 MB.`,
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'The uploaded file appears to be empty.' };
  }

  // 2. MIME type verification
  const mime = file.type.toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    return {
      isValid: false,
      error: 'Unsupported file type. Only PNG, JPEG, and WebP images are permitted.',
    };
  }

  // 3. Extension verification (if a file name is provided with extension)
  if (file.name && file.name.includes('.')) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      return {
        isValid: false,
        error: 'Invalid file extension. Please upload a standard image file (.png, .jpg, .webp).',
      };
    }
  }

  return { isValid: true };
}

/**
 * Sanitizes numeric input within safety boundaries
 */
export function sanitizeNumber(
  val: number | string | undefined | null,
  min: number,
  max: number,
  fallback: number
): number {
  if (val === undefined || val === null || val === '') return fallback;
  const parsed = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(parsed) || !isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}
