import React from 'react';
import { Users, Shield, Target, Globe, Award, Handshake } from 'lucide-react';
import AnimationWrapper from './AnimationWrapper';
import { useWebsiteImages } from '../hooks/useWebsiteImages';

const AboutSection = () => {
  const { getImageUrl } = useWebsiteImages();

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

  const achievements = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Global Reach',
      description: 'Serving diverse sectors across the GCC region with international standards'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality Excellence',
      description: 'Commitment to delivering projects that meet or exceed industry standards'
    },
    {
      icon: <Handshake className="h-8 w-8" />,
      title: 'Trusted Partnerships',
      description: 'Building long-term relationships through exceptional service and dependable performance'
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="about-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image Side */}
          <AnimationWrapper animation="slideInLeft">
            <div className="relative">
              <img
                src={getImageUrl('about_main', 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')}
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
          </AnimationWrapper>

          {/* Content Side */}
          <AnimationWrapper animation="slideInRight">
            <div className="space-y-8">
              <div>
                <span className="text-orange-500 font-semibold text-lg">WHO WE ARE</span>
                <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6">
                  Excellence in Trading, Contracting & Industrial Services
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Established with a vision to deliver excellence, MECHGENZ Trading Contracting & Services is a dynamic and diversified company specializing in trading, contracting, and comprehensive industrial services. Headquartered in Doha, we cater to a wide range of sectors including oil & gas, energy, construction, manufacturing, and infrastructure.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg mt-4">
                  With a strong commitment to quality, safety, and client satisfaction, we provide tailored solutions that meet the unique needs of each project. Our trading division offers a reliable supply of industrial materials, equipment, and consumables from reputable global manufacturers.
                </p>
                <p className="text-gray-600 leading-relaxed text-lg mt-4">
                  Our mission is to be a trusted partner that drives growth and success for our clients through exceptional service and dependable performance.
                </p>
              </div>

              {/* Focus Areas */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Our Key Focus Areas</h3>
                <div className="space-y-4">
                  {focusAreas.map((area, index) => (
                    <AnimationWrapper key={index} delay={index * 100}>
                      <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="text-orange-500 flex-shrink-0">
                          {area.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">{area.title}</h4>
                          <p className="text-gray-600 text-sm">{area.description}</p>
                        </div>
                      </div>
                    </AnimationWrapper>
                  ))}
                </div>
              </div>
            </div>
          </AnimationWrapper>
        </div>

        {/* Vision & Mission Section */}
        <AnimationWrapper animation="scaleIn">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Vision & Mission</h2>
              <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <AnimationWrapper animation="slideInLeft" delay={200}>
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                    <Target className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To be the leading provider of comprehensive industrial solutions across the GCC region, recognized for our commitment to excellence, innovation, and sustainable growth.
                  </p>
                </div>
              </AnimationWrapper>
              
              <AnimationWrapper animation="slideInRight" delay={400}>
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                    <Globe className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    At MECHGENZ Trading Contracting & Services, we value long-term partnerships, continuous improvement, and innovation. Our mission is to be a trusted partner that drives growth and success for our clients through exceptional service and dependable performance.
                  </p>
                </div>
              </AnimationWrapper>
            </div>
          </div>
        </AnimationWrapper>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <AnimationWrapper key={index} animation="bounceIn" delay={index * 150}>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-orange-500 mb-4 flex justify-center">
                  {achievement.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{achievement.title}</h4>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            </AnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;