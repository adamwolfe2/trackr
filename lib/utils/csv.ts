/**
 * CSV generation utilities with proper escaping.
 *
 * - Handles commas, quotes, and newlines inside cell values.
 * - Neutralises formula-injection characters (=, +, -, @, \t, \r) by prefixing a tab.
 */

export function escapeCSV(value: string | number | null | undefined): string {
    if (value == null) return '';
    const str = String(value);
    // Neutralise formula injection — prefix with a tab character
    const safe = /^[=+\-@\t\r]/.test(str) ? `\t${str}` : str;
    // Wrap in double-quotes and escape any embedded double-quotes
    return `"${safe.replace(/"/g, '""')}"`;
}

export function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
    const headerLine = headers.map(escapeCSV).join(',');
    const dataLines = rows.map(row => row.map(escapeCSV).join(','));
    return [headerLine, ...dataLines].join('\n');
}
