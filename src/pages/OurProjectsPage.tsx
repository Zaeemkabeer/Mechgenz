import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useWebsiteImages } from '../hooks/useWebsiteImages';
import AnimationWrapper from '../components/AnimationWrapper';

const OurProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState('CIVIL STRUCTURE');
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: string[] }>({});
  const [imagesReady, setImagesReady] = useState(false);
  const { getImageUrl, isLoading } = useWebsiteImages();
  
  const categories = ['CIVIL STRUCTURE', 'ROAD INFRASTRUCTURE', 'FIT OUT', 'SPECIAL INSTALLATION'];
  
  const projectImageConfigs = {
    'CIVIL STRUCTURE': [
      { id: 'portfolio_civil_1', fallback: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { id: 'portfolio_civil_2', fallback: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' }
    ],
    'ROAD INFRASTRUCTURE': [
      { id: 'portfolio_road_1', fallback: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { id: 'portfolio_road_2', fallback: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' }
    ],
    'FIT OUT': [
      { id: 'portfolio_fitout_1', fallback: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { id: 'portfolio_fitout_2', fallback: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' }
    ],
    'SPECIAL INSTALLATION': [
      { id: 'portfolio_special_1', fallback: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { id: 'portfolio_special_2', fallback: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' },
      { fallback: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1' }
    ]
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Preload all images when component mounts
  useEffect(() => {
    if (!isLoading) {
      const loadAllImages = async () => {
        const categoryImages: { [key: string]: string[] } = {};

        for (const [category, configs] of Object.entries(projectImageConfigs)) {
          const imagePromises = configs.map(async (config) => {
            if (config.id) {
              const imageUrl = getImageUrl(config.id, config.fallback);
              
              return new Promise<string>((resolve) => {
                const img = new Image();
                img.onload = () => resolve(imageUrl);
                img.onerror = () => resolve(config.fallback);
                img.src = imageUrl;
              });
            } else {
              return Promise.resolve(config.fallback);
            }
          });

          try {
            const results = await Promise.all(imagePromises);
            categoryImages[category] = results;
          } catch (error) {
            console.error(`Error loading images for ${category}:`, error);
            // Fallback to using fallback URLs
            categoryImages[category] = configs.map(config => config.fallback);
          }
        }

        setLoadedImages(categoryImages);
        setImagesReady(true);
      };

      loadAllImages();
    }
  }, [isLoading, getImageUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-5xl font-bold mb-6">Our Projects</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our diverse portfolio of successful construction projects across Qatar, showcasing our expertise in various construction sectors.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!imagesReady ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {/* Category Filter */}
              <AnimationWrapper animation="slideInUp" delay={200}>
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        activeCategory === category
                          ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </AnimationWrapper>

              {/* Projects Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loadedImages[activeCategory]?.map((image, index) => (
                  <AnimationWrapper key={`${activeCategory}-${index}`} animation="scaleIn" delay={index * 50}>
                    <div className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={image}
                          alt={`${activeCategory} Project ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="font-semibold">{activeCategory}</h4>
                          <p className="text-sm opacity-90">Project {index + 1}</p>
                        </div>
                      </div>
                    </div>
                  </AnimationWrapper>
                ))}
              </div>

              {/* Call to Action */}
              <AnimationWrapper animation="fadeInUp" delay={400}>
                <div className="text-center mt-16">
                  <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Ready to Start Your Next Project?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Let's discuss how we can bring your vision to life with our comprehensive construction services.
                    </p>
                    <Link
                      to="/#contact-us"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-block"
                    >
                      Contact Us Today
                    </Link>
                  </div>
                </div>
              </AnimationWrapper>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurProjectsPage;