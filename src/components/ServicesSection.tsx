import React from 'react';
import { Loader as Road, Truck, HardHat, Home } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: <Road className="h-12 w-12" />,
      title: 'Roads Construction',
      description: 'Professional road construction and infrastructure development services'
    },
    {
      icon: <Truck className="h-12 w-12" />,
      title: 'Site Preparation',
      description: 'Complete site preparation and earthwork services for all construction projects'
    },
    {
      icon: <HardHat className="h-12 w-12" />,
      title: 'Construction',
      description: 'Full-scale construction services from foundation to completion'
    },
    {
      icon: <Home className="h-12 w-12" />,
      title: 'Interior Fit out',
      description: 'Professional interior design and fit-out services for commercial spaces'
    }
  ];

  return (
    <section className="py-20 bg-white" id="business">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-lg">OUR SERVICES</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-8">
            Comprehensive Construction Solutions
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              We MECHGENZ W.L.L., a general contracting company in the State of Qatar, has more than 15 years of extensive knowledge and experience in civil works for infrastructures and buildings. MECHGENZ group entered in Qatari market to provide the strength of a solid partnership and the professionalism of a well-structured team, creating turnkey solutions to meet the clients' need.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              For over the past years of our experience in this field and delivering services from different cities and other countries, our commitment to bring the standard service in this country is our forefront of priorities. We are committed in investing time and energy in building long term relationships, ensuring to provide a high quality, on time and cost effective service to clients and stakeholders.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-gray-50 p-8 rounded-2xl text-center hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="text-orange-500 group-hover:text-white mb-6 flex justify-center">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-white">
                {service.title}
              </h3>
              <p className="text-gray-600 group-hover:text-white/90 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-orange-500 mb-2">500+</div>
            <div className="text-gray-600">Projects Completed</div>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-orange-500 mb-2">15+</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-orange-500 mb-2">100%</div>
            <div className="text-gray-600">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;