import React from 'react';
import { Shield, Users, Eye, Leaf, Heart, Lock, Scale } from 'lucide-react';

const CodeOfEthics = () => {
  const ethicsPoints = [
    {
      number: '1',
      icon: <Heart className="h-8 w-8" />,
      title: 'Integrity and Honesty',
      description: 'We act with transparency, fairness, and honesty in all our dealings. We do what is right - even when no one is watching.'
    },
    {
      number: '2',
      icon: <Shield className="h-8 w-8" />,
      title: 'Safety and Quality First',
      description: 'We prioritize the health and safety of our people and stakeholders. Our commitment to quality ensures that every project and service meets or exceeds industry standards.'
    },
    {
      number: '3',
      icon: <Scale className="h-8 w-8" />,
      title: 'Compliance & Accountability',
      description: 'We strictly adhere to all applicable laws, regulations, and contractual obligations. We take full responsibility for our actions and outcomes.'
    },
    {
      number: '4',
      icon: <Leaf className="h-8 w-8" />,
      title: 'Environmental & Social Responsibility',
      description: 'We strive to minimize our environmental footprint and contribute positively to the communities in which we operate.'
    },
    {
      number: '5',
      icon: <Users className="h-8 w-8" />,
      title: 'Respect and Inclusion',
      description: 'We foster a workplace culture that values respect, diversity, and teamwork. Every voice matters, and every team member is treated with dignity.'
    },
    {
      number: '6',
      icon: <Lock className="h-8 w-8" />,
      title: 'Confidentiality and Data Protection',
      description: 'We protect the confidentiality of our clients\' information and intellectual property, and handle all data responsibly and securely.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" id="policy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-lg">OUR VALUES</span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-8">
            Code of Ethics
          </h2>
          <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-relaxed">
            At MECHGENZ Trading Contracting & Services, our reputation is built on the trust of our clients, partners, employees, and communities. We are committed to conducting our business with the highest ethical standards and professional integrity across all areas of operation.
          </p>
        </div>

        {/* Central Ethics Circle */}
        <div className="relative mb-16">
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <Eye className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Anti-Corruption</h3>
                  <h4 className="text-lg font-semibold mb-2">and Fair</h4>
                  <h4 className="text-lg font-semibold">Competition</h4>
                </div>
              </div>
              <div className="absolute inset-0 w-64 h-64 border-4 border-orange-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gray-300 leading-relaxed">
              We do not tolerate bribery, corruption, or unethical business practices. We compete fairly and uphold the principles of free and open markets.
            </p>
          </div>
        </div>

        {/* Ethics Points Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ethicsPoints.map((point, index) => (
            <div 
              key={index}
              className="group relative bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Number Badge */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {point.number}
              </div>
              
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
        <div className="text-center mt-16 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">Our Commitment</h3>
          <p className="text-gray-300 leading-relaxed max-w-4xl mx-auto">
            These ethical principles guide every decision we make and every action we take. They are not just words on a page, but the foundation of our corporate culture and the cornerstone of our relationships with all stakeholders. We believe that by upholding these values, we not only build a stronger company but also contribute to a better industry and society.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CodeOfEthics;