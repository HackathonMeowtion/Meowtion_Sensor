
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm border-t border-gray-200/80 z-10 flex items-center justify-around px-4 pb-4">
      <div className="flex flex-col items-center text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.993.883L4 8v10a1 1 0 001 1h10a1 1 0 001-1V8l-.007-.117A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5H8v1h4V7zM8 6a2 2 0 114 0v1H8V6z" />
        </svg>
        <span className="text-xs font-medium mt-1">Identify</span>
      </div>
      <div className="flex flex-col items-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8h8V6z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium mt-1">Gallery</span>
      </div>
    </footer>
  );
};

export default Footer;
