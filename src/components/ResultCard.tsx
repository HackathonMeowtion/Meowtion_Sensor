// src/components/ResultCard.tsx

import React from 'react';
import type { CatBreedAnalysis } from '../types';

interface ResultCardProps {
  analysis: CatBreedAnalysis;
}

const ResultCard: React.FC<ResultCardProps> = ({ analysis }) => {
  const confidencePercent = (analysis.confidence * 100).toFixed(0);

  return (
    <div className="mt-6 w-full bg-[#E9DDCD] text-[#98522C] rounded-xl shadow-lg overflow-hidden animate-fade-in">
      {analysis.isCat ? (
        <>
          <div className="p-5">
            <h2 className="text-3xl font-bold text-[#6C8167]">{analysis.breed}</h2>
            <p className="text-sm font-semibold">Confidence: {confidencePercent}%</p>
          </div>
          <div className="px-5 pb-5">
            <p className="text-base text-justify">{analysis.description}</p>
          </div>
        </>
      ) : (
        <div className="p-5">
          <h2 className="text-2xl font-bold text-[#6C8167]">Not a Cat 😿</h2>
          <p className="mt-2 text-base">{analysis.description}</p>
        </div>
      )}
    </div>
  );
};

export default ResultCard;