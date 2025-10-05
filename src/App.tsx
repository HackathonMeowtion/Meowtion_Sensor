import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { CatBreedAnalysis, MatchResult } from './types';
import { identifyCatBreed, findMatchingCat } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';

import Header from './components/Header';
import Footer, { FooterTab } from './components/Footer';
import Loader from './components/Loader';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import MatchResultCard from './components/MatchResultCard';
import ProfilePanel from './components/ProfilePanel';
import CatMap from './components/CatMap';

import profileDefault from './assets/profileDefault.png';
import microwave1 from './assets/known-cats/microwave.webp';
import oreo1 from './assets/known-cats/oreo.jpg';

const POST_CHARACTER_LIMIT = 120;

const catHashtags: Record<string, string[]> = {
  microwave: ['#microwave', '#gray', '#fluffy'],
  oreo: ['#oreo', '#blackandwhite'],
  twix: ['#twix', '#cream', '#tabby'],
};

type FeedPost = {
  id: string;
  user: string;
  userAvatar: string;
  image: string;
  caption: string;
  createdAt: number;
  likes?: number;
  name?: string | null;
  isUserGenerated?: boolean;
};

const headerCopy: Record<FooterTab, { title: string; subtitle: string }> = {
  identify: {
    title: 'Identify a campus cat',
    subtitle: 'Upload a photo to analyze the breed and match known friends.',
  },
  gallery: {
    title: 'Community feed',
    subtitle: 'See recent sightings and share your own Meowtion reports.',
  },
  map: {
    title: 'Cat map',
    subtitle: 'Explore favourite hangouts around campus in real time.',
  },
  profile: {
    title: 'Your profile',
    subtitle: 'Sign in with Auth0 to manage your Meowtion Sensor account.',
  },
};

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);
  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1d';
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1w';
  if (diffWeeks < 5) return `${diffWeeks}w`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1mo';
  if (diffMonths < 12) return `${diffMonths}mo`;
  const diffYears = Math.floor(diffDays / 365);
  return diffYears === 1 ? '1y' : `${diffYears}y`;
};

