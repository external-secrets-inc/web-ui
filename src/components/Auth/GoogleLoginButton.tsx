import React from 'react';

interface GoogleLoginButtonProps {
  onClick: () => void;
  loading?: boolean;
} 

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onClick, loading }) => (
  <button
    type="button"
    className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-60"
    onClick={onClick}
    disabled={loading}
    aria-label="Sign in with Google"
  >
    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5" />
    <span>{loading ? 'Signing in…' : 'Sign in with Google'}</span>
  </button>
);

export default GoogleLoginButton;
