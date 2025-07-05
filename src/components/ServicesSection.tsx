import React from 'react';
import { Loader as Road, Truck, HardHat, Home, Cog, Wrench, Building, Zap } from 'lucide-react';
import AnimationWrapper from './AnimationWrapper';

const ServicesSection = () => {
  const mainServices = [
    {
      icon: <Building className="h-12 w-12" />,
      title: 'Civil, Mechanical & Electrical Works',
      description: 'Comprehensive construction services executed by skilled professionals with modern tools and equipment'
    },
    {
      icon: <Cog className="h-12 w-12" />,
      title: 'CAD & Engineering Support',
      description: 'Specialized 2D/3D modeling, design validation, and digital conversion using PDMS, CAESAR II, STAAD Pro, Bentley, HAP and AutoCAD'
    },
    {
      icon: <Wrench className="h-12 w-12" />,
      title: 'Maintenance & Technical Support',
      description: 'End-to-end support in maintenance, fabrication, manpower supply, and technical assistance with efficiency and integrity'
    },
    {
      icon: <Truck className="h-12 w-12" />,
      title: 'Trading & Supply',
      description: 'Reliable supply of industrial materials, equipment, and consumables from reputable global manufacturers'
    }
  ];

  const specializedServices = [
    {
      icon: <Road className="h-12 w-12" />,
      title: 'Infrastructure Development',
      description: 'Road construction and infrastructure development services across Qatar and the GCC region'
    },
    {
      icon: <Home className="h-12 w-12" />,
      title: 'Interior Fit-out',
      description: 'Professional interior design and fit-out services for commercial and industrial spaces'
    },
    {
      icon: <Zap className="h-12 w-12" />,
      title: 'MEP Systems Integration',
      description: 'Mechanical, Electrical, and Plumbing systems integration with streamlined coordination'
    },
    {
      icon: <HardHat className="h-12 w-12" />,
      title: 'Turnaround & Shutdown Services',
      description: 'Comprehensive maintenance services to enhance performance and align with operational standards'
    }
  ];

  return (
    <section className="py-20 bg-white" id="business">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimationWrapper>
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-lg">OUR SERVICES</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-8">
              Comprehensive Industrial Solutions
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                We are a Qatar-based design and engineering services company that delivers innovative, value-driven solutions across the GCC region. With a proven track record in Oil & Gas, Petrochemicals, Chemicals, Pharmaceuticals, and Infrastructure, we offer deep technical expertise combined with smart, practical design approaches tailored to regional project requirements.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Our multidisciplinary team of engineers and specialists understands the regulatory standards and operational demands of the Gulf market. We deliver high-quality, scalable solutions that align with local codes and international best practices, ensuring successful project execution from concept to completion.
              </p>
            </div>
          </div>
        </AnimationWrapper>

        {/* Main Services Grid */}
        <div className="mb-16">
          <AnimationWrapper>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Core Services</h3>
          </AnimationWrapper>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mainServices.map((service, index) => (
              <AnimationWrapper key={index} animation="scaleIn" delay={index * 100}>
                <div className="group bg-gray-50 p-8 rounded-2xl text-center hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
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
              </AnimationWrapper>
            ))}
          </div>
        </div>

        {/* Specialized Services */}
        <div className="mb-16">
          <AnimationWrapper>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Specialized Solutions</h3>
          </AnimationWrapper>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {specializedServices.map((service, index) => (
              <AnimationWrapper key={index} animation="slideInUp" delay={index * 150}>
                <div className="group bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl text-center hover:from-orange-500 hover:to-orange-600 hover:text-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
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
              </AnimationWrapper>
            ))}
          </div>
        </div>

        {/* Construction Capabilities */}
        <AnimationWrapper animation="fadeInUp">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Construction Excellence</h3>
              <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <AnimationWrapper animation="slideInLeft" delay={200}>
                <div>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    At MECHGENZ, we believe that project success is best achieved through streamlined coordination and minimal fragmentation. By acting as a single point of contact for both design including specifications, costing, planning and build encompassing MEP works, Electrical and Mechanical systems integration, we minimize the risk of delays, miscommunication, and scope misalignment.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    With in-house capabilities across engineering, procurement, and construction disciplines, we are well-positioned to deliver integrated, cost-effective solutions. Our agile structure enables us to respond swiftly to client requirements and consistently meet the demanding standards of the Oil & Gas, Infrastructure, and MEP sectors throughout Qatar and the GCC region.
                  </p>
                </div>
              </AnimationWrapper>
              
              <AnimationWrapper animation="slideInRight" delay={400}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Small and medium-scale mechanical fabrication and erection</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Full compliance to project specifications and quality assurance</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Internationally recognized HSE standards</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Deep market insight and clear understanding of client objectives</span>
                  </div>
                </div>
              </AnimationWrapper>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
};

export default ServicesSection;