// src/components/MatchResultCard.tsx

import React from 'react';
import type { MatchResult } from '../types';

interface MatchResultCardProps {
  result: MatchResult;
}

const MatchResultCard: React.FC<MatchResultCardProps> = ({ result }) => {
  const confidencePercent = (result.confidence * 100).toFixed(0);

  return (
    <div className="mt-6 w-full bg-[#E9DDCD] rounded-xl shadow-lg overflow-hidden animate-fade-in">
      <div className={`p-5 text-white ${result.isMatch ? 'bg-[#BE956C]' : 'bg-gray-500'}`}>
        {result.isMatch ? (
          <>
            <h2 className="text-2xl font-bold">It's a Match! 🥳</h2>
            <p className="text-lg">This looks like <span className="font-bold">{result.matchedCatName}</span>.</p>
          </>
        ) : (
          <h2 className="text-2xl font-bold">No Match Found 😿</h2>
        )}
      </div>
      <div className="p-5 text-[#98522C]">
        <div className="mb-4">
          <p className="font-semibold text-sm opacity-75">Confidence</p>
          <p className="text-lg font-bold">{confidencePercent}%</p>
        </div>
        <div>
          <p className="font-semibold text-sm opacity-75">AI's Reasoning</p>
          <p className="text-md italic">"{result.reasoning}"</p>
        </div>
      </div>
    </div>
  );
};

export default MatchResultCard;