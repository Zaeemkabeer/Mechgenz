import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TradingDivision from './components/TradingDivision';
import CorporatePhilosophy from './components/CorporatePhilosophy';
import CodeOfEthics from './components/CodeOfEthics';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <AboutSection />
      <ServicesSection />
      <TradingDivision />
      <CorporatePhilosophy />
      <CodeOfEthics />
      <Footer />
    </div>
  );
}

export default App;