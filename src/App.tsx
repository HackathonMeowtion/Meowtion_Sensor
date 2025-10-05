import React, { useState, useCallback, useEffect } from 'react';
// Make sure to import both types
import type { CatBreedAnalysis, MatchResult } from './types';
// Make sure to import both service functions
import { identifyCatBreed, findMatchingCat } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import MatchResultCard from './components/MatchResultCard';

// Import all the assets
import meowtionSensorLogo from './assets/MeowtionSensorLogo.png'; // Original header logo
import searchBarIcon from './assets/searchBarIcon.PNG'; // Header logo for search tab

// Import all versions of footer icons for state changes
import homeIconUnselected from './assets/home_unselected.png';
import homeIconSelected from './assets/home_selected.PNG';
import searchIconUnselected from './assets/search_unselected.png';
import searchIconSelected from './assets/search_selected.PNG';
import addCatIconUnselected from './assets/addCat_unselected.png';
import addCatIconSelected from './assets/addCat_selected.PNG';
import mapIconUnselected from './assets/catMap_unselected.png';
import mapIconSelected from './assets/catMap_selected.PNG';
import profileIconUnselected from './assets/userProfile_unselected.png';
import profileIconSelected from './assets/userProfile_selected.PNG';

// Social media icons
import instagramIcon from './assets/instagram.PNG';
import discordIcon from './assets/discord.PNG';
import facebookIcon from './assets/facebook.PNG';
import twitterIcon from './assets/twitter.PNG';

// --- (FIX) STEP 1: Manually import all known cat images ---
import eggs1 from './assets/known-cats/eggs1.png';
import eggs2 from './assets/known-cats/eggs2.png';
import eggs3 from './assets/known-cats/eggs3.png';
import microwave1 from './assets/known-cats/microwave.webp';
import microwave2 from './assets/known-cats/microwave2.jpg';
import microwave3 from './assets/known-cats/microwave3.jpg';
import oreo1 from './assets/known-cats/oreo.jpg';
import oreo2 from './assets/known-cats/oreo2.jpeg';
import oreo3 from './assets/known-cats/oreo3.png';
import snickers1 from './assets/known-cats/snickers1.png';
import snickers2 from './assets/known-cats/snickers2.png';
import snickers3 from './assets/known-cats/snickers3.png';
import twix1 from './assets/known-cats/twix.jpg';
import twix2 from './assets/known-cats/twix2.jpg';
import twix3 from './assets/known-cats/twix3.jpg';

