
import React from 'react';

interface LoaderProps {
  label?: string;
}

const Loader: React.FC<LoaderProps> = ({ label = 'Analyzing...' }) => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      <p className="ml-4 text-gray-600">{label}</p>
    </div>
  );
};

export default Loader;
