import type { CreatePostInput, Post } from '../types';

const STORAGE_KEY = 'meowtion-sensor-posts';
const apiUrl = import.meta.env.VITE_POSTS_API_URL;

const isBrowser = typeof window !== 'undefined';

const loadLocalPosts = (): Post[] => {
  if (!isBrowser) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Post[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn('Failed to parse posts from localStorage.', error);
    return [];
  }
};

const saveLocalPosts = (posts: Post[]) => {
  if (!isBrowser) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.warn('Unable to persist posts to localStorage.', error);
  }
};

export const fetchPosts = async (): Promise<Post[]> => {
  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch posts from API. Status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        return data as Post[];
      }
      console.warn('Unexpected payload when fetching posts, falling back to local storage.');
    } catch (error) {
      console.warn('Error retrieving posts from API, falling back to local storage.', error);
    }
  }
  return loadLocalPosts();
};

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`Failed to create post via API. Status: ${response.status}`);
      }
      const data = (await response.json()) as Post;
      return data;
    } catch (error) {
      console.warn('Error creating post via API, storing locally instead.', error);
    }
  }

  const currentPosts = loadLocalPosts();
  const newPost: Post = {
    id: input.id ?? `local-${Date.now()}`,
    user: input.user,
    userAvatar: input.userAvatar,
    imageUrl: input.imageUrl,
    caption: input.caption,
    createdAt: new Date().toISOString(),
    likes: input.likes ?? 0,
    catName: input.catName ?? null,
    hashtags: input.hashtags ?? [],
    analysisSummary: input.analysisSummary ?? null,
    matchSummary: input.matchSummary ?? null,
    aiConfidence: input.aiConfidence ?? null,
  };

  const updatedPosts = [newPost, ...currentPosts];
  saveLocalPosts(updatedPosts);
  return newPost;
};

export const clearLocalPosts = () => {
  if (!isBrowser) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};
