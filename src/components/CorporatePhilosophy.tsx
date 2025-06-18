import React from 'react';
import { Users, Target, Lightbulb, Leaf, Shield, Zap } from 'lucide-react';

const CorporatePhilosophy = () => {
  const philosophyPoints = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Client-Centered Approach',
      description: 'We listen, adapt, and respond to our clients\' needs with tailor-made solutions that deliver real value.'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'People-Driven Growth',
      description: 'Our people are our strength. We invest in continuous learning, professional development, and a culture of collaboration.'
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: 'Innovation with Purpose',
      description: 'We embrace innovation that enhances efficiency, safety, and sustainability—especially in complex industries like MEP and oil & gas.'
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: 'Sustainable Progress',
      description: 'We are committed to responsible business practices that contribute to long-term industry growth and environmental stewardship.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Resilience and Agility',
      description: 'As a new player in a competitive market, we operate with agility and resilience—ready to meet today\'s challenges and tomorrow\'s opportunities.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" id="philosophy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-lg">OUR FOUNDATION</span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-8">
            Corporate Philosophy
          </h2>
          <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-relaxed">
            At MECHGENZ, our philosophy is rooted in excellence, reliability, and partnership. We believe that success is built not only on technical capabilities but on relationships, trust, and a clear purpose.
          </p>
        </div>

        {/* Philosophy Points Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {philosophyPoints.map((point, index) => (
            <div 
              key={index}
              className="group bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="text-orange-400 mb-6 flex justify-center group-hover:text-orange-300 transition-colors duration-300">
                {point.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-4 text-center group-hover:text-orange-100 transition-colors duration-300">
                {point.title}
              </h3>
              <p className="text-gray-300 leading-relaxed text-center group-hover:text-gray-200 transition-colors duration-300">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Excellence Through Partnership</h3>
          <p className="text-gray-300 leading-relaxed max-w-4xl mx-auto">
            These principles guide every decision we make and every action we take. They form the foundation of our corporate culture and drive our commitment to delivering exceptional value to our clients, partners, and communities across the GCC region.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CorporatePhilosophy;