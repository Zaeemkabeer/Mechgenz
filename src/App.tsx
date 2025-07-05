import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TradingDivision from './components/TradingDivision';
import CorporatePhilosophy from './components/CorporatePhilosophy';
import CodeOfEthics from './components/CodeOfEthics';
import Portfolio from './components/Portfolio';
import Footer from './components/Footer';
import OurProjectsPage from './pages/OurProjectsPage';
import OurClientsPage from './pages/OurClientsPage';
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
      <Portfolio />
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
        
        {/* Our Projects Page */}
        <Route path="/our-projects" element={<OurProjectsPage />} />
        
        {/* Our Clients Page */}
        <Route path="/our-clients" element={<OurClientsPage />} />
        
        {/* Main website routes */}
        <Route path="/*" element={<MainWebsite />} />
      </Routes>
    </Router>
  );
}

export default App;