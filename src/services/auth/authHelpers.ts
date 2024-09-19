export async function getAuthHeaders(manualToken?: string): Promise<{ [key: string]: string }> {
  const token = manualToken || await getTokenFromCookies();
  if (!token) {
    throw new Error('Authentication token not found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function getTokenFromCookies(maxRetries = 20, delay = 200): Promise<string | null> {
  const authCookieName = '_auth';

  // TODO: Trying this to see if it fixes the issue with the cookie not being found right after login
  // We should have a better solution for this
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${authCookieName}=`);
    const token = parts.length === 2 ? parts.pop()?.split(';').shift() || null : null;
    if (token) {
      return token;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return null;
}