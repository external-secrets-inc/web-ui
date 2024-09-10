import esiLogo from '@/assets/logo-esi.svg';

export function Home() {
  return (
    <>
      <img
        src={esiLogo}
        className="animate-spin [animation-duration:10s] mb-10 mx-auto max-w-24"
        alt="External Secrets"
      />
      <h1 className="text-3xl">ESI on the block, baby!</h1>
    </>
  )
}