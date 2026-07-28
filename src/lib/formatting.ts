import type { LanguageCode } from '@/types/database';

const LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  rw: 'rw-RW',
};

const AVERAGE_WPM = 200;

/** Format a date for the chosen language. */
export function formatDate(
  input: string | Date,
  lang: LanguageCode,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(LOCALE_MAP[lang], opts).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', opts).format(date);
  }
}

/** Minutes to read (min 1). */
export function readingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / AVERAGE_WPM));
}
