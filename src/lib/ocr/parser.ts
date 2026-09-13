import { CourseInput } from '../calculations/sgpa';
import { sanitizeText, MAX_COURSES_LIMIT } from '../security';

export interface ParsedOcrCourse {
  code: string;
  name: string;
  credits: number;
  grade: string;
}

/**
 * Normalizes common OCR misreadings of SRM grades
 */
export function normalizeOcrGrade(raw: string): string {
  const cleaned = raw.trim().toUpperCase();

  // In SRM web portals, 'O' (Outstanding) is frequently misread as degree symbol, zero, or C
  if (['°', '0', 'O', 'Q', '()', 'U', 'C', 'O.'].includes(cleaned)) {
    return 'O';
  }
  if (cleaned.includes('A+') || cleaned === 'A*' || cleaned === 'A+4') {
    return 'A+';
  }
  if (cleaned.includes('B+') || cleaned === 'B*') {
    return 'B+';
  }
  if (cleaned === 'A') return 'A';
  if (cleaned === 'B' || cleaned === '8') return 'B';
  if (cleaned === 'P') return 'P';
  if (cleaned === 'F') return 'F';
  if (cleaned === 'AB' || cleaned === 'ABS') return 'Ab';

  return 'O'; // Fallback
}

/**
 * Normalizes credits from common OCR font misreadings
 */
export function normalizeOcrCredits(raw: string): number {
  if (!raw) return 3;
  const cLow = raw.trim().toLowerCase();

  // In SRM portal font, '4' is routinely recognized by Tesseract as 's' or '5'
  if (['s', '5', '$'].includes(cLow)) return 4;
  if (['b', '8'].includes(cLow)) return 3;
  if (['.', ' '].includes(cLow)) return 4;
  if (['l', 'i', '|', '1'].includes(cLow)) return 1;

  const num = parseFloat(cLow);
  if (!isNaN(num) && num > 0 && num <= 12) {
    return num;
  }

  return 3; // Standard academic default
}

/**
 * Robustly parses text from an SRM result page screenshot
 */
export function parseSrmResultText(text: string): ParsedOcrCourse[] {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const courses: ParsedOcrCourse[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains a Pass/Fail/Absent indicator or Grade + Result pattern
    // e.g. "21MAB204T PROBABILITY s ° Pass" or "DATABASE . ° pass" or "SOCIAL 2 O pass"
    const passFailMatch = line.match(
      /(.*?)\s+([0-9sSbBlLiI\.\*\$]+)?\s*([°O0oQCuUA-Fa-f\+\*\#]+)\s+(?:PASS|FAIL|ABSENT|pass|fail|absent)\b/i
    );

    if (passFailMatch) {
      const prefix = (passFailMatch[1] || '').trim();
      const rawCredit = (passFailMatch[2] || '').trim();
      const rawGrade = (passFailMatch[3] || '').trim();

      const grade = normalizeOcrGrade(rawGrade);
      const credits = normalizeOcrCredits(rawCredit);

      // Extract Course Code and Description
      let code = '';
      let desc = prefix;
      const codeMatch = prefix.match(/^([0-9A-Za-z]{6,10})\s+(.*)/);
      if (codeMatch) {
        code = codeMatch[1].toUpperCase();
        desc = codeMatch[2];
      }

      // Collect multi-line course descriptions
      let fullDesc = desc;
      let j = i + 1;
      while (
        j < lines.length &&
        !lines[j].match(/(?:PASS|FAIL|ABSENT|pass|fail|absent)/i) &&
        !lines[j].match(/^[0-9A-Za-z]{6,10}\b/)
      ) {
        if (!lines[j].includes('May') && !lines[j].includes('Nov') && !lines[j].includes('COURSE') && lines[j].length > 1) {
          fullDesc += ' ' + lines[j];
        }
        j++;
      }

      const cleanName = (code ? `${code} - ${fullDesc}` : fullDesc || `Course ${courses.length + 1}`)
        .replace(/\s+/g, ' ')
        .trim();

      if (courses.length < MAX_COURSES_LIMIT) {
        courses.push({
          code: sanitizeText(code, 12),
          name: sanitizeText(cleanName, 48),
          credits,
          grade,
        });
      }
    }
  }

  // Fallback: If line-based pass/fail didn't match (e.g. cropped without PASS column)
  if (courses.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/COURSE|CREDIT|GRADE|May|Nov/i.test(line)) continue;

      const tokens = line.split(/\s+/);
      if (tokens.length >= 2) {
        const lastToken = tokens[tokens.length - 1];
        const secondLast = tokens[tokens.length - 2];
        const gradeCand = normalizeOcrGrade(lastToken);
        const credCand = normalizeOcrCredits(secondLast);

        if (gradeCand && credCand > 0 && courses.length < MAX_COURSES_LIMIT) {
          const courseName = tokens.slice(0, tokens.length - 2).join(' ') || `Course ${courses.length + 1}`;
          courses.push({
            code: '',
            name: sanitizeText(courseName, 48),
            credits: credCand,
            grade: gradeCand,
          });
        }
      }
    }
  }

  return courses;
}

/**
 * Converts parsed OCR courses to CourseInput format for the calculator
 */
export function ocrToCourseInputs(parsed: ParsedOcrCourse[]): CourseInput[] {
  return parsed.map((item, index) => ({
    id: `course-ocr-${Date.now()}-${index}`,
    name: item.name,
    credits: item.credits,
    grade: item.grade,
  }));
}
