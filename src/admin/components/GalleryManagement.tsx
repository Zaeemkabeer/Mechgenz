import React, { useState, useEffect } from 'react';
import { Image, Upload, Edit, RotateCcw, Save, X, Eye, Filter, Search, AlertCircle, CheckCircle, Loader, MapPin, Tag, Calendar, RefreshCw, Trash2, Trash } from 'lucide-react';

interface WebsiteImage {
  id: string;
  name: string;
  description: string;
  current_url: string;
  default_url: string;
  locations: string[];
  recommended_size: string;
  category: string;
  updated_at?: string;
}

interface ImageUploadStatus {
  [key: string]: {
    uploading: boolean;
    success: boolean;
    error: string | null;
  };
}

interface DeleteModalState {
  isOpen: boolean;
  imageId: string | null;
  imageName: string;
  isDeleting: boolean;
}

const GalleryManagement = () => {
  const [images, setImages] = useState<{ [key: string]: WebsiteImage }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<ImageUploadStatus>({});
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    imageId: null,
    imageName: '',
    isDeleting: false
  });

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, []);

  const checkServerConnection = async (): Promise<boolean> => {
    try {
      // FIXED: Use production backend URL
      const response = await fetch('https://mechgenz-backend.onrender.com/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const fetchImages = async () => {
    try {
      console.log('🔄 Fetching images from API...');
      
      // Check server connection first
      const isConnected = await checkServerConnection();
      setServerConnected(isConnected);
      
      if (!isConnected) {
        console.log('❌ Server not available');
        setIsLoading(false);
        return;
      }
      
      // FIXED: Use production backend URL
      const response = await fetch('https://mechgenz-backend.onrender.com/api/website-images');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched images data:', data);
        setImages(data.images || {});
      } else {
        console.error('❌ Failed to fetch images:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching images:', error);
      setServerConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const isConnected = await checkServerConnection();
      if (!isConnected) return;
      
      // FIXED: Use production backend URL
      const response = await fetch('https://mechgenz-backend.onrender.com/api/website-images/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        console.log('📂 Fetched categories:', data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const refreshImages = async () => {
    setRefreshing(true);
    await fetchImages();
    await fetchCategories();
    setRefreshing(false);
  };

  const clearImageCache = () => {
    // Clear localStorage cache
    localStorage.removeItem('mechgenz_website_images');
    localStorage.removeItem('mechgenz_images_cache_expiry');
    
    // Trigger a page reload to refresh the frontend cache
    if (window.confirm('This will clear the image cache and reload the page. Continue?')) {
      window.location.reload();
    }
  };

  const getImageUrl = (imageUrl: string): string => {
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // FIXED: Use production backend URL instead of localhost
    if (imageUrl.startsWith('/images/')) {
      return `https://mechgenz-backend.onrender.com${imageUrl}`;
    }
    
    if (imageUrl.startsWith('/')) {
      return `https://mechgenz-backend.onrender.com${imageUrl}`;
    }
    
    // Default case - assume it's a filename in the images directory
    return `https://mechgenz-backend.onrender.com/images/${imageUrl}`;
  };

  const handleImageError = (imageId: string) => {
    console.log(`❌ Image failed to load for ${imageId}`);
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoad = (imageId: string) => {
    console.log(`✅ Image loaded successfully for ${imageId}`);
    setImageErrors(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageUpload = async (imageId: string, file: File) => {
    if (!serverConnected) {
      alert('Server is not connected. Please ensure the backend is running.');
      return;
    }

    setUploadStatus(prev => ({
      ...prev,
      [imageId]: { uploading: true, success: false, error: null }
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      // FIXED: Use production backend URL
      const response = await fetch(`https://mechgenz-backend.onrender.com/api/website-images/${imageId}/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus(prev => ({
          ...prev,
          [imageId]: { uploading: false, success: true, error: null }
        }));

        // Update the image URL in local state
        setImages(prev => ({
          ...prev,
          [imageId]: {
            ...prev[imageId],
            current_url: result.new_url,
            updated_at: new Date().toISOString()
          }
        }));

        // Clear any previous error for this image
        setImageErrors(prev => ({ ...prev, [imageId]: false }));

        // Clear frontend cache to ensure new image is loaded
        localStorage.removeItem('mechgenz_website_images');
        localStorage.removeItem('mechgenz_images_cache_expiry');

        // Clear success status after 3 seconds
        setTimeout(() => {
          setUploadStatus(prev => ({
            ...prev,
            [imageId]: { uploading: false, success: false, error: null }
          }));
        }, 3000);
      } else {
        setUploadStatus(prev => ({
          ...prev,
          [imageId]: { uploading: false, success: false, error: result.detail || 'Upload failed' }
        }));
      }
    } catch (error) {
      setUploadStatus(prev => ({
        ...prev,
        [imageId]: { uploading: false, success: false, error: 'Network error' }
      }));
    }
  };

  const handleImageEdit = async (imageId: string) => {
    if (!serverConnected) {
      alert('Server is not connected. Please ensure the backend is running.');
      return;
    }

    try {
      // FIXED: Use production backend URL
      const response = await fetch(`https://mechgenz-backend.onrender.com/api/website-images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description
        })
      });

      if (response.ok) {
        // Update local state
        setImages(prev => ({
          ...prev,
          [imageId]: {
            ...prev[imageId],
            name: editForm.name,
            description: editForm.description,
            updated_at: new Date().toISOString()
          }
        }));

        setEditingImage(null);
        setEditForm({ name: '', description: '' });
      } else {
        const result = await response.json();
        alert(`Failed to update image: ${result.detail}`);
      }
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error updating image');
    }
  };

  const handleImageReset = async (imageId: string) => {
    if (!serverConnected) {
      alert('Server is not connected. Please ensure the backend is running.');
      return;
    }

    if (!confirm('Are you sure you want to reset this image to default?')) {
      return;
    }

    try {
      // FIXED: Use production backend URL
      const response = await fetch(`https://mechgenz-backend.onrender.com/api/website-images/${imageId}/reset`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state
        setImages(prev => ({
          ...prev,
          [imageId]: {
            ...prev[imageId],
            current_url: result.default_url,
            updated_at: new Date().toISOString()
          }
        }));

        // Clear any error for this image
        setImageErrors(prev => ({ ...prev, [imageId]: false }));

        // Clear frontend cache
        localStorage.removeItem('mechgenz_website_images');
        localStorage.removeItem('mechgenz_images_cache_expiry');
      } else {
        const result = await response.json();
        alert(`Failed to reset image: ${result.detail}`);
      }
    } catch (error) {
      console.error('Error resetting image:', error);
      alert('Error resetting image');
    }
  };

  const openDeleteModal = (imageId: string, imageName: string) => {
    setDeleteModal({
      isOpen: true,
      imageId,
      imageName,
      isDeleting: false
    });
  };

  const closeDeleteModal = () => {
    if (deleteModal.isDeleting) return; // Prevent closing while deleting
    
    setDeleteModal({
      isOpen: false,
      imageId: null,
      imageName: '',
      isDeleting: false
    });
  };

  const handleDeleteImage = async (deleteType: 'image_only' | 'complete') => {
    if (!deleteModal.imageId || !serverConnected) {
      alert('Server is not connected. Please ensure the backend is running.');
      return;
    }

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      // FIXED: Use production backend URL
      const response = await fetch(`https://mechgenz-backend.onrender.com/api/website-images/${deleteModal.imageId}?delete_type=${deleteType}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        if (deleteType === 'image_only') {
          // Update local state with default URL
          setImages(prev => ({
            ...prev,
            [deleteModal.imageId!]: {
              ...prev[deleteModal.imageId!],
              current_url: result.default_url,
              updated_at: new Date().toISOString()
            }
          }));
          
          // Clear any error for this image
          setImageErrors(prev => ({ ...prev, [deleteModal.imageId!]: false }));
          
          alert('Custom image deleted successfully. Image has been reset to default.');
        } else {
          // Remove from local state completely
          setImages(prev => {
            const updated = { ...prev };
            delete updated[deleteModal.imageId!];
            return updated;
          });
          
          alert('Image configuration deleted completely. This image will no longer appear on the website.');
        }
        
        // Clear frontend cache
        localStorage.removeItem('mechgenz_website_images');
        localStorage.removeItem('mechgenz_images_cache_expiry');
        
        closeDeleteModal();
      } else {
        alert(`Failed to delete image: ${result.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    } finally {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const startEditing = (imageId: string) => {
    const image = images[imageId];
    setEditingImage(imageId);
    setEditForm({
      name: image.name,
      description: image.description
    });
  };

  const cancelEditing = () => {
    setEditingImage(null);
    setEditForm({ name: '', description: '' });
  };

  const filteredImages = Object.entries(images).filter(([id, image]) => {
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.locations.some(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      branding: 'bg-purple-100 text-purple-800',
      hero: 'bg-blue-100 text-blue-800',
      about: 'bg-green-100 text-green-800',
      portfolio: 'bg-orange-100 text-orange-800',
      trading: 'bg-red-100 text-red-800',
      services: 'bg-indigo-100 text-indigo-800',
      contact: 'bg-pink-100 text-pink-800',
      team: 'bg-yellow-100 text-yellow-800',
      testimonials: 'bg-teal-100 text-teal-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderImagePreview = (imageId: string, image: WebsiteImage) => {
    const imageUrl = getImageUrl(image.current_url);
    const hasError = imageErrors[imageId];

    console.log(`🖼️ Rendering image ${imageId}:`, { imageUrl, hasError, current_url: image.current_url });

    if (hasError) {
      return (
        <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-500">
          <Image className="h-12 w-12 mb-2" />
          <span className="text-sm text-center px-2">Failed to load image</span>
          <button
            onClick={() => {
              setImageErrors(prev => ({ ...prev, [imageId]: false }));
              // Force reload by updating the image src
              const img = document.querySelector(`img[data-image-id="${imageId}"]`) as HTMLImageElement;
              if (img) {
                img.src = imageUrl + '?t=' + Date.now();
              }
            }}
            className="text-xs text-blue-500 hover:text-blue-700 mt-1"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <img
        data-image-id={imageId}
        src={imageUrl}
        alt={image.name}
        className="w-full h-full object-cover"
        onError={() => handleImageError(imageId)}
        onLoad={() => handleImageLoad(imageId)}
        loading="lazy"
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-2">Manage all website images from one central location</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={clearImageCache}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Cache</span>
          </button>
          <button
            onClick={refreshImages}
            disabled={refreshing || !serverConnected}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Server Status */}
      <div className={`p-4 rounded-lg border ${
        serverConnected 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center space-x-2">
          {serverConnected ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">
            {serverConnected ? 'Backend Server Connected' : 'Backend Server Disconnected'}
          </span>
        </div>
        {!serverConnected && (
          <p className="mt-2 text-sm">
            Please ensure the backend server is running on https://mechgenz-backend.onrender.com to manage images.
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Images</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(images).length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custom Images</p>
              <p className="text-3xl font-bold text-gray-900">
                {Object.values(images).filter(img => img.current_url.startsWith('/images/')).length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Upload className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recently Updated</p>
              <p className="text-3xl font-bold text-gray-900">
                {Object.values(images).filter(img => {
                  if (!img.updated_at) return false;
                  const updateDate = new Date(img.updated_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return updateDate > weekAgo;
                }).length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {Object.keys(images).length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">No Images Found</h3>
              <p className="text-red-700 mt-1">
                Unable to load website images. This could be due to:
              </p>
              <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                <li>Backend server is not running</li>
                <li>Database connection issues</li>
                <li>Images not yet uploaded</li>
              </ul>
              <div className="mt-4 space-x-3">
                <button
                  onClick={refreshImages}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      {Object.keys(images).length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search images by name, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map(([imageId, image]) => (
              <div key={imageId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Image Preview */}
                <div className="relative aspect-video bg-gray-100">
                  {renderImagePreview(imageId, image)}
                  
                  {/* Upload Status Overlay */}
                  {uploadStatus[imageId]?.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Uploading...</p>
                      </div>
                    </div>
                  )}

                  {uploadStatus[imageId]?.success && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}

                  {uploadStatus[imageId]?.error && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}

                  {/* Preview Button */}
                  <button
                    onClick={() => setPreviewImage(getImageUrl(image.current_url))}
                    className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {/* Category Badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image.category)}`}>
                      {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-6">
                  {editingImage === imageId ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Image name"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        placeholder="Image description"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleImageEdit(imageId)}
                          disabled={!serverConnected}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{image.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{image.description}</p>
                      </div>

                      {/* Locations */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Used in:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {image.locations.map((location, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Size */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Recommended Size:</h4>
                        <p className="text-sm text-gray-600">{image.recommended_size}</p>
                      </div>

                      {/* Current URL Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Image Source:</h4>
                        <p className="text-sm text-gray-600 truncate" title={image.current_url}>
                          {image.current_url.startsWith('/images/') ? 'Custom Upload' : 'External URL'}
                        </p>
                      </div>

                      {/* Last Updated */}
                      {image.updated_at && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Last Updated:</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(image.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadStatus[imageId]?.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-800 text-sm">{uploadStatus[imageId].error}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(imageId, file);
                              }
                            }}
                            className="hidden"
                            disabled={uploadStatus[imageId]?.uploading || !serverConnected}
                          />
                          <div className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm ${
                            serverConnected 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}>
                            <Upload className="h-4 w-4" />
                            <span>Upload</span>
                          </div>
                        </label>

                        <button
                          onClick={() => startEditing(imageId)}
                          disabled={!serverConnected}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm ${
                            serverConnected 
                              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleImageReset(imageId)}
                          disabled={!serverConnected}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm ${
                            serverConnected 
                              ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Reset</span>
                        </button>

                        <button
                          onClick={() => openDeleteModal(imageId, image.name)}
                          disabled={!serverConnected}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm ${
                            serverConnected 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Trash className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && Object.keys(images).length > 0 && (
            <div className="text-center py-12">
              <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Image</h3>
                    <p className="text-sm text-gray-600">{deleteModal.imageName}</p>
                  </div>
                </div>
                {!deleteModal.isDeleting && (
                  <button
                    onClick={closeDeleteModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Choose how you want to delete this image:
              </p>
              
              <div className="space-y-4">
                {/* Option 1: Delete Image Only */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors duration-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                      <RotateCcw className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Delete Custom Image Only</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Removes the custom uploaded image and resets to the default image. The image slot remains available for future uploads.
                      </p>
                      <button
                        onClick={() => handleDeleteImage('image_only')}
                        disabled={deleteModal.isDeleting}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {deleteModal.isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4" />
                            <span>Reset to Default</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Option 2: Delete Everything */}
                <div className="border border-red-200 rounded-lg p-4 hover:border-red-300 transition-colors duration-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <Trash className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Delete Completely</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        <strong className="text-red-600">Warning:</strong> Permanently removes the entire image configuration. This image will no longer appear anywhere on the website and cannot be recovered.
                      </p>
                      <button
                        onClick={() => handleDeleteImage('complete')}
                        disabled={deleteModal.isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {deleteModal.isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash className="h-4 w-4" />
                            <span>Delete Permanently</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {!deleteModal.isDeleting && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                  onClick={closeDeleteModal}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={() => {
                alert('Failed to load preview image');
                setPreviewImage(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;