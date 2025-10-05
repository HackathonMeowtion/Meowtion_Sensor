
import React from 'react';

export type FooterTab = 'identify' | 'gallery' | 'map' | 'profile';

interface FooterProps {
  activeTab: FooterTab;
  onTabChange: (tab: FooterTab) => void;
}

const tabs: { id: FooterTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: 'identify',
    label: 'Identify',
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${active ? 'text-blue-600' : 'text-gray-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${active ? 'text-blue-600' : 'text-gray-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a2 2 0 012-2h12a2 2 0 012 2v7.5M8 21h8M12 17v4M4 15l3.086-3.086a2 2 0 012.828 0L17 19"
        />
      </svg>
    ),
  },
  {
    id: 'map',
    label: 'Map',
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${active ? 'text-blue-600' : 'text-gray-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 4"
        />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${active ? 'text-blue-600' : 'text-gray-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

const Footer: React.FC<FooterProps> = ({ activeTab, onTabChange }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-sm border-t border-gray-200/80 z-20 flex items-center justify-center px-4">
      <nav className="w-full max-w-4xl flex items-end justify-between">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
            >
              {tab.icon(isActive)}
              <span className={`mt-1 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;
