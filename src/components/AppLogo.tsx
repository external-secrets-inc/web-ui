import LogoEsiFullWhite from '@/assets/logo-esi-full-white.svg?react';
import LogoEsiFull from '@/assets/logo-esi-full.svg?react';
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="mx-auto md:mx-0">
      <LogoEsiFullWhite className="h-7 hidden dark:inline" />
      <LogoEsiFull className="h-7 dark:hidden" />
    </Link>
  );
};

export default Logo;