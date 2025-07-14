import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWebsiteImages } from '../hooks/useWebsiteImages';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [imagesReady, setImagesReady] = useState(false);
  const { getImageUrl, isLoading } = useWebsiteImages();
  const navigate = useNavigate();
  
  const slideConfigs = [
    {
      imageId: 'hero_slide_1',
      fallback: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'RESPONSIBLE INFRASTRUCTURE',
      subtitle: 'we take your vision forward'
    },
    {
      imageId: 'hero_slide_2',
      fallback: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'BUILDING THE FUTURE',
      subtitle: 'innovative construction solutions'
    },
    {
      imageId: 'hero_slide_3',
      fallback: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'EXCELLENCE IN CONSTRUCTION',
      subtitle: 'delivering quality projects on time'
    }
  ];

  // Preload all images when component mounts
  useEffect(() => {
    if (!isLoading) {
      const loadAllImages = async () => {
        const imagePromises = slideConfigs.map(async (config) => {
          const imageUrl = getImageUrl(config.imageId, config.fallback);
          
          return new Promise<string>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(imageUrl);
            img.onerror = () => resolve(config.fallback);
            img.src = imageUrl;
          });
        });

        try {
          const results = await Promise.all(imagePromises);
          setLoadedImages(results);
          setImagesReady(true);
        } catch (error) {
          console.error('Error loading images:', error);
          // Fallback to using fallback URLs
          setLoadedImages(slideConfigs.map(config => config.fallback));
          setImagesReady(true);
        }
      };

      loadAllImages();
    }
  }, [isLoading, getImageUrl]);

  // Auto-slide functionality
  useEffect(() => {
    if (!imagesReady) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideConfigs.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [imagesReady, slideConfigs.length]);

  const nextSlide = () => {
    if (!imagesReady) return;
    setCurrentSlide((prev) => (prev + 1) % slideConfigs.length);
  };

  const prevSlide = () => {
    if (!imagesReady) return;
    setCurrentSlide((prev) => (prev - 1 + slideConfigs.length) % slideConfigs.length);
  };

  const goToSlide = (index: number) => {
    if (!imagesReady) return;
    setCurrentSlide(index);
  };

  const handleExploreWork = () => {
    navigate('/our-projects');
  };

  // Show loading state until images are ready
  if (!imagesReady) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800"></div>
        <div className="relative z-10 text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {slideConfigs.map((config, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full bg-gray-900">
            <img
              src={loadedImages[index]}
              alt={`Construction slide ${index + 1}`}
              className="w-full h-full object-cover"
              style={{ 
                opacity: loadedImages[index] ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Orange Geometric Overlay */}
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-orange-500 transform rotate-45 opacity-80 hidden md:block" />
      <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-orange-500 transform rotate-12 opacity-60 hidden lg:block" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
          {slideConfigs[currentSlide].title}
        </h1>
        <p className="text-xl md:text-2xl font-light mb-8 animate-fade-in-up animation-delay-300">
          {slideConfigs[currentSlide].subtitle}
        </p>
        <button 
          onClick={handleExploreWork}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-600"
        >
          Explore Our Work
        </button>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        disabled={!imagesReady}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        disabled={!imagesReady}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slideConfigs.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={!imagesReady}
            className={`w-3 h-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
              index === currentSlide ? 'bg-orange-500 scale-125' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;