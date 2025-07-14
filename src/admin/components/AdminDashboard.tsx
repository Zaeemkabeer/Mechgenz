import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Mail, TrendingUp, Calendar, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    repliedInquiries: 0,
    totalProjects: 0
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // FIXED: Use correct backend endpoint /api/stats (not /admin/dashboard)
      const statsResponse = await fetch('https://mechgenz-backend.onrender.com/api/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalInquiries: statsData.stats.total_submissions || 0,
          newInquiries: statsData.stats.status_breakdown?.find(s => s._id === 'new')?.count || 0,
          repliedInquiries: statsData.stats.status_breakdown?.find(s => s._id === 'replied')?.count || 0,
          totalProjects: 150 // Static for now
        });
      }

      // This endpoint is correct
      const inquiriesResponse = await fetch('https://mechgenz-backend.onrender.com/api/submissions?limit=5');
      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json();
        setRecentInquiries(inquiriesData.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: <MessageSquare className="h-8 w-8" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'New Inquiries',
      value: stats.newInquiries,
      icon: <Mail className="h-8 w-8" />,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Replied',
      value: stats.repliedInquiries,
      icon: <Users className="h-8 w-8" />,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to MECHGENZ Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Inquiries</h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inquiry: any, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {inquiry.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {inquiry.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {inquiry.email || 'No email'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(inquiry.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inquiry.status === 'new' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {inquiry.status || 'new'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No inquiries yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <button className="w-full text-left p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">View All Inquiries</p>
                  <p className="text-sm text-gray-600">Manage customer inquiries</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Job Management</p>
                  <p className="text-sm text-gray-600">Manage job postings</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Gallery Management</p>
                  <p className="text-sm text-gray-600">Update project gallery</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;