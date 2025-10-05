
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  previewUrl: string | null;
  onReset: () => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, previewUrl, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (previewUrl) {
    return (
      <div className="relative w-full aspect-square bg-white rounded-2xl shadow-md overflow-hidden group">
        <img src={previewUrl} alt="Selected cat" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
            <button onClick={onReset} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 text-gray-800 rounded-full p-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full aspect-square bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <UploadIcon />
      <p className="mt-2 text-lg font-semibold text-gray-700">Tap to upload a photo</p>
      <p className="text-sm text-gray-500">Choose a picture of a cat</p>
    </div>
  );
};

export default ImageUploader;
