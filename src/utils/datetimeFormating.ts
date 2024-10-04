export function secondsToMMSS(totalSeconds: number): string {
  if (totalSeconds < 0) {
    throw new Error('The number of seconds cannot be negative.');
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}