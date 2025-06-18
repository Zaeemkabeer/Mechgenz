import React from 'react';
import { Users, Shield, Target } from 'lucide-react';

const AboutSection = () => {
  const focusAreas = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Communication',
      description: 'Clear and consistent communication throughout every project phase'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Client-centered service',
      description: 'Tailored solutions that exceed client expectations every time'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Health, Safety and Environment',
      description: 'Uncompromising commitment to safety and environmental responsibility'
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="about-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Construction equipment and helmet"
              className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-orange-500 p-6 rounded-xl shadow-lg">
              <div className="text-white text-center">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm">Years Experience</div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-8">
            <div>
              <span className="text-orange-500 font-semibold text-lg">WHO WE ARE</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6">
                Building Excellence in Qatar's Growing Market
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                MECHGENZ, based in Qatar and established itself as a visionary company with a diverse project focus, quality work and a team of people committed to integrity and professionalism. The company aims to provide the growing demands of the Qatari market, known as the fastest and stable economy in the GCC region.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg mt-4">
                MECHGENZ's expertise as a fully licensed sub and general contractor is capable of handling all of your needs. Our clients recognize our commitment to deliver the highest quality.
              </p>
            </div>

            {/* Focus Areas */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Our Key Focus Areas</h3>
              <div className="space-y-4">
                {focusAreas.map((area, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="text-orange-500 flex-shrink-0">
                      {area.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{area.title}</h4>
                      <p className="text-gray-600 text-sm">{area.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Know More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;