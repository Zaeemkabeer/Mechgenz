import React from 'react';
import { Facebook, Twitter, Instagram, Globe, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    'HOME', 'ABOUT US', 'BUSINESS', 'TRADING', 
    'PHILOSOPHY', 'POLICY', 'CONTACT US'
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: '#' },
    { icon: <Globe className="h-5 w-5" />, href: '#' },
    { icon: <Twitter className="h-5 w-5" />, href: '#' },
    { icon: <Instagram className="h-5 w-5" />, href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white" id="contact-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src="/mechgenz-logo.jpg"
                alt="MECHGENZ Logo"
                className="h-16 w-16 rounded-lg shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-mechgenz tracking-wider text-white">
                  MECHGENZ
                </span>
                <span className="text-xs font-medium tracking-widest text-white/80">
                  TRADING CONTRACTING AND SERVICES
                </span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              MECHGENZ, based in Qatar and established itself as a visionary company with a diverse project focus, quality work and a team of people committed to integrity and professionalism. The company aims to provide the growing demands of the Qatari market, known as the fastest and stable economy in the GCC region.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="bg-gray-800 hover:bg-orange-500 p-3 rounded-lg transition-colors duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-orange-500">GET IN TOUCH</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                <div className="text-gray-300">
                  <p>31st Floor, Office #312</p>
                  <p>Marina Twin Towers, Tower B</p>
                  <p>P.O. Box 12784, Lusail, Qatar</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <div className="text-gray-300">
                  <p>+974 44117639</p>
                  <p>+974 44374547</p>
                  <p>+974 33032114</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <div className="text-gray-300">
                  <p>info@mechgenz.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-orange-500">QUICK MENU</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-gray-300 hover:text-orange-500 transition-colors duration-300 py-1 text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Copyright © 2024 MECHGENZ W.L.L. All Rights Reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-300">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;