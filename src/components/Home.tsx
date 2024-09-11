import esiLogo from '@/assets/logo-esi.svg';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const signOut = useSignOut();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <img
        src={esiLogo}
        className="animate-spin [animation-duration:10s] mb-10 mx-auto max-w-24"
        alt="External Secrets"
      />
      <h1 className="text-3xl">ESI on the block, baby!</h1>
      <button
        onClick={handleSignOut}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Sign Out
      </button>
    </div>
  );
}