
import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-sm border-b border-gray-200/80 z-20 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
