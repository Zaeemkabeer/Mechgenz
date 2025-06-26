import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminProfile {
  name: string;
  email: string;
}

const Settings = () => {
  const [profile, setProfile] = useState<AdminProfile>({ name: '', email: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.admin);
        setFormData(prev => ({
          ...prev,
          name: data.admin.name,
          email: data.admin.email
        }));
      } else {
        setMessage({ type: 'error', text: 'Failed to load admin profile' });
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setMessage({ type: 'error', text: 'Error loading profile data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return false;
    }
    
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }
    
    if (isChangingPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required' });
        return false;
      }
      
      if (!formData.newPassword) {
        setMessage({ type: 'error', text: 'New password is required' });
        return false;
      }
      
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
        return false;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim()
      };
      
      if (isChangingPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }
      
      const response = await fetch('http://localhost:8000/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setProfile(result.admin);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setIsChangingPassword(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.detail || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
    setMessage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your admin account settings</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <SettingsIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Profile</h2>
              <p className="text-gray-600">Update your account information and password</p>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Password Settings
                </h3>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                >
                  {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
                </button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>At least 6 characters long</li>
                      <li>Must match the confirmation password</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium transition-colors duration-200"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;