import { format, toZonedTime } from 'date-fns-tz';

/**
 * Formatting options for the date utility.
 */
type FormatOptions = 'isoUTC' | 'isoDateOnlyUTC' | 'full' | 'timeOnly' | 'americanDate' | 'readableDate' | 'shortDate' | 'readableDateNoTime';
type TimeZoneOptions = string;

/**
 * Formats a date/time to UTC or local format.
 * Handles Go's time.String() format by stripping monotonic clock readings.
 * 
 * @param dateInput - The date input (ISO string, number, Date object, or Go time string).
 * @param options - Formatting options.
 * @returns The formatted date string.
 */
export const formatDate = (
  dateInput: string | number | Date | null | undefined,
  options: { format: FormatOptions; timeZone?: TimeZoneOptions } = { format: 'isoUTC' }
): string => {
  if (dateInput === null || dateInput === undefined || (typeof dateInput === 'string' && dateInput.trim() === '')) {
    return 'Loading...';
  }

  let parsedInput = dateInput;
  
  if (typeof dateInput === 'string') {
    const monotonicIndex = dateInput.indexOf(' m=');
    if (monotonicIndex !== -1) {
      parsedInput = dateInput.substring(0, monotonicIndex).trim();
    }
  }

  const date = new Date(parsedInput);
  if (isNaN(date.getTime())) {
    console.error('Invalid date input:', dateInput);
    return 'Invalid date';
  }

  // Always use UTC for `isoUTC` and `isoDateOnlyUTC` formats
  const useUTC = options.format === 'isoUTC' || options.format === 'isoDateOnlyUTC';

  const timeZone = options.timeZone || 'local';
  const zonedDate = useUTC ? toZonedTime(date, 'UTC') : timeZone === 'local' ? date : toZonedTime(date, timeZone);

  let formatString: string;
  switch (options.format) {
    case 'full':
      formatString = 'MMM/dd/yyyy HH:mm:ss'; // Example: Jan/10/2025 12:34
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
    case 'readableDateNoTime':
      formatString = 'MMM dd, yyyy'; // Example: Dec 28, 2024
      break;
    case 'shortDate':
      formatString = 'MMM dd'; // Example: Dec 28
      break;
    case 'isoUTC':
      formatString = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"; // Example: 2025-01-10T12:34:56.000Z (always UTC)
      break;
    case 'isoDateOnlyUTC':
      formatString = 'yyyy-MM-dd'; // Example: 2025-01-10 (always UTC)
      break;
    default:
      console.error('Unsupported format option');
      return 'Invalid format';
  }

  const formattedDate = format(zonedDate, formatString);
  return formattedDate;
};

export const formatDuration = (nanos: number): string => {
  if (nanos >= 1e9) {
    const seconds = (nanos / 1e9).toFixed(3); // show 3 decimal places
    return `${seconds}s`;
  } else {
    const milliseconds = (nanos / 1e6).toFixed(3);
    return `${milliseconds}ms`;
  }
}
