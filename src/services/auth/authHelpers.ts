export function getAuthHeaders() {
  const authCookieName = '_auth';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${authCookieName}=`);
  const token = parts.length === 2 ? parts.pop()?.split(';').shift() : null;

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}