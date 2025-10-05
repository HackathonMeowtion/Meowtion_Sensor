
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 z-10 flex items-center justify-center">
      <h1 className="text-xl font-semibold text-gray-900">
        Cat Identifier
      </h1>
    </header>
  );
};

export default Header;
