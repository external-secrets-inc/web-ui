import createStore from 'react-auth-kit/createStore';

// `react-auth-kit` uses refresh tokens for keeping user sessions valid,
// requiring backend support that we currently lack. As a result, we solely rely
// on cookie expiration for session invalidation, prompting users to re-login.
// It seems that either the library or the browser infers the cookie’s
// `expiresIn` value from the JWT token set on the backend. Any adjustments to
// expiration times should be done there.
const authStore = createStore({
  authName: '_auth',
  authType: 'cookie',
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'https:',
});

export default authStore;