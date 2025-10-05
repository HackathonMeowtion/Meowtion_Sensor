// src/data/knownCats.ts

// Import ALL the images for each cat
import microwaveImage1 from '../assets/known-cats/microwave.webp';
import microwaveImage2 from '../assets/known-cats/microwave2.jpg';
import microwaveImage3 from '../assets/known-cats/microwave3.jpg';

import twixImage1 from '../assets/known-cats/twix.jpg';
import twixImage2 from '../assets/known-cats/twix2.jpg';
import twixImage3 from '../assets/known-cats/twix3.jpg';

import oreoImage1 from '../assets/known-cats/oreo.jpg';
import oreoImage2 from '../assets/known-cats/oreo2.jpeg';
import oreoImage3 from '../assets/known-cats/oreo3.png';

import eggsImage1 from '../assets/known-cats/eggs1.png';
import eggsImage2 from '../assets/known-cats/eggs2.png';
import eggsImage3 from '../assets/known-cats/eggs3.png';

import snickersImage1 from '../assets/known-cats/snickers1.png';
import snickersImage2 from '../assets/known-cats/snickers2.png';
import snickersImage3 from '../assets/known-cats/snickers3.png';

export interface KnownCat {
  name: string;
  imageSrcs: string[]; // Changed from imageSrc to imageSrcs (an array)
}

export const knownCats: KnownCat[] = [
  {
    name: 'Microwave',
    imageSrcs: [microwaveImage1, microwaveImage2, microwaveImage3],
  },
  {
    name: 'Twix',
    imageSrcs: [twixImage1, twixImage2, twixImage3],
  },
  {
    name: 'Oreo',
    imageSrcs: [oreoImage1, oreoImage2, oreoImage3],
  },
  {
    name: 'Eggs',
    imageSrcs: [eggsImage1, eggsImage2, eggsImage3],
  },
  {
    name: 'Snickers',
    imageSrcs: [snickersImage1, snickersImage2, snickersImage3],
  },
];