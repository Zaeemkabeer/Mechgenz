import React from 'react';
import { Wrench, Zap, Droplets, Shield, Settings, Monitor } from 'lucide-react';

const TradingDivision = () => {
  const tradingCategories = [
    {
      icon: <Wrench className="h-12 w-12" />,
      title: 'Mechanical Suppliers',
      items: [
        'HVAC Equipment (AHUs, FCUs, chillers, etc.)',
        'Ventilation fans, VAV boxes, ducts, and pipework',
        'Pumps, valves, expansion tanks, and HVAC control systems'
      ],
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      icon: <Zap className="h-12 w-12" />,
      title: 'Electrical Suppliers',
      items: [
        'Power and instrumentation cables',
        'Distribution boards, breakers, switches, and lighting',
        'Cable management and earthing systems'
      ],
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      icon: <Droplets className="h-12 w-12" />,
      title: 'Plumbing Suppliers',
      items: [
        'Full piping systems (PPR, PVC, HDPE, GI, copper)',
        'Water heaters, pumps, sanitary fixtures, and drainage components'
      ],
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      hoverColor: 'hover:bg-cyan-600'
    },
    {
      icon: <Shield className="h-12 w-12" />,
      title: 'Fire Fighting & Fire Alarm Systems',
      items: [
        'Sprinklers, fire hose reels, and extinguishers',
        'Fire alarm panels, detectors, and control systems'
      ],
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      hoverColor: 'hover:bg-red-600'
    }
  ];

  const bmsFeatures = [
    'Installation and integration of BMS for centralized control of HVAC, lighting, and energy systems',
    'SCADA Systems for industrial automation',
    'Supervisory Control and Data Acquisition systems for real-time monitoring',
    'Realtime monitoring and analysis capabilities',
    'Integration of renewable energy systems',
    'Advanced demand management solutions'
  ];

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
          {tradingCategories.map((category, index) => (
            <div 
              key={index}
              className={`group ${category.bgColor} p-8 rounded-2xl border border-gray-200 ${category.hoverColor} hover:text-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl`}
            >
              <div className={`${category.iconColor} group-hover:text-white mb-6 flex justify-center transition-colors duration-300`}>
                {category.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-6 text-center transition-colors duration-300">
                {category.title}
              </h3>
              
              <ul className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${category.iconColor.replace('text-', 'bg-')} group-hover:bg-white rounded-full mt-2 flex-shrink-0 transition-colors duration-300`}></div>
                    <span className="text-gray-700 group-hover:text-white transition-colors duration-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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