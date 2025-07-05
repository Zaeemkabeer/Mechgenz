import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimationWrapper from './AnimationWrapper';

const Portfolio = () => {
  return (
    <section className="py-20 bg-gray-50" id="portfolio">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimationWrapper>
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-lg">EXPLORE OUR WORK</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-8">
              Building Excellence Together
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Discover our comprehensive range of construction and trading services that have made us a trusted partner across Qatar and the GCC region.
            </p>
          </div>
        </AnimationWrapper>

        {/* Call to Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <AnimationWrapper animation="slideInLeft">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">View Our Projects</h3>
                <p className="text-orange-100 text-lg mb-8 leading-relaxed">
                  Explore our diverse portfolio of successful construction projects across Qatar, showcasing our expertise in civil structure, road infrastructure, fit-out, and special installations.
                </p>
                <Link
                  to="/our-projects"
                  className="inline-flex items-center space-x-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span>Explore Projects</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
            </div>
          </AnimationWrapper>

          <AnimationWrapper animation="slideInRight">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Meet Our Clients</h3>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Learn about our valued partnerships with leading organizations across the oil & gas, infrastructure, industrial, and commercial sectors throughout the GCC region.
                </p>
                <Link
                  to="/our-clients"
                  className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <span>View Clients</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/20 rounded-full transform translate-x-14 -translate-y-14"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-500/20 rounded-full transform -translate-x-10 translate-y-10"></div>
            </div>
          </AnimationWrapper>
        </div>

        {/* Contact Section */}
        <AnimationWrapper animation="fadeInUp" delay={400}>
          <div className="mt-16 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Next Project?</h3>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-6">
                Let's discuss how we can bring your vision to life with our comprehensive construction and trading services. Contact us today for a consultation.
              </p>
              <a
                href="#contact-us"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <span>Contact Us Today</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </AnimationWrapper>
      </div>
    </section>
  );
};

export default Portfolio;