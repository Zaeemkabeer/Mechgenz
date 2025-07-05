import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TradingDivision from './components/TradingDivision';
import Portfolio from './components/Portfolio';
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
      <Portfolio />
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
        {/* Admin routes - handle all /admin/* paths */}
        <Route path="/admin/*" element={<AdminApp />} />
        {/* Main website routes */}
        <Route path="/*" element={<MainWebsite />} />
      </Routes>
    </Router>
  );
}

export default App;