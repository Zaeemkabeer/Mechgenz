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

  const refreshImages = () => {
    fetchImages();
  };

  return {
    images,
    isLoading,
    error,
    getImageUrl,
    refreshImages
  };
};