// --- (FIX) STEP 2: Create an array containing all the imported images ---
const allCatImages = [
  eggs1, eggs2, eggs3,
  microwave1, microwave2, microwave3,
  oreo1, oreo2, oreo3,
  snickers1, snickers2, snickers3,
  twix1, twix2, twix3
];


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CatBreedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('addCat');

  // --- (FIX) STEP 3: Initialize the state directly with the image array ---
  const [knownCats, setKnownCats] = useState(allCatImages);

  // --- (FIX) STEP 4: The useEffect for dynamic loading is no longer needed and has been removed ---

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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
    // ... (rest of the function is the same)
  }, [imageFile]);

  const handleMatchClick = useCallback(async () => {
    if (!imageFile) {
      setMatchError('Image file is missing.');
      return;
    }
    setIsMatching(true);
    // ... (rest of the function is the same)
  }, [imageFile]);

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    // ... (rest of the function is the same)
  };

  const showLoader = isLoading || isMatching;
  const loaderText = isLoading ? 'AUTHENTICATING' : 'COMPARING';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-[393px] h-[852px] bg-[#6C8167] rounded-[40px] shadow-2xl border-4 border-black overflow-hidden relative flex flex-col">

        {/* --- CONDITIONAL HEADER --- */}
        <header className="absolute top-0 left-0 right-0 z-10 bg-[#E9DDCD] py-2 shadow-md">
          {activeTab === 'search' ? (
            // Search Bar View
            <div className="flex items-center justify-center p-1">
              <div className="relative w-full mx-4">
                <img src={searchBarIcon} alt="Search Icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-white text-gray-800 placeholder:text-[#BE956C] rounded-full py-2 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#98522C]"
                />
              </div>
            </div>
          ) : (
            // Default Header View
            <div className="flex justify-center items-center text-center">
              <img src={meowtionSensorLogo} alt="Meowtion Sensor Header" className="h-12 w-12 mr-2" />
              <div>
                <h1 className="text-3xl font-bold tracking-wider text-[#BE956C]">
                  MEOWTION SENSOR
                </h1>
                <div className="flex justify-center items-center space-x-2 mt-1">
                  <p className="text-sm tracking-widest text-[#98522C] font-bold">
                    catsofUTA
                  </p>
                  <a href="https://www.instagram.com/catsofuta" target="_blank" rel="noopener noreferrer">
                    <img src={instagramIcon} alt="Instagram" className="h-4 w-4 cursor-pointer" />
                  </a>
                  <a href="https://discord.com/invite/rAEFDeT" target="_blank" rel="noopener noreferrer">
                    <img src={discordIcon} alt="Discord" className="h-4 w-4 cursor-pointer" />
                  </a>
                  <a href="https://www.facebook.com/catsofuta" target="_blank" rel="noopener noreferrer">
                    <img src={facebookIcon} alt="Facebook" className="h-4 w-4 cursor-pointer" />
                  </a>
                  <a href="https://x.com/utacampuscats" target="_blank" rel="noopener noreferrer">
                    <img src={twitterIcon} alt="Twitter" className="h-4 w-4 cursor-pointer" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* --- CONDITIONAL MAIN CONTENT --- */}
        <main className="flex-grow flex flex-col items-center w-full pt-24 pb-24 overflow-y-auto">
          {activeTab === 'search' && (
            // Search Grid View
            <div className="grid grid-cols-3 gap-1 w-full px-1">
              {knownCats.map((catImage, index) => (
                <div key={index} className="aspect-square">
                  <img src={catImage} alt={`Known cat ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'addCat' && (
            // Image Uploader View
            <div className="w-full max-w-sm mx-auto px-4">
               {/* All the uploader UI, buttons, and result cards go here */}
              <ImageUploader onImageSelected={handleImageChange} previewUrl={previewUrl} onReset={handleReset} />
              {imageFile && !analysis && !isLoading && (
                <button
                  onClick={handleIdentifyClick}
                  className="w-full mt-4 bg-[#BE956C] text-white font-bold py-3 px-4 rounded-lg text-lg shadow-md hover:bg-[#98522C] focus:outline-none focus:ring-2 focus:ring-[#E9DDCD] focus:ring-opacity-50 transition-colors transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Identify Cat
                </button>
              )}
               {/* ... other components like loader, error, result cards ... */}
            </div>
          )}
        </main>

        <footer className="absolute bottom-0 left-0 right-0 w-full bg-[#6C8167] shadow-t-lg py-2 px-4">
          <div className="flex justify-around items-center max-w-sm mx-auto">
            <img src={activeTab === 'home' ? homeIconSelected : homeIconUnselected} alt="Home" className="h-10 w-10 cursor-pointer" onClick={() => setActiveTab('home')} />
            <img src={activeTab === 'search' ? searchIconSelected : searchIconUnselected} alt="Search" className="h-10 w-10 cursor-pointer" onClick={() => setActiveTab('search')} />
            <img src={activeTab === 'addCat' ? addCatIconSelected : addCatIconUnselected} alt="Add Cat" className="h-12 w-12 cursor-pointer" onClick={() => setActiveTab('addCat')} />
            <img src={activeTab === 'map' ? mapIconSelected : mapIconUnselected} alt="Map" className="h-10 w-10 cursor-pointer" onClick={() => setActiveTab('map')} />
            <img src={activeTab === 'profile' ? profileIconSelected : profileIconUnselected} alt="Profile" className="h-10 w-10 cursor-pointer" onClick={() => setActiveTab('profile')} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;