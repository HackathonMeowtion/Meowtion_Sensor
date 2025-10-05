// src/components/MatchResultCard.tsx

import React from 'react';
import type { MatchResult } from '../types';

interface MatchResultCardProps {
  result: MatchResult;
}

const MatchResultCard: React.FC<MatchResultCardProps> = ({ result }) => {
  const confidencePercent = (result.confidence * 100).toFixed(0);
  const detailedEvaluations = result.evaluations ?? [];

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

        {detailedEvaluations.length > 0 && (
          <div className="mt-6">
            <p className="font-semibold text-sm opacity-75">Detailed comparison</p>
            <div className="mt-3 space-y-3">
              {detailedEvaluations.slice(0, 3).map((evaluation, index) => (
                <div key={`${evaluation.catName}-${index}`} className="bg-white/60 rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-[#4a2b18]">{evaluation.catName}</p>
                    <p className="text-sm font-medium text-[#4a2b18]">
                      {(evaluation.similarity * 100).toFixed(0)}%
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[#4a2b18]">{evaluation.summary}</p>
                  {evaluation.matchedFeatures.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold uppercase text-[#4a2b18]/70">Matched features</p>
                      <ul className="list-disc list-inside text-xs text-[#4a2b18]">
                        {evaluation.matchedFeatures.map((feature, featureIndex) => (
                          <li key={`match-${evaluation.catName}-${featureIndex}`}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evaluation.mismatchedFeatures.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold uppercase text-[#4a2b18]/70">Conflicting features</p>
                      <ul className="list-disc list-inside text-xs text-[#4a2b18]">
                        {evaluation.mismatchedFeatures.map((feature, featureIndex) => (
                          <li key={`mismatch-${evaluation.catName}-${featureIndex}`}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchResultCard;