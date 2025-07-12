import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useWebsiteImages } from '../hooks/useWebsiteImages';
import AnimationWrapper from '../components/AnimationWrapper';

const OurProjectsPage = () => {
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [imagesReady, setImagesReady] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { getImageUrl, isLoading } = useWebsiteImages();
  
  const projectImageConfigs = [
    { 
      id: 'civil_structure_project_1',  // Updated to match Gallery Management
      fallback: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      title: 'Construction Project Alpha',
      description: 'Modern infrastructure development with advanced MEP systems integration'
    },
    { 
      id: 'road_infrastructure_project_1',  // Updated to match Gallery Management
      fallback: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      title: 'Infrastructure Project Beta',
      description: 'Comprehensive road and utility infrastructure development'
    },
    { 
      id: 'fit_out_project_1',  // Updated to match Gallery Management
      fallback: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      title: 'Commercial Project Gamma',
      description: 'High-end commercial fit-out with state-of-the-art facilities'
    }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Preload all images when component mounts
  useEffect(() => {
    if (!isLoading) {
      const loadAllImages = async () => {
        const imagePromises = projectImageConfigs.map(async (config) => {
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
          setLoadedImages(results);
          setImagesReady(true);
        } catch (error) {
          console.error('Error loading images:', error);
          // Fallback to using fallback URLs
          setLoadedImages(projectImageConfigs.map(config => config.fallback));
          setImagesReady(true);
        }
      };

      loadAllImages();
    }
  }, [isLoading, getImageUrl]);

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

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
              Explore our portfolio of successful construction projects across Qatar, showcasing our expertise in comprehensive construction and trading services.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!imagesReady ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading projects...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Section Title */}
              <AnimationWrapper animation="slideInUp" delay={200}>
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Projects</h2>
                  <div className="w-24 h-1 bg-orange-500 mx-auto mb-6"></div>
                  <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                    Discover our featured projects that demonstrate our commitment to excellence in construction, trading, and comprehensive industrial services.
                  </p>
                </div>
              </AnimationWrapper>

              {/* Projects Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loadedImages.map((image, index) => {
                  const project = projectImageConfigs[index];
                  return (
                    <AnimationWrapper key={index} animation="scaleIn" delay={index * 150}>
                      <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={image}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {/* Preview Button */}
                            <button
                              onClick={() => openPreview(image)}
                              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                              title="Preview Image"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            
                            {/* Project Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                              <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                              <p className="text-white/90 text-sm leading-relaxed">
                                {project.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed mb-4">
                            {project.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-orange-500 font-medium">
                              Project {index + 1}
                            </span>
                            <button
                              onClick={() => openPreview(image)}
                              className="text-orange-500 hover:text-orange-600 transition-colors duration-200 flex items-center space-x-1 text-sm font-medium"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </AnimationWrapper>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="relative max-w-6xl max-h-full w-full">
            {/* Close Button */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200 z-10 transform hover:scale-110"
              title="Close Preview"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={previewImage}
                alt="Project Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onError={() => {
                  console.error('Failed to load preview image');
                }}
              />
            </div>
            
            {/* Click outside to close */}
            <div 
              className="absolute inset-0 -z-10"
              onClick={closePreview}
            ></div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OurProjectsPage;