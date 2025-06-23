import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import UserInquiries from './components/UserInquiries';
import JobManagement from './components/JobManagement';
import GalleryManagement from './components/GalleryManagement';
import LatestWorks from './components/LatestWorks';
import FAQManagement from './components/FAQManagement';
import Settings from './components/Settings';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken === 'mechgenz-admin-authenticated') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (success: boolean) => {
    if (success) {
      localStorage.setItem('adminToken', 'mechgenz-admin-authenticated');
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AdminLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/user-inquiries" element={<UserInquiries />} />
          <Route path="/admin/job-management" element={<JobManagement />} />
          <Route path="/admin/gallery-management" element={<GalleryManagement />} />
          <Route path="/admin/latest-works" element={<LatestWorks />} />
          <Route path="/admin/faq-management" element={<FAQManagement />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
};

export default AdminApp;