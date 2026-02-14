import { compact, trim } from 'lodash-es';

/**
 * Serializes an array of text strings into a single string with paragraphs separated by double newlines.
 */
export function serializeTextProp(textArray: string[]): string {
  return compact(textArray.map(trim)).join('\n\n');
}