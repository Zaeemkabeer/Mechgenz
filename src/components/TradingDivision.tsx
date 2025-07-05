import React, { useState, useEffect } from 'react';
import { Wrench, Zap, Droplets, Shield, Settings, Monitor } from 'lucide-react';
import { useWebsiteImages } from '../hooks/useWebsiteImages';

const TradingDivision = () => {
  const { getImageUrl, isLoading } = useWebsiteImages();
  const [categoryImages, setCategoryImages] = useState<{ [key: string]: string }>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const tradingCategories = [
    {
      id: 'mechanical_suppliers',
      icon: <Wrench className="h-12 w-12" />,
      title: 'Mechanical Suppliers',
      items: [
        'HVAC Equipment (AHUs, FCUs, chillers, etc.)',
        'Ventilation fans, VAV boxes, ducts, and pipework',
        'Pumps, valves, expansion tanks, and HVAC control systems'
      ],
      fallbackImage: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
    },
    {
      id: 'electrical_suppliers',
      icon: <Zap className="h-12 w-12" />,
      title: 'Electrical Suppliers',
      items: [
        'Power and instrumentation cables',
        'Distribution boards, breakers, switches, and lighting',
        'Cable management and earthing systems'
      ],
      fallbackImage: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
    },
    {
      id: 'plumbing_suppliers',
      icon: <Droplets className="h-12 w-12" />,
      title: 'Plumbing Suppliers',
      items: [
        'Full piping systems (PPR, PVC, HDPE, GI, copper)',
        'Water heaters, pumps, sanitary fixtures, and drainage components'
      ],
      fallbackImage: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
    },
    {
      id: 'fire_fighting_suppliers',
      icon: <Shield className="h-12 w-12" />,
      title: 'Fire Fighting & Fire Alarm Systems',
      items: [
        'Sprinklers, fire hose reels, and extinguishers',
        'Fire alarm panels, detectors, and control systems'
      ],
      fallbackImage: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
    }
  ];

  useEffect(() => {
    if (!isLoading) {
      const loadCategoryImages = async () => {
        const imagePromises = tradingCategories.map(async (category) => {
          const imageUrl = getImageUrl(category.id, category.fallbackImage);
          
          return new Promise<{ id: string; url: string }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ id: category.id, url: imageUrl });
            img.onerror = () => resolve({ id: category.id, url: category.fallbackImage });
            img.src = imageUrl;
          });
        });

        try {
          const results = await Promise.all(imagePromises);
          const imageMap = results.reduce((acc, { id, url }) => {
            acc[id] = url;
            return acc;
          }, {} as { [key: string]: string });
          
          setCategoryImages(imageMap);
          setImagesLoaded(true);
        } catch (error) {
          console.error('Error loading category images:', error);
          // Fallback to using fallback URLs
          const fallbackMap = tradingCategories.reduce((acc, category) => {
            acc[category.id] = category.fallbackImage;
            return acc;
          }, {} as { [key: string]: string });
          setCategoryImages(fallbackMap);
          setImagesLoaded(true);
        }
      };

      loadCategoryImages();
    }
  }, [isLoading, getImageUrl]);

  // Function to determine text color based on image brightness
  const getTextColorClass = (imageUrl: string) => {
    // For now, we'll use a simple approach based on the image URL
    // In a real implementation, you might analyze the actual image brightness
    const darkImages = [
      'keys-workshop-mechanic-tools',
      'electrical',
      'fire',
      'industrial'
    ];
    
    const isDarkImage = darkImages.some(keyword => imageUrl.toLowerCase().includes(keyword));
    return isDarkImage ? 'text-white' : 'text-gray-900';
  };

  const bmsFeatures = [
    'Installation and integration of BMS for centralized control of HVAC, lighting, and energy systems',
    'SCADA Systems for industrial automation',
    'Supervisory Control and Data Acquisition systems for real-time monitoring',
    'Realtime monitoring and analysis capabilities',
    'Integration of renewable energy systems',
    'Advanced demand management solutions'
  ];

  if (!imagesLoaded) {
    return (
      <section className="py-20 bg-gray-50" id="trading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50" id="trading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-lg">TRADING DIVISION</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-8">
            High-Quality Materials & Equipment
          </h2>
          <p className="text-gray-600 text-lg max-w-4xl mx-auto leading-relaxed">
            MECHGENZ Trading delivers high-quality materials and equipment for MEP, civil, electrical, plumbing, and fire systems. Our comprehensive range ensures reliable supply from reputable global manufacturers.
          </p>
        </div>

        {/* Trading Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {tradingCategories.map((category, index) => {
            const backgroundImage = categoryImages[category.id];
            const textColorClass = getTextColorClass(backgroundImage);
            
            return (
              <div 
                key={index}
                className="group relative overflow-hidden p-8 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 min-h-[400px] flex flex-col justify-between"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Background overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 group-hover:from-black/80 group-hover:via-black/50 group-hover:to-black/40 transition-all duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className="text-white mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-6 text-center group-hover:text-orange-300 transition-colors duration-300">
                    {category.title}
                  </h3>
                  
                  {/* Items List */}
                  <ul className="space-y-3 flex-grow">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-400 group-hover:bg-orange-300 rounded-full mt-2 flex-shrink-0 transition-colors duration-300"></div>
                        <span className="text-white/90 group-hover:text-white transition-colors duration-300 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Hover effect indicator */}
                  <div className="mt-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-block px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium">
                      Learn More
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BMS & Instrumentation Systems Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <Monitor className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4">BMS & Instrumentation Systems</h3>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-6"></div>
            <p className="text-gray-300 leading-relaxed max-w-4xl mx-auto">
              At MECHGENZ Trading Contracting & Services, we provide end-to-end ELV (Extra Low Voltage) solutions designed to enhance building intelligence, safety, and connectivity. Our team of certified engineers and technicians ensures the seamless integration of advanced systems that meet the growing demands of smart infrastructure and critical facilities.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-bold text-orange-400 mb-6">Building Management Systems (BMS)</h4>
              <div className="space-y-4">
                {bmsFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <div className="flex justify-center mb-6">
                  <Settings className="h-16 w-16 text-orange-400" />
                </div>
                <h5 className="text-xl font-bold text-center mb-4">Smart Infrastructure Solutions</h5>
                <p className="text-gray-300 text-center leading-relaxed">
                  Comprehensive integration of building automation systems, energy management, and intelligent monitoring for enhanced operational efficiency and sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Assurance Section */}
        <div className="mt-16 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality & Reliability Guaranteed</h3>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
              All our products are sourced from reputable global manufacturers and undergo rigorous quality checks. We ensure compliance with international standards and provide comprehensive technical support for all supplied equipment and materials.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingDivision;