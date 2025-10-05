import React, { useState, useCallback } from 'react';
// Make sure to import both types
import type { CatBreedAnalysis, MatchResult } from './types';
// Make sure to import both service functions
import { identifyCatBreed, findMatchingCat } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import MatchResultCard from './components/MatchResultCard';

// Import all the assets
import meowtionSensorLogo from './assets/MeowtionSensorLogo.png';
import homeIcon from './assets/home_unselected.png';
import searchIcon from './assets/search_unselected.png';
import addCatIcon from './assets/addCat_selected.PNG';
import mapIcon from './assets/catMap_unselected.png';
import profileIcon from './assets/userProfile_unselected.png';
// Import the new social media icons
import instagramIcon from './assets/instagram.PNG';
import discordIcon from './assets/discord.PNG';
import facebookIcon from './assets/facebook.PNG';
import twitterIcon from './assets/twitter.PNG';


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CatBreedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- State for the matching feature ---
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset all results
      setAnalysis(null);
      setError(null);
      setMatchResult(null);
      setMatchError(null);
    }
  };

  const handleIdentifyClick = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const result = await identifyCatBreed(base64, mimeType);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError('Failed to identify the cat. The AI may be busy, or the image could not be processed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  // --- Handler for the matching feature ---
  const handleMatchClick = useCallback(async () => {
    if (!imageFile) {
      setMatchError('Image file is missing.');
      return;
    }

    setIsMatching(true);
    setMatchResult(null);
    setMatchError(null);

    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const result = await findMatchingCat(base64, mimeType);
      setMatchResult(result);
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setMatchError(`Failed to perform match: ${message}`);
    } finally {
        setIsMatching(false);
    }
  }, [imageFile]);

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    // Reset matching state as well
    setMatchResult(null);
    setMatchError(null);
    setIsMatching(false);
  };

  // --- Combined loader logic ---
  const showLoader = isLoading || isMatching;
  const loaderText = isLoading ? 'AUTHENTICATING' : 'COMPARING';

  return (
    // Wrapper to center the phone display on the page
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">

      {/* This is the main container, styled to look like a phone */}
      <div className="w-[393px] h-[852px] bg-[#6C8167] rounded-[40px] shadow-2xl border-4 border-black overflow-hidden relative flex flex-col">

        {/* Header with Logo and Social Icons */}
        <header className="absolute top-0 left-0 right-0 z-10 bg-[#E9DDCD] py-2 shadow-md">
          <div className="flex justify-center items-center text-center">
            <img src={meowtionSensorLogo} alt="Meowtion Sensor Logo" className="h-12 w-12 mr-2"/>
            <div>
              <h1 className="text-3xl font-bold tracking-wider text-[#BE956C]">
                MEOWTION SENSOR
              </h1>
              {/* Container for subtitle and social icons */}
              <div className="flex justify-center items-center space-x-2 mt-1">
                <p className="text-sm tracking-widest text-[#98522C] font-bold">
                  catsofUTA
                </p>
                {/* Social Icons - Returned to normal size */}
                <img src={instagramIcon} alt="Instagram" className="h-4 w-4 cursor-pointer" />
                <img src={discordIcon} alt="Discord" className="h-4 w-4 cursor-pointer" />
                <img src={facebookIcon} alt="Facebook" className="h-4 w-4 cursor-pointer" />
                <img src={twitterIcon} alt="Twitter" className="h-4 w-4 cursor-pointer" />
              </div>
            </div>
          </div>
        </header>

        {/* Main content area (made scrollable) */}
        <main className="flex-grow flex flex-col items-center p-4 pt-28 pb-24 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto">
            {showLoader && (
              <h2 className="text-center text-2xl font-bold tracking-widest text-[#E9DDCD] mb-4 animate-pulse">
                {loaderText}
              </h2>
            )}

            <ImageUploader
              onImageSelected={handleImageChange}
              previewUrl={previewUrl}
              onReset={handleReset}
            />

            {imageFile && !analysis && !isLoading && (
              <button
                onClick={handleIdentifyClick}
                className="w-full mt-4 bg-[#BE956C] text-white font-bold py-3 px-4 rounded-lg text-lg shadow-md hover:bg-[#98522C] focus:outline-none focus:ring-2 focus:ring-[#E9DDCD] focus:ring-opacity-50 transition-colors transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Identify Cat
              </button>
            )}

            {showLoader && (
              <div className="flex justify-center items-center pt-8">
                <div className="w-16 h-16 border-8 border-[#E9DDCD] border-t-8 border-t-[#BE956C] rounded-full animate-spin"></div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                <p>{error}</p>
              </div>
            )}

            {analysis && !showLoader && <ResultCard analysis={analysis} />}
            
            {/* --- UI for the matching feature --- */}
            {analysis && analysis.isCat && !matchResult && !isMatching && (
               <button
                onClick={handleMatchClick}
                className="w-full mt-4 bg-[#BE956C] text-white font-bold py-3 px-4 rounded-lg text-lg shadow-md hover:bg-[#98522C] focus:outline-none focus:ring-2 focus:ring-[#E9DDCD] focus:ring-opacity-50 transition-colors transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isMatching}
              >
                Is this a known cat?
              </button>
            )}

            {matchError && (
               <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                <p>{matchError}</p>
              </div>
            )}

            {matchResult && !isMatching && <MatchResultCard result={matchResult} />}
          </div>
        </main>

        {/* Bottom Navigation Bar */}
        <footer className="absolute bottom-0 left-0 right-0 w-full bg-[#6C8167] shadow-t-lg py-2 px-4">
          <div className="flex justify-around items-center max-w-sm mx-auto">
            <img src={homeIcon} alt="Home" className="h-10 w-10 cursor-pointer" />
            <img src={searchIcon} alt="Search" className="h-10 w-10 cursor-pointer" />
            <img src={addCatIcon} alt="Add Cat" className="h-12 w-12 cursor-pointer" />
            <img src={mapIcon} alt="Map" className="h-10 w-10 cursor-pointer" />
            <img src={profileIcon} alt="Profile" className="h-10 w-10 cursor-pointer" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
