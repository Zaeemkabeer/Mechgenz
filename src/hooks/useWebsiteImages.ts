import { useState, useEffect } from 'react';

interface WebsiteImage {
  id: string;
  name: string;
  description: string;
  current_url: string;
  locations: string[];
  recommended_size: string;
  category: string;
  updated_at?: string;
}

interface WebsiteImages {
  [key: string]: WebsiteImage;
}

export const useWebsiteImages = () => {
  const [images, setImages] = useState<WebsiteImages>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<{ [key: string]: boolean }>({});

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/website-images');
      
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || {});
        setError(null);
      } else {
        setError('Failed to fetch images');
      }
    } catch (err) {
      setError('Network error while fetching images');
      console.error('Error fetching images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const getImageUrl = (imageId: string, fallbackUrl?: string): string => {
    const image = images[imageId];
    if (image?.current_url) {
      // If it's a relative URL, make it absolute
      if (image.current_url.startsWith('/images/')) {
        return `http://localhost:8000${image.current_url}`;
      }
      return image.current_url;
    }
    return fallbackUrl || '';
  };

  const preloadImage = (imageId: string, fallbackUrl?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const imageUrl = getImageUrl(imageId, fallbackUrl);
      
      if (!imageUrl) {
        if (fallbackUrl) {
          resolve(fallbackUrl);
        } else {
          reject('No image URL available');
        }
        return;
      }

      // If we already know this image loaded successfully, resolve immediately
      if (imageLoadStates[imageId]) {
        resolve(imageUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        setImageLoadStates(prev => ({ ...prev, [imageId]: true }));
        resolve(imageUrl);
      };
      img.onerror = () => {
        setImageLoadStates(prev => ({ ...prev, [imageId]: false }));
        if (fallbackUrl) {
          // Try to preload the fallback image too
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackUrl);
          fallbackImg.onerror = () => reject('Failed to load both primary and fallback images');
          fallbackImg.src = fallbackUrl;
        } else {
          reject('Failed to load image');
        }
      };
      img.src = imageUrl;
    });
  };

  const refreshImages = () => {
    fetchImages();
  };

  return {
    images,
    isLoading,
    error,
    getImageUrl,
    preloadImage,
    refreshImages,
    imageLoadStates
  };
};