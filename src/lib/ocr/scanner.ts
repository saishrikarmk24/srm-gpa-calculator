import { createWorker, PSM } from 'tesseract.js';
import { ParsedOcrCourse, parseSrmResultText } from './parser';

export interface ScanProgress {
  status: string;
  progress: number;
}

/**
 * Scans an image file/blob and extracts SRM course records
 */
export async function scanSrmResultScreenshot(
  imageSource: File | Blob | string,
  onProgress?: (progress: ScanProgress) => void
): Promise<{ courses: ParsedOcrCourse[]; rawText: string }> {
  onProgress?.({ status: 'Loading OCR engine...', progress: 0.15 });

  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        const pct = Math.round((m.progress || 0) * 100);
        onProgress?.({
          status: `Scanning characters (${pct}%)...`,
          progress: 0.3 + (m.progress || 0) * 0.55,
        });
      } else if (m.status) {
        onProgress?.({
          status: `${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`,
          progress: Math.min(0.85, 0.1 + (m.progress || 0) * 0.2),
        });
      }
    },
  });

  // PSM 6 (SINGLE_BLOCK) prevents table cross-column line hopping
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
  });

  onProgress?.({ status: 'Scanning grades & credits...', progress: 0.85 });

  // Direct image recognition preserves natural antialiasing and subpixel curves
  const ret = await worker.recognize(imageSource);

  onProgress?.({ status: 'Parsing academic records...', progress: 0.95 });

  const courses = parseSrmResultText(ret.data.text);

  await worker.terminate();

  onProgress?.({ status: 'Done', progress: 1.0 });

  return {
    courses,
    rawText: ret.data.text,
  };
}
