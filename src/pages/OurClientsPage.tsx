import React, { useEffect } from 'react';
import { ArrowLeft, Building, Award, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimationWrapper from '../components/AnimationWrapper';

const OurClientsPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const clientCategories = [
    {
      icon: <Building className="h-12 w-12" />,
      title: 'Oil & Gas Sector',
      description: 'Leading energy companies across the GCC region',
      clients: ['Qatar Petroleum', 'ExxonMobil', 'Shell', 'Total Energies', 'ConocoPhillips', 'Chevron']
    },
    {
      icon: <Globe className="h-12 w-12" />,
      title: 'Infrastructure',
      description: 'Government and private infrastructure projects',
      clients: ['Qatar Rail', 'Ashghal', 'Ministry of Transport', 'Qatar Airways', 'Hamad International Airport', 'Public Works Authority']
    },
    {
      icon: <Award className="h-12 w-12" />,
      title: 'Industrial',
      description: 'Manufacturing and industrial facilities',
      clients: ['Qatar Steel', 'Industries Qatar', 'Qatofin', 'QAPCO', 'Qatar Fertiliser Company', 'Mesaieed Industrial City']
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: 'Commercial',
      description: 'Commercial buildings and retail spaces',
      clients: ['Msheireb Properties', 'Barwa Real Estate', 'UDC', 'Ezdan Holding', 'Qatari Diar', 'Al Futtaim Group']
    }
  ];

  const testimonials = [
    {
      quote: "MECHGENZ has consistently delivered high-quality MEP solutions for our projects. Their attention to detail and commitment to safety standards is exceptional.",
      author: "Ahmed Al-Mansouri",
      position: "Project Manager",
      company: "Qatar Petroleum"
    },
    {
      quote: "Working with MECHGENZ on our infrastructure projects has been a great experience. They understand the complexities of large-scale construction.",
      author: "Sarah Johnson",
      position: "Engineering Director",
      company: "Qatar Rail"
    },
    {
      quote: "Their trading division provides reliable supply of quality materials. MECHGENZ is our trusted partner for industrial equipment procurement.",
      author: "Mohammed Al-Thani",
      position: "Procurement Manager",
      company: "Industries Qatar"
    },
    {
      quote: "The team at MECHGENZ brings innovative solutions to every project. Their expertise in MEP systems integration is unmatched in the region.",
      author: "Lisa Chen",
      position: "Technical Director",
      company: "Msheireb Properties"
    },
    {
      quote: "MECHGENZ has been instrumental in our facility upgrades. Their professional approach and timely delivery make them our preferred contractor.",
      author: "Omar Hassan",
      position: "Operations Manager",
      company: "Qatar Steel"
    },
    {
      quote: "From design to execution, MECHGENZ delivers excellence. Their comprehensive services have streamlined our project management significantly.",
      author: "Jennifer Williams",
      position: "Project Coordinator",
      company: "Hamad International Airport"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-5xl font-bold mb-6">Our Clients</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We are proud to serve leading organizations across Qatar and the GCC region, delivering exceptional results that build lasting partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* Client Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <AnimationWrapper animation="bounceIn" delay={100}>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">150+</div>
                <div className="text-gray-600 font-medium">Projects Completed</div>
              </div>
            </AnimationWrapper>
            <AnimationWrapper animation="bounceIn" delay={200}>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">50+</div>
                <div className="text-gray-600 font-medium">Satisfied Clients</div>
              </div>
            </AnimationWrapper>
            <AnimationWrapper animation="bounceIn" delay={300}>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">15+</div>
                <div className="text-gray-600 font-medium">Years Experience</div>
              </div>
            </AnimationWrapper>
            <AnimationWrapper animation="bounceIn" delay={400}>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">100%</div>
                <div className="text-gray-600 font-medium">Client Satisfaction</div>
              </div>
            </AnimationWrapper>
          </div>
        </div>
      </section>

      {/* Client Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Client Portfolio</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                We serve diverse industries with specialized expertise and tailored solutions for each sector's unique requirements.
              </p>
            </div>
          </AnimationWrapper>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {clientCategories.map((category, index) => (
              <AnimationWrapper key={index} animation="scaleIn" delay={index * 100}>
                <div className="group bg-gray-50 p-8 rounded-2xl text-center hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
                  <div className="text-orange-500 group-hover:text-white mb-6 flex justify-center">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-white">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-white/90 mb-6 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.clients.map((client, clientIndex) => (
                      <div key={clientIndex} className="text-sm text-gray-500 group-hover:text-white/80 font-medium">
                        {client}
                      </div>
                    ))}
                  </div>
                </div>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimationWrapper>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
              <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
            </div>
          </AnimationWrapper>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimationWrapper key={index} animation="slideInUp" delay={index * 200}>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 h-full flex flex-col">
                  <div className="flex-grow mb-6">
                    <div className="text-orange-400 text-4xl mb-4">"</div>
                    <p className="text-gray-300 leading-relaxed italic">
                      {testimonial.quote}
                    </p>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <h4 className="font-semibold text-white">{testimonial.author}</h4>
                    <p className="text-orange-400 text-sm">{testimonial.position}</p>
                    <p className="text-gray-400 text-sm">{testimonial.company}</p>
                  </div>
                </div>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimationWrapper animation="fadeInUp">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 lg:p-12 text-white text-center">
              <h3 className="text-3xl font-bold mb-4">Join Our Growing Client Family</h3>
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