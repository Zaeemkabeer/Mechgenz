import React, { useState, useEffect } from 'react';
import { Image, Upload, Edit, RotateCcw, Save, X, Eye, Filter, Search, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface WebsiteImage {
  id: string;
  name: string;
  description: string;
  current_url: string;
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

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/website-images');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || {});
      } else {
        console.error('Failed to fetch images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/website-images/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getImageUrl = (imageUrl: string): string => {
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative URL starting with /images/, make it absolute
    if (imageUrl.startsWith('/images/')) {
      return `http://localhost:8000${imageUrl}`;
    }
    
    // If it's just a filename or relative path, construct the full URL
    if (imageUrl.startsWith('/')) {
      return `http://localhost:8000${imageUrl}`;
    }
    
    // Default case - assume it's a filename in the images directory
    return `http://localhost:8000/images/${imageUrl}`;
  };

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoad = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageUpload = async (imageId: string, file: File) => {
    setUploadStatus(prev => ({
      ...prev,
      [imageId]: { uploading: true, success: false, error: null }
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:8000/api/website-images/${imageId}/upload`, {
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
    try {
      const response = await fetch(`http://localhost:8000/api/website-images/${imageId}`, {
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
    if (!confirm('Are you sure you want to reset this image to default?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/website-images/${imageId}/reset`, {
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
      } else {
        const result = await response.json();
        alert(`Failed to reset image: ${result.detail}`);
      }
    } catch (error) {
      console.error('Error resetting image:', error);
      alert('Error resetting image');
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
      portfolio: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderImagePreview = (imageId: string, image: WebsiteImage) => {
    const imageUrl = getImageUrl(image.current_url);
    const hasError = imageErrors[imageId];

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
        <p className="text-gray-600 mt-2">Manage all website images from one central location</p>
      </div>

      {/* Filters and Search */}
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
          <div key={imageId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
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
                    
                    {/* Category Badge */}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image.category)}`}>
                      {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                    </span>
                  </div>

                  {/* Locations */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Used in:</h4>
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

                  {/* Error Message */}
                  {uploadStatus[imageId]?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">{uploadStatus[imageId].error}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
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
                        disabled={uploadStatus[imageId]?.uploading}
                      />
                      <div className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm">
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </div>
                    </label>

                    <button
                      onClick={() => startEditing(imageId)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleImageReset(imageId)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
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