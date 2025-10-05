
import React from 'react';
import type { CatBreedAnalysis } from '../types';

interface ResultCardProps {
  analysis: CatBreedAnalysis;
}

const ResultCard: React.FC<ResultCardProps> = ({ analysis }) => {
  const confidencePercentage = (analysis.confidence * 100).toFixed(0);

  return (
    <div className="mt-6 w-full bg-white rounded-2xl shadow-md p-5 animate-fade-in">
      {analysis.isCat ? (
        <>
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{analysis.breed}</h2>
                <p className="text-sm text-gray-500 font-medium">Analysis Result</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-blue-500">{confidencePercentage}%</p>
                <p className="text-sm text-gray-500 font-medium">Confidence</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">{analysis.description}</p>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-900 text-center">Not a Cat</h2>
          <p className="text-center mt-2 text-gray-700">{analysis.description}</p>
        </>
      )}
    </div>
  );
};

export default ResultCard;
