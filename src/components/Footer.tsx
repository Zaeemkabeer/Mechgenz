import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Globe, Phone, Mail, MapPin, Send, User, MessageSquare } from 'lucide-react';
import { submitContactForm, type ContactFormData } from '../config/api';

const Footer = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });
    
    try {
      const result = await submitContactForm(formData);
      
      setSubmitStatus({
        type: 'success',
        message: result.message || 'Thank you for your inquiry! We will get back to you soon.'
      });
      
      // Reset form on success
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Network error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    'HOME', 'ABOUT US', 'BUSINESS', 'TRADING', 
    'PHILOSOPHY', 'POLICY', 'CONTACT US'
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: '#' },
    { icon: <Globe className="h-5 w-5" />, href: 'https://www.mechgenz.com' },
    { icon: <Twitter className="h-5 w-5" />, href: '#' },
    { icon: <Instagram className="h-5 w-5" />, href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white" id="contact-us">
      {/* Contact Form Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Get In Touch</h2>
            <p className="text-orange-100 text-lg max-w-2xl mx-auto">
              Ready to start your next project? Contact us today for a consultation and let's bring your vision to life.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Office Address</h4>
                      <p className="text-orange-100 leading-relaxed">
                        31st Floor, Office #312<br />
                        Marina Twin Towers, Tower B<br />
                        P.O. Box 12784, Lusail, Qatar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Phone Numbers</h4>
                      <div className="text-orange-100 space-y-1">
                        <p>+974 44117639</p>
                        <p>+974 44374547</p>
                        <p>+974 30401080</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Email Addresses</h4>
                      <div className="text-orange-100 space-y-1">
                        <p>info@mechgenz.com</p>
                        <p>mishal.basheer@mechgenz.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Managing Director</h4>
                      <p className="text-orange-100">Mishal Basheer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
              
              {/* Status Messages */}
              {submitStatus.type && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-100' 
                    : 'bg-red-500/20 border border-red-500/30 text-red-100'
                }`}>
                  <p className="text-sm">{submitStatus.message}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="name" className="block text-sm font-medium text-orange-100 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-200" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        minLength={2}
                        maxLength={100}
                        className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="phone" className="block text-sm font-medium text-orange-100 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-200" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        minLength={8}
                        maxLength={20}
                        className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                        placeholder="+974 XXXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="email" className="block text-sm font-medium text-orange-100 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-200" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="message" className="block text-sm font-medium text-orange-100 mb-2">
                    Message *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-4 h-5 w-5 text-orange-200" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Tell us about your project requirements..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-orange-600 py-3 px-6 rounded-lg font-semibold hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Information */}
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
                  target={social.href.startsWith('http') ? '_blank' : '_self'}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : ''}
                  className="bg-gray-800 hover:bg-orange-500 p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-orange-500">QUICK MENU</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-gray-300 hover:text-orange-500 transition-colors duration-300 py-2 text-sm hover:translate-x-1 transform transition-transform"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Business Hours & Additional Info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-orange-500">BUSINESS HOURS</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Sunday - Thursday:</span>
                <span>8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Friday:</span>
                <span>2:00 PM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>Closed</span>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-orange-500 mb-4">Website</h4>
              <a 
                href="https://www.mechgenz.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-500 transition-colors duration-300"
              >
                www.mechgenz.com
              </a>
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