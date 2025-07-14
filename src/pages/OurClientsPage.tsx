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

  // Client data with all real logos
  const clients = [
    {
      name: 'BOLTEC',
      subtitle: 'METAL WORKSHOP',
      logo: '/client-logos/Boltec-logo-02-01-qqwddvmop7iznrh1vawlqecj4rlvl84zaypr3h3cwg.png',
      description: 'Leading metal workshop and fabrication services provider specializing in precision metalwork and industrial fabrication solutions.',
      sector: 'Manufacturing',
      services: ['Metal Fabrication', 'Welding Services', 'Industrial Equipment']
    },
    {
      name: 'ASPIRE ZONE',
      subtitle: 'SPORTS & RECREATION',
      logo: '/client-logos/azf_logo.png',
      description: 'World-class sports and recreational facilities providing comprehensive sports infrastructure and community wellness programs.',
      sector: 'Sports & Recreation',
      services: ['Sports Facilities', 'Recreation Centers', 'Community Programs']
    },
    {
      name: 'Aalaf',
      subtitle: 'أعلاف',
      logo: '/client-logos/Alaaf-Logo-in-square-size.png',
      description: 'Leading agricultural and livestock feed solutions provider, delivering high-quality nutrition products for the agricultural sector.',
      sector: 'Agriculture',
      services: ['Animal Feed', 'Agricultural Solutions', 'Nutrition Products']
    },
    {
      name: 'QJet',
      subtitle: 'كيوجت',
      logo: '/client-logos/images.png',
      description: 'Premium aviation and transportation services company providing comprehensive logistics and travel solutions across the region.',
      sector: 'Aviation',
      services: ['Aviation Services', 'Transportation', 'Logistics Solutions']
    },
    {
      name: 'Qatar Aeronautical College',
      subtitle: 'AVIATION EDUCATION',
      logo: '/client-logos/qatar-aeronautical-college-logo.png',
      description: 'Leading aviation education and training institution developing the next generation of aviation professionals with world-class facilities.',
      sector: 'Education',
      services: ['Aviation Training', 'Professional Development', 'Technical Education']
    },
    {
      name: 'KATARA',
      subtitle: 'HOSPITALITY',
      logo: '/client-logos/katara-hospitality-logo.png',
      description: 'Luxury hospitality and cultural experiences provider, showcasing Qatar\'s rich heritage and modern excellence in world-class venues.',
      sector: 'Hospitality',
      services: ['Luxury Hotels', 'Cultural Events', 'Hospitality Services']
    },
    {
      name: 'EMCO',
      subtitle: 'QATAR',
      logo: '/client-logos/emco-qatar-logo.png',
      description: 'Premier construction and engineering solutions company delivering innovative infrastructure projects across Qatar with cutting-edge technology.',
      sector: 'Construction',
      services: ['Construction', 'Engineering', 'Infrastructure']
    },
    {
      name: 'MANNAI ENERGY',
      subtitle: 'QATAR',
      logo: '/client-logos/mannai.jpg',
      description: 'Diversified industrial conglomerate providing comprehensive engineering services, equipment supply, and technical solutions to Qatar\'s oil & gas, infrastructure, and energy sectors with over 70 years of market leadership.',
      sector: 'Energy & Industrial',
      services: ['Oil & Gas Equipment', 'Infrastructure Solutions', 'Engineering Services']
    },
    {
      name: 'ATKINSRÉALIS',
      subtitle: 'GLOBAL ENGINEERING',
      logo: '/client-logos/atkinsrealis.jpg',
      description: 'World-leading engineering services and project management company connecting people, data and technology to transform global infrastructure and energy systems across 160+ countries.',
      sector: 'Engineering & Construction',
      services: ['Design & Engineering', 'Project Management', 'Infrastructure Solutions']
    },
    {
      name: 'Bin Salama',
      subtitle: 'PLASTIC RECYCLING',
      logo: '/client-logos/bin-salama-logo.png',
      description: 'Environmental solutions and plastic recycling specialist committed to sustainable waste management and circular economy practices.',
      sector: 'Environmental',
      services: ['Plastic Recycling', 'Waste Management', 'Environmental Solutions']
    },
    {
      name: 'ELLORA GROUP',
      subtitle: 'quality forever',
      logo: '/client-logos/ellora-group-logo.png',
      description: 'Quality-focused industrial and commercial services provider with a commitment to excellence and innovation in every project delivered.',
      sector: 'Industrial',
      services: ['Industrial Services', 'Commercial Solutions', 'Quality Assurance']
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
                    <div className="w-72 h-44 mx-auto bg-white/95 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 p-6 shadow-lg">
                      <img
                        src={currentClientData.logo}
                        alt={`${currentClientData.name} Logo`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="text-gray-600 text-lg font-bold text-center">
                                ${currentClientData.name}
                                <br />
                                <span class="text-sm text-gray-500 font-medium">${currentClientData.subtitle}</span>
                              </div>
                            `;
                          }
                        }}
                      />
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
                    <div className="inline-block px-6 py-3 bg-orange-500/20 rounded-full border border-orange-500/30">
                      <span className="text-orange-300 font-semibold text-lg">
                        {currentClientData.sector}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
                    {currentClientData.description}
                  </p>

                  {/* Services */}
                  {currentClientData.services && (
                    <div className="flex flex-wrap justify-center gap-3">
                      {currentClientData.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-5 py-2 bg-white/10 text-white/90 rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AnimationWrapper>

            {/* Navigation Buttons */}
            <button
              onClick={prevClient}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 border border-white/20 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextClient}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 border border-white/20 hover:scale-110"
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