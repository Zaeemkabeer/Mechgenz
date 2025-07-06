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

// Local storage key for caching images
const IMAGES_CACHE_KEY = 'mechgenz_website_images';
const CACHE_EXPIRY_KEY = 'mechgenz_images_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Default fallback images configuration
const DEFAULT_IMAGES: WebsiteImages = {
  logo: {
    id: 'logo',
    name: 'Company Logo',
    current_url: '/mechgenz-logo.jpg',
    locations: ['Header', 'Footer'],
    recommended_size: '200x200px',
    category: 'branding'
  },
  hero_slide_1: {
    id: 'hero_slide_1',
    name: 'Hero Slide 1',
    current_url: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    locations: ['Hero Section'],
    recommended_size: '1920x1080px',
    category: 'hero'
  },
  hero_slide_2: {
    id: 'hero_slide_2',
    name: 'Hero Slide 2',
    current_url: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    locations: ['Hero Section'],
    recommended_size: '1920x1080px',
    category: 'hero'
  },
  hero_slide_3: {
    id: 'hero_slide_3',
    name: 'Hero Slide 3',
    current_url: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    locations: ['Hero Section'],
    recommended_size: '1920x1080px',
    category: 'hero'
  },
  about_main: {
    id: 'about_main',
    name: 'About Section Main Image',
    current_url: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    locations: ['About Section'],
    recommended_size: '800x600px',
    category: 'about'
  },
  mechanical_suppliers: {
    id: 'mechanical_suppliers',
    name: 'Mechanical Suppliers Background',
    current_url: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Trading Section - Mechanical Suppliers'],
    recommended_size: '800x600px',
    category: 'trading'
  },
  electrical_suppliers: {
    id: 'electrical_suppliers',
    name: 'Electrical Suppliers Background',
    current_url: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Trading Section - Electrical Suppliers'],
    recommended_size: '800x600px',
    category: 'trading'
  },
  plumbing_suppliers: {
    id: 'plumbing_suppliers',
    name: 'Plumbing Suppliers Background',
    current_url: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Trading Section - Plumbing Suppliers'],
    recommended_size: '800x600px',
    category: 'trading'
  },
  fire_fighting_suppliers: {
    id: 'fire_fighting_suppliers',
    name: 'Fire Fighting Suppliers Background',
    current_url: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Trading Section - Fire Fighting Suppliers'],
    recommended_size: '800x600px',
    category: 'trading'
  },
  portfolio_civil_1: {
    id: 'portfolio_civil_1',
    name: 'Civil Structure Project 1',
    current_url: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Portfolio Section - Civil Structure'],
    recommended_size: '800x600px',
    category: 'portfolio'
  },
  portfolio_civil_2: {
    id: 'portfolio_civil_2',
    name: 'Civil Structure Project 2',
    current_url: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Portfolio Section - Civil Structure'],
    recommended_size: '800x600px',
    category: 'portfolio'
  },
  portfolio_road_1: {
    id: 'portfolio_road_1',
    name: 'Road Infrastructure Project 1',
    current_url: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Portfolio Section - Road Infrastructure'],
    recommended_size: '800x600px',
    category: 'portfolio'
  },
  portfolio_road_2: {
    id: 'portfolio_road_2',
    name: 'Road Infrastructure Project 2',
    current_url: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Portfolio Section - Road Infrastructure'],
    recommended_size: '800x600px',
    category: 'portfolio'
  },
  portfolio_fitout_1: {
    id: 'portfolio_fitout_1',
    name: 'Fit Out Project 1',
    current_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Portfolio Section - Fit Out'],
    recommended_size: '800x600px',
    category: 'portfolio'
  },
  portfolio_fitout_2: {
    id: 'portfolio_fitout_2',
    name: 'Fit Out Project 2',
    current_url: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Portfolio Section - Fit Out'],
    recommended_size: '800x600px',
    category: 'portfolio'
  },
  portfolio_special_1: {
    id: 'portfolio_special_1',
    name: 'Special Installation Project 1',
    current_url: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Portfolio Section - Special Installation'],
    recommended_size: '800x600px',
    category: 'portfolio'
  },
  portfolio_special_2: {
    id: 'portfolio_special_2',
    name: 'Special Installation Project 2',
    current_url: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
    locations: ['Portfolio Section - Special Installation'],
    recommended_size: '800x600px',
    category: 'portfolio'
  }
};

export const useWebsiteImages = () => {
  const [images, setImages] = useState<WebsiteImages>(DEFAULT_IMAGES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadStates, setImageLoadStates] = useState<{ [key: string]: boolean }>({});
  const [serverConnected, setServerConnected] = useState(false);

  // Load cached images from localStorage
  const loadCachedImages = (): WebsiteImages | null => {
    try {
      const cachedImages = localStorage.getItem(IMAGES_CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (cachedImages && cacheExpiry) {
        const expiryTime = parseInt(cacheExpiry, 10);
        const now = Date.now();
        
        if (now < expiryTime) {
          return JSON.parse(cachedImages);
        } else {
          // Clear expired cache
          localStorage.removeItem(IMAGES_CACHE_KEY);
          localStorage.removeItem(CACHE_EXPIRY_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cached images:', error);
    }
    return null;
  };

  // Save images to localStorage
  const cacheImages = (imagesToCache: WebsiteImages) => {
    try {
      const expiryTime = Date.now() + CACHE_DURATION;
      localStorage.setItem(IMAGES_CACHE_KEY, JSON.stringify(imagesToCache));
      localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Error caching images:', error);
    }
  };

  // Check if server is available
  const checkServerConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        timeout: 5000 // 5 second timeout
      } as RequestInit);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      
      // First, check if server is available
      const isServerAvailable = await checkServerConnection();
      setServerConnected(isServerAvailable);
      
      if (!isServerAvailable) {
        const cachedImages = loadCachedImages();
        if (cachedImages) {
          setImages(cachedImages);
        } else {
          setImages(DEFAULT_IMAGES);
        }
        setError(null); // Don't show error for offline mode
        return;
      }

      // Server is available, try to fetch fresh data
      const response = await fetch('http://localhost:8000/api/website-images');
      
      if (response.ok) {
        const data = await response.json();
        const fetchedImages = data.images || {};
        
        // Merge with defaults to ensure all required images are present
        const mergedImages = { ...DEFAULT_IMAGES, ...fetchedImages };
        
        setImages(mergedImages);
        cacheImages(mergedImages); // Cache the fresh data
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      // Try to use cached images as fallback
      const cachedImages = loadCachedImages();
      if (cachedImages) {
        setImages(cachedImages);
      } else {
        setImages(DEFAULT_IMAGES);
      }
      setError(null); // Don't show errors to end users
      setServerConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load cached images immediately for faster initial render
    const cachedImages = loadCachedImages();
    if (cachedImages) {
      setImages(cachedImages);
      setIsLoading(false);
    }
    
    // Then fetch fresh data in the background
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
    
    // If no image found, try default images
    const defaultImage = DEFAULT_IMAGES[imageId];
    if (defaultImage?.current_url) {
      if (defaultImage.current_url.startsWith('/images/')) {
        return `http://localhost:8000${defaultImage.current_url}`;
      }
      return defaultImage.current_url;
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
    // Clear cache and fetch fresh data
    localStorage.removeItem(IMAGES_CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    fetchImages();
  };

  const clearCache = () => {
    localStorage.removeItem(IMAGES_CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    setImages(DEFAULT_IMAGES);
  };

  return {
    images,
    isLoading,
    error,
    serverConnected,
    getImageUrl,
    preloadImage,
    refreshImages,
    clearCache,
    imageLoadStates
  };
};