const renderHashtags = (name?: string | null) => {
  if (!name) return null;
  const tags = catHashtags[name.toLowerCase()];
  if (!tags) return null;
  return <p className="mt-2 text-xs font-semibold text-blue-700">{tags.join(' ')}</p>;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FooterTab>('identify');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CatBreedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postMessage, setPostMessage] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [lastKnownCatName, setLastKnownCatName] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<FeedPost[]>([]);

  const username = 'UTACatLuvr';
  const userPostsStorageKey = 'meowtionSensor.userPosts';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(userPostsStorageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as FeedPost[];
      if (!Array.isArray(parsed)) return;
      setUserPosts(
        parsed.map((post) => {
          const timestamp = Number(post.createdAt);
          return {
            ...post,
            createdAt: Number.isNaN(timestamp) ? Date.now() : timestamp,
          };
        }),
      );
    } catch (storageError) {
      console.error('Failed to load saved posts', storageError);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(userPostsStorageKey, JSON.stringify(userPosts));
    } catch (storageError) {
      console.error('Failed to persist posts', storageError);
    }
  }, [userPosts]);

  useEffect(() => {
    if (analysis?.isCat && analysis.breed) {
      setLastKnownCatName(analysis.breed.toLowerCase());
    }
  }, [analysis]);

  useEffect(() => {
    if (matchResult?.matchedCatName) {
      setLastKnownCatName(matchResult.matchedCatName.toLowerCase());
    }
  }, [matchResult]);

  useEffect(() => {
    if (isCreatingPost && lastKnownCatName && postMessage.trim().length === 0) {
      const tags = catHashtags[lastKnownCatName];
      if (tags) {
        setPostMessage(tags.join(' '));
      }
    }
  }, [isCreatingPost, lastKnownCatName, postMessage]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleReset = useCallback(() => {
    setImageFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setIsMatching(false);
    setMatchResult(null);
    setMatchError(null);
    setIsCreatingPost(false);
    setPostError(null);
    setPostMessage('');
    setLastKnownCatName(null);
  }, []);

  const handleImageChange = useCallback(
    (file: File) => {
      setImageFile(file);
      const nextPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return nextPreviewUrl;
      });
      setAnalysis(null);
      setError(null);
      setMatchResult(null);
      setMatchError(null);
      setIsCreatingPost(false);
      setPostMessage('');
      setPostError(null);
      setActiveTab('identify');
    },
    [],
  );

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
    } catch (identifyError: unknown) {
      const message = identifyError instanceof Error ? identifyError.message : 'Failed to analyze image.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleMatchClick = useCallback(async () => {
    if (!imageFile) {
      setMatchError('Upload a photo before searching for a match.');
      return;
    }
    try {
      setIsMatching(true);
      setMatchError(null);
      const { base64, mimeType } = await fileToBase64(imageFile);
      const result = await findMatchingCat(base64, mimeType);
      setMatchResult(result);
    } catch (matchErr: unknown) {
      const message = matchErr instanceof Error ? matchErr.message : 'Failed to compare with the campus roster.';
      setMatchError(message);
    } finally {
      setIsMatching(false);
    }
  }, [imageFile]);

  const handleOpenCreatePost = () => {
    setIsCreatingPost(true);
    setPostError(null);
    setActiveTab('identify');
  };

  const handleCreatePost = useCallback(async () => {
    if (isPosting) return;
    if (!imageFile || !previewUrl) {
      setPostError('Upload a cat photo before posting.');
      return;
    }
    if (!postMessage.trim()) {
      setPostError('Add a caption or hashtags so others know this cat.');
      return;
    }
    try {
      setIsPosting(true);
      const { base64, mimeType } = await fileToBase64(imageFile);
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const newPost: FeedPost = {
        id: `user-post-${Date.now()}`,
        user: username,
        userAvatar: profileDefault,
        image: dataUrl,
        caption: postMessage.trim().slice(0, POST_CHARACTER_LIMIT),
        createdAt: Date.now(),
        name: lastKnownCatName,
        isUserGenerated: true,
      };
      setUserPosts((previous) => [newPost, ...previous]);
      setIsCreatingPost(false);
      handleReset();
      setActiveTab('gallery');
    } catch (postErrorEvent: unknown) {
      console.error('Failed to create post', postErrorEvent);
      setPostError('Something went wrong while preparing your post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  }, [handleReset, imageFile, isPosting, lastKnownCatName, postMessage, previewUrl, username]);

  const loaderLabel = isLoading ? 'Analyzing photo…' : 'Comparing with known cats…';
  const showLoader = isLoading || isMatching;

  const mainPost: FeedPost = useMemo(
    () => ({
      id: 'post-main',
      user: 'Microwave HQ',
      userAvatar: profileDefault,
      image: microwave1,
      caption: 'Sneaky floof caught by the University Center again. Sandwich status: compromised. 🐾',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      likes: 129,
      name: 'microwave',
    }),
    [],
  );

  const nextPostPreview: FeedPost = useMemo(
    () => ({
      id: 'post-preview',
      user: 'Oreo Lover',
      userAvatar: profileDefault,
      image: oreo1,
      caption: 'Oreo was supervising the library entrance today!',
      createdAt: Date.now() - 4 * 60 * 60 * 1000,
      likes: 54,
      name: 'oreo',
    }),
    [],
  );

  const galleryPosts = useMemo(() => {
    const seeded = [mainPost, nextPostPreview];
    return userPosts.length > 0 ? [...userPosts, ...seeded] : seeded;
  }, [mainPost, nextPostPreview, userPosts]);

  const featuredPost = galleryPosts[0];
  const upcomingPost = galleryPosts[1] ?? null;
  const remainingPosts = galleryPosts.slice(2);

  const renderPostCard = (post: FeedPost, variant: 'featured' | 'standard' = 'standard') => (
    <article
      key={post.id}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${
        variant === 'featured' ? 'md:col-span-2' : ''
      }`}
    >
      <img src={post.image} alt={post.caption} className={variant === 'featured' ? 'h-64 w-full object-cover' : 'h-52 w-full object-cover'} />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={post.userAvatar} alt={post.user} className="h-9 w-9 rounded-full border border-gray-200" />
            <div>
              <p className="font-semibold text-gray-900">{post.user}</p>
              <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          {post.likes ? (
            <span className="text-xs font-semibold text-blue-600">{post.likes.toLocaleString()} likes</span>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-gray-800 whitespace-pre-line">{post.caption}</p>
        {renderHashtags(post.name)}
        {post.isUserGenerated ? (
          <span className="mt-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Shared by you
          </span>
        ) : null}
      </div>
    </article>
  );

  const renderIdentifyView = () => (
    <div className="space-y-6">
      {isCreatingPost ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-4">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Share this sighting</h2>
            <p className="text-sm text-gray-600">Craft a caption and send it to the community feed.</p>
          </header>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-52 object-cover rounded-xl" />
          ) : null}
          <textarea
            value={postMessage}
            onChange={(event) => {
              const next = event.target.value.slice(0, POST_CHARACTER_LIMIT);
              setPostMessage(next);
              if (postError) {
                setPostError(null);
              }
            }}
            placeholder="Add a caption, hashtags, or quick notes about this cat."
            className="w-full min-h-[140px] rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{POST_CHARACTER_LIMIT - postMessage.length} characters left</span>
            {postError ? <span className="text-red-600">{postError}</span> : null}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsCreatingPost(false);
                setPostError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={isPosting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-500 disabled:bg-blue-300"
            >
              {isPosting ? 'Posting…' : 'Post to feed'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <ImageUploader onImageSelected={handleImageChange} previewUrl={previewUrl} onReset={handleReset} />
          {imageFile && !analysis && !isLoading ? (
            <button
              type="button"
              onClick={handleIdentifyClick}
              className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold shadow-sm hover:bg-blue-500"
              disabled={isLoading}
            >
              Identify cat
            </button>
          ) : null}

          {showLoader ? <Loader label={loaderLabel} /> : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          {analysis && !showLoader ? <ResultCard analysis={analysis} /> : null}

          {analysis?.isCat && !isCreatingPost ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {!matchResult && !isMatching ? (
                <button
                  type="button"
                  onClick={handleMatchClick}
                  className="rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  disabled={isMatching}
                >
                  Check against known cats
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleOpenCreatePost}
                className="rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400"
              >
                Create a post
              </button>
            </div>
          ) : null}

          {matchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{matchError}</div>
          ) : null}

          {matchResult && !isMatching ? (
            <div className="space-y-3">
              <MatchResultCard result={matchResult} />
              {renderHashtags(matchResult.matchedCatName)}
            </div>
          ) : null}
        </>
      )}
    </div>
  );

  const renderGalleryView = () => (
    <div className="space-y-6">
      {featuredPost ? renderPostCard(featuredPost, 'featured') : null}
      {upcomingPost ? (
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-900">Next up on the feed</h2>
            <span className="text-xs font-medium text-blue-600">Stay tuned</span>
          </div>
          <div className="flex items-center space-x-4">
            <img src={upcomingPost.image} alt={upcomingPost.caption} className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">{upcomingPost.user}</p>
              <p className="text-xs text-blue-700">{formatTimeAgo(upcomingPost.createdAt)}</p>
              <p className="mt-2 text-sm text-blue-900 line-clamp-2">{upcomingPost.caption}</p>
              {renderHashtags(upcomingPost.name)}
            </div>
          </div>
        </section>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        {remainingPosts.map((post) => renderPostCard(post))}
      </div>
      {remainingPosts.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          Once more sightings roll in, they will appear here automatically.
        </p>
      ) : null}
    </div>
  );

  const renderMapView = () => (
    <div className="h-[520px] rounded-2xl overflow-hidden border border-gray-200">
      <CatMap />
    </div>
  );

  const renderProfileView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <ProfilePanel />
    </div>
  );

  const { title, subtitle } = headerCopy[activeTab];

  return (
    <div className="min-h-screen bg-slate-100">
      <Header title={title} subtitle={subtitle} />
      <main className="pt-24 pb-28 px-4">
        <div className="mx-auto max-w-4xl">
          {activeTab === 'identify' && renderIdentifyView()}
          {activeTab === 'gallery' && renderGalleryView()}
          {activeTab === 'map' && renderMapView()}
          {activeTab === 'profile' && renderProfileView()}
        </div>
      </main>
      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
