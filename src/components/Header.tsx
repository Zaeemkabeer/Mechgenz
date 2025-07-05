import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWebsiteImages } from '../hooks/useWebsiteImages';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const { getImageUrl, isLoading } = useWebsiteImages();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const imageUrl = getImageUrl('logo', '/mechgenz-logo.jpg');
      
      const img = new Image();
      img.onload = () => {
        setLogoUrl(imageUrl);
        setLogoLoaded(true);
      };
      img.onerror = () => {
        setLogoUrl('/mechgenz-logo.jpg');
        setLogoLoaded(true);
      };
      img.src = imageUrl;
    }
  }, [isLoading, getImageUrl]);

  const navItems = [
    { label: 'HOME', href: '/' },
    { 
      label: 'ABOUT US', 
      href: '#about-us',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Our Projects', href: '/our-projects' },
        { label: 'Our Clients', href: '/our-clients' }
      ]
    },
    { label: 'BUSINESS', href: '#business' },
    { label: 'TRADING', href: '#trading' },
    { label: 'PHILOSOPHY', href: '#philosophy' },
    { label: 'POLICY', href: '#policy' },
    { label: 'CONTACT US', href: '#contact-us' }
  ];

  const handleNavClick = (href: string) => {
    if (href === '/' || href.startsWith('/')) {
      // For home and page routes, don't prevent default
    } else if (href === '#') {
      // Scroll to top for HOME
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
    setShowAboutDropdown(false);
  };

  const isOnMainPage = location.pathname === '/';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg shadow-sm overflow-hidden bg-gray-200">
              {logoLoaded ? (
                <img
                  src={logoUrl}
                  alt="MECHGENZ Logo"
                  className="h-full w-full object-cover transition-opacity duration-300"
                  style={{ opacity: logoUrl ? 1 : 0 }}
                />
              ) : (
                <div className="h-full w-full bg-gray-300 animate-pulse"></div>
              )}
            </div>
            <div className="flex flex-col">
              <span 
                className={`text-2xl font-bold font-mechgenz tracking-wider transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}
              >
                MECHGENZ
              </span>
              <span 
                className={`text-xs font-medium tracking-widest transition-colors duration-300 ${
                  isScrolled ? 'text-gray-600' : 'text-white/80'
                }`}
              >
                TRADING CONTRACTING AND SERVICES
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setShowAboutDropdown(true)}
                    onMouseLeave={() => setShowAboutDropdown(false)}
                  >
                    {isOnMainPage ? (
                      <a
                        href={item.href}
                        className={`text-sm font-medium transition-colors duration-300 hover:text-orange-500 flex items-center space-x-1 ${
                          isScrolled ? 'text-gray-700' : 'text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAboutDropdown ? 'rotate-180' : ''}`} />
                      </a>
                    ) : (
                      <button
                        className={`text-sm font-medium transition-colors duration-300 hover:text-orange-500 flex items-center space-x-1 ${
                          isScrolled ? 'text-gray-700' : 'text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAboutDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                    
                    {/* Dropdown Menu */}
                    {showAboutDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        {item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
                          <Link
                            key={dropdownIndex}
                            to={dropdownItem.href}
                            onClick={() => handleNavClick(dropdownItem.href)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {item.href.startsWith('/') ? (
                      <Link
                        to={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`text-sm font-medium transition-colors duration-300 hover:text-orange-500 ${
                          isScrolled ? 'text-gray-700' : 'text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        href={isOnMainPage ? item.href : '/'}
                        onClick={(e) => {
                          if (!isOnMainPage) {
                            e.preventDefault();
                            window.location.href = '/';
                          } else if (item.href === '#') {
                            e.preventDefault();
                            handleNavClick(item.href);
                          }
                        }}
                        className={`text-sm font-medium transition-colors duration-300 hover:text-orange-500 ${
                          isScrolled ? 'text-gray-700' : 'text-white'
                        }`}
                      >
                        {item.label}
                      </a>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-md transition-colors duration-300 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md rounded-lg mt-2 mb-4 p-4 shadow-lg">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item, index) => (
                <div key={index}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setShowAboutDropdown(!showAboutDropdown)}
                        className="w-full text-left text-gray-700 font-medium py-2 px-3 rounded-md hover:bg-orange-500 hover:text-white transition-colors duration-200 flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAboutDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showAboutDropdown && (
                        <div className="ml-4 mt-2 space-y-2">
                          {item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
                            <Link
                              key={dropdownIndex}
                              to={dropdownItem.href}
                              onClick={() => handleNavClick(dropdownItem.href)}
                              className="block text-gray-600 py-2 px-3 rounded-md hover:bg-orange-500 hover:text-white transition-colors duration-200"
                            >
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {item.href.startsWith('/') ? (
                        <Link
                          to={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className="text-gray-700 font-medium py-2 px-3 rounded-md hover:bg-orange-500 hover:text-white transition-colors duration-200"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={isOnMainPage ? item.href : '/'}
                          onClick={(e) => {
                            if (!isOnMainPage) {
                              e.preventDefault();
                              window.location.href = '/';
                            } else if (item.href === '#') {
                              e.preventDefault();
                            }
                            handleNavClick(item.href);
                          }}
                          className="text-gray-700 font-medium py-2 px-3 rounded-md hover:bg-orange-500 hover:text-white transition-colors duration-200"
                        >
                          {item.label}
                        </a>
                      )}
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;