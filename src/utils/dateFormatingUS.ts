export function formatDateToUS(dateString: string) {
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${year}`;
};