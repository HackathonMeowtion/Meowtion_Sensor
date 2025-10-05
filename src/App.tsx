// src/App.tsx
import React, { useState, useCallback } from 'react';
// Make sure to import both types
import type { CatBreedAnalysis, MatchResult } from './types';
// Make sure to import both service functions
import { identifyCatBreed, findMatchingCat } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import MatchResultCard from './components/MatchResultCard';
import ProfilePanel from './components/ProfilePanel';

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

// --- Manually import all known cat images ---
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

// Define a more structured type for our cat data
type CatImage = {
  name: string; // e.g., 'eggs', 'oreo'
  src: string;  // The URL path to the image
};

// Create a master list of cat names for suggestions
const catNames = ["eggs", "microwave", "oreo", "snickers", "twix"];

// Create a structured array of all cat images with their names
const allCatImages: CatImage[] = [
  { name: 'eggs', src: eggs1 }, { name: 'eggs', src: eggs2 }, { name: 'eggs', src: eggs3 },
  { name: 'microwave', src: microwave1 }, { name: 'microwave', src: microwave2 }, { name: 'microwave', src: microwave3 },
  { name: 'oreo', src: oreo1 }, { name: 'oreo', src: oreo2 }, { name: 'oreo', src: oreo3 },
  { name: 'snickers', src: snickers1 }, { name: 'snickers', src: snickers2 }, { name: 'snickers', src: snickers3 },
  { name: 'twix', src: twix1 }, { name: 'twix', src: twix2 }, { name: 'twix', src: twix3 },
];


