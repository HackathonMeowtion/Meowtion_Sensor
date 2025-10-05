// src/data/knownCats.ts

// Import the images directly. Vite will handle the public paths.
import microwaveImage from '../assets/known-cats/microwave.webp';
import twixImage from '../assets/known-cats/twix.jpg';
import oreoImage from '../assets/known-cats/oreo.jpg';

export interface KnownCat {
  name: string;
  imageSrc: string; // This will now be a module path handled by Vite
}

export const knownCats: KnownCat[] = [
  {
    name: 'Microwave',
    imageSrc: microwaveImage,
  },
  {
    name: 'Twix',
    imageSrc: twixImage,
  },
  {
    name: 'Oreo',
    imageSrc: oreoImage,
  },
  // To add more cats, place the image in the src/assets/known-cats folder,
  // import it at the top of this file, and add a new entry below.
];