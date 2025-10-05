
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-gray-600">Analyzing...</p>
    </div>
  );
};

export default Loader;
