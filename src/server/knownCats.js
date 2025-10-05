import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const assetsDirectory = path.join(projectRoot, 'assets', 'known-cats');

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const knownCats = [
  {
    name: 'Microwave',
    imageFiles: ['microwave.webp', 'microwave2.jpg', 'microwave3.jpg'],
  },
  {
    name: 'Twix',
    imageFiles: ['twix.jpg', 'twix2.jpg', 'twix3.jpg'],
  },
  {
    name: 'Oreo',
    imageFiles: ['oreo.jpg', 'oreo2.jpeg', 'oreo3.png'],
  },
  {
    name: 'Eggs',
    imageFiles: ['eggs1.png', 'eggs2.png', 'eggs3.png'],
  },
  {
    name: 'Snickers',
    imageFiles: ['snickers1.png', 'snickers2.png', 'snickers3.png'],
  },
];

const knownCatCache = new Map();

const loadImageAsInlineData = async (fileName) => {
  const absolutePath = path.join(assetsDirectory, fileName);
  const buffer = await fs.readFile(absolutePath);
  const base64 = buffer.toString('base64');
  const extension = path.extname(absolutePath).toLowerCase();
  const mimeType = MIME_TYPES[extension] ?? 'application/octet-stream';
  return { inlineData: { data: base64, mimeType } };
};

export const getKnownCatContentParts = async () => {
  const contentParts = [];

  for (const cat of knownCats) {
    contentParts.push({ text: `Known Cat Name: ${cat.name}` });

    let cached = knownCatCache.get(cat.name);
    if (!cached) {
      cached = await Promise.all(cat.imageFiles.map((file) => loadImageAsInlineData(file)));
      knownCatCache.set(cat.name, cached);
    }

    contentParts.push(...cached.map((part) => ({ ...part })));
  }

  return contentParts;
};