const App: React.FC = () => {
  // (debug) will print in the BROWSER console
  console.log("Auth0 domain:", import.meta.env.VITE_AUTH0_DOMAIN);
  console.log("Auth0 client ID:", import.meta.env.VITE_AUTH0_CLIENT_ID);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CatBreedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('addCat');

  // State variables for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [displayedCats, setDisplayedCats] = useState<CatImage[]>(allCatImages);


  const handleImageChange = async (file: File | null) => {
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
      setMatchResult(null);
      setMatchError(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setAnalysis(null);
      setMatchResult(null);
      setError(null);
      setMatchError(null);
    }
  };

  const handleIdentifyClick = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const { base64, mimeType } = await fileToBase64(imageFile);
      const result = await identifyCatBreed(base64, mimeType);

      setAnalysis(result);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to analyze image.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]); // <-- FIX: Restored [imageFile] dependency

  const handleMatchClick = useCallback(async () => {
    if (!imageFile) {
      setMatchError('Image file is missing.');
      return;
    }
    try {
      setIsMatching(true);
      setMatchError(null);

      const { base64, mimeType } = await fileToBase64(imageFile);
      const result = await findMatchingCat(base64, mimeType);

      setMatchResult(result);
    } catch (e: any) {
      setMatchError(e?.message ?? 'Failed to match.');
    } finally {
      setIsMatching(false);
    }
  }, [imageFile]); // <-- FIX: Restored [imageFile] dependency

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setMatchResult(null);
    setMatchError(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredSuggestions = catNames.filter(name =>
        name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions(catNames);
    }
  };

  const executeSearch = (name: string) => {
    const term = name.trim().toLowerCase();
    if (catNames.includes(term)) {
        const filteredCats = allCatImages.filter(cat => cat.name.toLowerCase() === term);
        setDisplayedCats(filteredCats);
    }
    setSearchTerm(name);
    setIsSearchFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch(searchTerm);
    }
  };

  const handleTabClick = (tabName: string) => {
    if (tabName === 'search') {
      setDisplayedCats(allCatImages);
      setSearchTerm('');
    }
    setActiveTab(tabName);
  }

  const showLoader = isLoading || isMatching;
  const loaderText = isLoading ? 'AUTHENTICATING' : 'COMPARING';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-[393px] h-[852px] bg-[#6C8167] rounded-[40px] shadow-2xl border-4 border-black overflow-hidden relative flex flex-col">

        <header className="absolute top-0 left-0 right-0 z-10 bg-[#E9DDCD] py-2 shadow-md">
          {activeTab === 'search' ? (
            <div className="flex items-center justify-center p-1">
              <div className="relative w-full mx-4">
                <img src={searchBarIcon} alt="Search Icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-white text-gray-800 placeholder:text-[#BE956C] rounded-full py-2 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#98522C]"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => { setSuggestions(catNames); setIsSearchFocused(true); }}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                  onKeyDown={handleKeyDown}
                />
                {isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg z-20">
                    {suggestions.map(name => (
                      <div
                        key={name}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onMouseDown={() => executeSearch(name)}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center text-center">
               <img src={activeTab === 'search' ? searchBarIcon : meowtionSensorLogo} alt="Meowtion Sensor Header" className="h-12 w-12 mr-2" />
               <div>
                <h1 className="text-3xl font-bold tracking-wider text-[#BE956C]">
                  MEOWTION SENSOR
                </h1>
                <div className="flex justify-center items-center space-x-2 mt-1">
                  <p className="text-sm tracking-widest text-[#98522C] font-bold">
                    catsofUTA
                  </p>
                  <a href="https://www.instagram.com/catsofuta" target="_blank" rel="noopener noreferrer"><img src={instagramIcon} alt="Instagram" className="h-4 w-4 cursor-pointer" /></a>
                  <a href="https://discord.com/invite/rAEFDeT" target="_blank" rel="noopener noreferrer"><img src={discordIcon} alt="Discord" className="h-4 w-4 cursor-pointer" /></a>
                  <a href="https://www.facebook.com/catsofuta" target="_blank" rel="noopener noreferrer"><img src={facebookIcon} alt="Facebook" className="h-4 w-4 cursor-pointer" /></a>
                  <a href="https://x.com/utacampuscats" target="_blank" rel="noopener noreferrer"><img src={twitterIcon} alt="Twitter" className="h-4 w-4 cursor-pointer" /></a>
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-grow flex flex-col items-center w-full pt-24 pb-24 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="text-[#E9DDCD] mt-8">Home coming soon…</div>
          )}

          {activeTab === 'map' && (
            <div className="text-[#E9DDCD] mt-8">Map coming soon…</div>
          )}

          {activeTab === 'search' && (
            <div className="grid grid-cols-3 gap-1 w-full px-1">
              {displayedCats.map((cat, index) => (
                <div key={`${cat.src}-${index}`} className="aspect-square">
                  <img src={cat.src} alt={`${cat.name} ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="w-full max-w-sm mx-auto px-4">
              <ProfilePanel />
            </div>
          )}

          {activeTab === 'addCat' && (
            <div className="w-full max-w-sm mx-auto px-4">
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
          )}
        </main>

        <footer className="absolute bottom-0 left-0 right-0 w-full bg-[#6C8167] shadow-t-lg py-2 px-4">
          <div className="flex justify-around items-center max-w-sm mx-auto">
            <img src={activeTab === 'home' ? homeIconSelected : homeIconUnselected} alt="Home" className="h-10 w-10 cursor-pointer" onClick={() => handleTabClick('home')} />
            <img src={activeTab === 'search' ? searchIconSelected : searchIconUnselected} alt="Search" className="h-10 w-10 cursor-pointer" onClick={() => handleTabClick('search')} />
            <img src={activeTab === 'addCat' ? addCatIconSelected : addCatIconUnselected} alt="Add Cat" className="h-12 w-12 cursor-pointer" onClick={() => handleTabClick('addCat')} />
            <img src={activeTab === 'map' ? mapIconSelected : mapIconUnselected} alt="Map" className="h-10 w-10 cursor-pointer" onClick={() => handleTabClick('map')} />
            <img src={activeTab === 'profile' ? profileIconSelected : profileIconUnselected} alt="Profile" className="h-10 w-10 cursor-pointer" onClick={() => handleTabClick('profile')} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;