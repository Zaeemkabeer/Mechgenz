import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building, 
  LayoutDashboard, 
  MessageSquare, 
  Briefcase, 
  Image, 
  FolderOpen, 
  HelpCircle, 
  Settings as SettingsIcon, 
  LogOut, 
  Globe,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: <Globe className="h-5 w-5" />, label: 'View Site', path: '/', external: true },
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <SettingsIcon className="h-5 w-5" />, label: 'Settings', path: '/admin/settings' },
    { icon: <Briefcase className="h-5 w-5" />, label: 'Job Management', path: '/admin/job-management' },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'User Inquiries', path: '/admin/user-inquiries' },
    { icon: <Image className="h-5 w-5" />, label: 'Gallery Management', path: '/admin/gallery-management' },
    { icon: <FolderOpen className="h-5 w-5" />, label: 'Latest Works', path: '/admin/latest-works' },
    { icon: <HelpCircle className="h-5 w-5" />, label: 'FAQ Management', path: '/admin/faq-management' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span 
                className="text-lg font-bold text-white tracking-wider"
                style={{ fontFamily: 'Unione Force, Arial Black, sans-serif' }}
              >
                MECHGENZ
              </span>
              <span 
                className="text-xs font-medium tracking-widest text-gray-300"
                style={{ fontFamily: 'Unione Force, Arial Black, sans-serif' }}
              >
                ADMIN
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.external ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome back, Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;