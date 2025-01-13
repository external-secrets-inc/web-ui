import { format, toZonedTime } from 'date-fns-tz';

/**
 * Formatting options for the date utility.
 */
type FormatOptions = 'full' | 'dateOnly' | 'timeOnly' | 'americanDate' | 'readableDate' | 'shortDate';
type TimeZoneOptions = 'utc' | 'local';

/**
 * Formats a date/time to UTC or local format.
 * @param dateInput - The date input (ISO string, number, or Date object).
 * @param options - Formatting options.
 * @returns The formatted date string.
 */
export const formatDate = (
  dateInput: string | number | Date | null | undefined,
  options: { format: FormatOptions; timeZone?: TimeZoneOptions } = { format: 'full', timeZone: 'utc' }
): string => {
  if (dateInput === null || dateInput === undefined || (typeof dateInput === 'string' && dateInput.trim() === '')) {
    return 'Loading...';  // Empty or null-like inputs return fallback
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input');
  }

  const timeZone = options.timeZone || 'utc';

  const zonedDate = timeZone === 'local' ? date : toZonedTime(date, 'UTC');

  let formatString: string;
  switch (options.format) {
    case 'full':
      formatString = 'MMM/dd/yyyy HH:mm'; // Example: Jan/10/2025 12:34
      break;
    case 'dateOnly':
      formatString = 'yyyy-MM-dd'; // Example: 2025-01-10
      break;
    case 'timeOnly':
      formatString = 'HH:mm:ss'; // Example: 12:34:56
      break;
    case 'americanDate':
      formatString = 'MM/dd/yyyy'; // Example: 01/10/2025
      break;
    case 'readableDate':
      formatString = 'MMM dd, yyyy, hh:mm a'; // Example: Dec 28, 2024, 02:09 AM
      break;
    case 'shortDate':
      formatString = 'MMM dd'; // Example: Dec 28
      break;
    default:
      throw new Error('Unsupported format option');
  }

  const formattedDate = format(zonedDate, formatString);
  return timeZone === 'utc' ? `${formattedDate} UTC` : formattedDate;
};
