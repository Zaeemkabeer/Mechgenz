import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimationWrapper from '../components/AnimationWrapper';

const OurClientsPage = () => {
  const [currentClient, setCurrentClient] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Client data based on the uploaded image
  const clients = [
    {
      name: 'BOLTEC',
      subtitle: 'METAL WORKSHOP',
      logo: '/api/placeholder/200/100', // You'll need to add these logos to your public folder
      description: 'Leading metal workshop and fabrication services provider',
      sector: 'Manufacturing'
    },
    {
      name: 'EMCO',
      subtitle: 'QATAR',
      logo: '/api/placeholder/200/100',
      description: 'Premier construction and engineering solutions company',
      sector: 'Construction'
    },
    {
      name: 'Bin Salama',
      subtitle: 'PLASTIC RECYCLING',
      logo: '/api/placeholder/200/100',
      description: 'Environmental solutions and plastic recycling specialist',
      sector: 'Environmental'
    },
    {
      name: 'ELLORA GROUP',
      subtitle: 'quality forever',
      logo: '/api/placeholder/200/100',
      description: 'Quality-focused industrial and commercial services',
      sector: 'Industrial'
    },
    {
      name: 'Qatar Aeronautical College',
      subtitle: '',
      logo: '/api/placeholder/200/100',
      description: 'Leading aviation education and training institution',
      sector: 'Education'
    },
    {
      name: 'ASPIRE ZONE',
      subtitle: '',
      logo: '/api/placeholder/200/100',
      description: 'World-class sports and recreational facilities',
      sector: 'Sports & Recreation'
    },
    {
      name: 'Aalaf',
      subtitle: 'آعلاف',
      logo: '/api/placeholder/200/100',
      description: 'Agricultural and livestock feed solutions',
      sector: 'Agriculture'
    },
    {
      name: 'QJet',
      subtitle: 'كيوجت',
      logo: '/api/placeholder/200/100',
      description: 'Aviation and transportation services',
      sector: 'Aviation'
    },
    {
      name: 'KATARA',
      subtitle: 'HOSPITALITY',
      logo: '/api/placeholder/200/100',
      description: 'Luxury hospitality and cultural experiences',
      sector: 'Hospitality'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentClient((prev) => (prev + 1) % clients.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, clients.length]);

  const nextClient = () => {
    setCurrentClient((prev) => (prev + 1) % clients.length);
    setIsAutoPlaying(false);
  };

  const prevClient = () => {
    setCurrentClient((prev) => (prev - 1 + clients.length) % clients.length);
    setIsAutoPlaying(false);
  };

  const goToClient = (index: number) => {
    setCurrentClient(index);
    setIsAutoPlaying(false);
  };

  const currentClientData = clients[currentClient];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-5xl font-bold mb-6">Our Valued Clients</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Trusted partnerships with leading organizations across Qatar and the GCC region
            </p>
          </div>
        </div>
      </section>

      {/* Main Client Display */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Client Card */}
            <AnimationWrapper key={currentClient} animation="scaleIn">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 lg:p-16 border border-white/20 text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full transform -translate-x-24 translate-y-24"></div>
                
                <div className="relative z-10">
                  {/* Client Logo */}
                  <div className="mb-8">
                    <div className="w-48 h-32 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <div className="text-white/60 text-sm">
                        {currentClientData.name} Logo
                      </div>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="space-y-4 mb-8">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white">
                      {currentClientData.name}
                    </h2>
                    {currentClientData.subtitle && (
                      <p className="text-xl text-orange-300 font-medium">
                        {currentClientData.subtitle}
                      </p>
                    )}
                    <div className="inline-block px-4 py-2 bg-orange-500/20 rounded-full border border-orange-500/30">
                      <span className="text-orange-300 font-medium">
                        {currentClientData.sector}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                    {currentClientData.description}
                  </p>
                </div>
              </div>
            </AnimationWrapper>

            {/* Navigation Buttons */}
            <button
              onClick={prevClient}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 border border-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextClient}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 border border-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Client Indicators */}
          <div className="flex justify-center mt-12 space-x-3">
            {clients.map((_, index) => (
              <button
                key={index}
                onClick={() => goToClient(index)}
                className={`transition-all duration-300 ${
                  index === currentClient 
                    ? 'w-12 h-3 bg-orange-500 rounded-full' 
                    : 'w-3 h-3 bg-white/30 rounded-full hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Client Counter */}
          <div className="text-center mt-8">
            <span className="text-white/60 text-lg">
              {currentClient + 1} of {clients.length}
            </span>
          </div>
        </div>
      </section>

      {/* Auto-play Control */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              isAutoPlaying 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <AnimationWrapper animation="bounceIn" delay={100}>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">{clients.length}+</div>
                <div className="text-white/80 font-medium">Trusted Clients</div>
              </div>
            </AnimationWrapper>
            <AnimationWrapper animation="bounceIn" delay={200}>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">150+</div>
                <div className="text-white/80 font-medium">Projects Completed</div>
              </div>
            </AnimationWrapper>
            <AnimationWrapper animation="bounceIn" delay={300}>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">15+</div>
                <div className="text-white/80 font-medium">Years Experience</div>
              </div>
            </AnimationWrapper>
            <AnimationWrapper animation="bounceIn" delay={400}>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">100%</div>
                <div className="text-white/80 font-medium">Client Satisfaction</div>
              </div>
            </AnimationWrapper>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimationWrapper animation="fadeInUp">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 lg:p-12 text-white text-center">
              <h3 className="text-3xl font-bold mb-4">Join Our Client Family</h3>
              <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                Ready to experience the MECHGENZ difference? Let's discuss how we can support your next project with our comprehensive services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/#contact-us"
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Start Your Project
                </Link>
                <Link
                  to="/our-projects"
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 border border-white/20"
                >
                  View Our Work
                </Link>
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurClientsPage;