import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/user-inquiries" element={<UserInquiries />} />
        <Route path="/job-management" element={<JobManagement />} />
        <Route path="/gallery-management" element={<GalleryManagement />} />
        <Route path="/latest-works" element={<LatestWorks />} />
        <Route path="/faq-management" element={<FAQManagement />} />
        <Route path="/settings" element={<Settings />} />
        {/* Catch all route for admin section */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;