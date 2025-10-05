// src/utils/imageUtils.ts

export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(',');
      const base64 = parts[1];
      const mimeType = parts[0].split(';')[0].split(':')[1];
      if (base64 && mimeType) {
        resolve({ base64, mimeType });
      } else {
        reject(new Error("Failed to parse base64 string from file."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// New function to fetch an image from a URL and convert it to Base64
export const urlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}. Status: ${response.status}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(',');
      const base64 = parts[1];
      const mimeType = blob.type;
      if (base64 && mimeType) {
        resolve({ base64, mimeType });
      } else {
        reject(new Error("Failed to parse base64 string from URL."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};