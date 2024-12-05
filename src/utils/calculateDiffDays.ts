export function calculateDiffDays(endDate: string, startDate: string = new Date().toISOString()): number {
  const endDateObj = new Date(endDate);
  const startDateObj = new Date(startDate);
  return Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
}