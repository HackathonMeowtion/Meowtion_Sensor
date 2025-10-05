import React, { useState, useCallback } from 'react';
import type { CatBreedAnalysis } from './types';
import { identifyCatBreed } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';

// Import all the assets
import meowtionSensorLogo from './assets/MeowtionSensorLogo.png';
import homeIcon from './assets/home_unselected.png';
import searchIcon from './assets/search_unselected.png';
import addCatIcon from './assets/addCat_selected.PNG';
import mapIcon from './assets/catMap_unselected.png';
import profileIcon from './assets/userProfile_unselected.png';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CatBreedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
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

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  };


  return (
    // Wrapper to center the phone display on the page
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">

      {/* This is the main container, styled to look like a phone */}
      <div className="w-[393px] h-[852px] bg-[#6C8167] rounded-[40px] shadow-2xl border-4 border-black overflow-hidden relative flex flex-col">

        {/* Header with Logo (Using absolute positioning within the phone container) */}
        <header className="absolute top-0 left-0 right-0 z-10 bg-[#E9DDCD] py-2 shadow-md">
          <div className="flex justify-center items-center text-center">
            <img src={meowtionSensorLogo} alt="Meowtion Sensor Logo" className="h-12 w-12 mr-2"/>
            <div>
              <h1 className="text-3xl font-bold tracking-wider text-[#BE956C]">
                MEOWTION SENSOR
              </h1>
              <p className="text-sm tracking-widest text-[#98522C]">
                catsofUTA
              </p>
            </div>
          </div>
        </header>

        {/* Main content area (made scrollable) */}
        <main className="flex-grow flex flex-col items-center p-4 pt-28 pb-24 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto">
            {isLoading && (
              <h2 className="text-center text-2xl font-bold tracking-widest text-[#E9DDCD] mb-4 animate-pulse">
                AUTHENTICATING
              </h2>
            )}

            <ImageUploader
              onImageSelected={handleImageChange}
              previewUrl={previewUrl}
              onReset={handleReset}
            />

            {imageFile && !isLoading && !analysis && (
              <button
                onClick={handleIdentifyClick}
                className="w-full mt-4 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Identify Cat
              </button>
            )}

            {isLoading && (
              <div className="flex justify-center items-center pt-8">
                <div className="w-16 h-16 border-8 border-[#E9DDCD] border-t-8 border-t-[#BE956C] rounded-full animate-spin"></div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                <p>{error}</p>
              </div>
            )}

            {analysis && <ResultCard analysis={analysis} />}
          </div>
        </main>

        {/* Bottom Navigation Bar (Using absolute positioning within the phone container) */}
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