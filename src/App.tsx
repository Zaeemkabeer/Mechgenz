import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TradingDivision from './components/TradingDivision';
import CorporatePhilosophy from './components/CorporatePhilosophy';
import CodeOfEthics from './components/CodeOfEthics';
import Footer from './components/Footer';
import AdminApp from './admin/AdminApp';

function MainWebsite() {
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<MainWebsite />} />
      </Routes>
    </Router>
  );
}

export default App;