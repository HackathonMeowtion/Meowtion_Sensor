// src/data/knownCats.ts

export interface KnownCat {
  name: string;
  imageSrc: string; // Path to the image in the public folder
}

export const knownCats: KnownCat[] = [
  {
    name: 'Microwave',
    imageSrc: '/known-cats/Microwave.webp',
  },
  {
    name: 'Twix',
    imageSrc: '/known-cats/Twix.jpg',
  },
  {
    name: 'Oreo',
    imageSrc: '/known-cats/Orea.jpg',
  },
  // Add more of your cats here, making sure the images
  // are in your project's /public/known-cats/ folder.
];
