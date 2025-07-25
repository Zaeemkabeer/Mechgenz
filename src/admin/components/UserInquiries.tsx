import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Reply, Eye, Search, Filter, Send, X, CheckCircle, Clock, Download, FileText, Image as ImageIcon, Paperclip, Trash2, Check, Square } from 'lucide-react';

interface UploadedFile {
  original_name: string;
  saved_name: string;
  file_size: number;
  content_type: string;
}

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  submitted_at: string;
  status: string;
  uploaded_files?: UploadedFile[];
}

const UserInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [selectedInquiries, setSelectedInquiries] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      // FIXED: Use production API URL
      const response = await fetch('https://mechgenz-backend.onrender.com/api/submissions?limit=100');
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) return;

    setIsReplying(true);
    try {
      // FIXED: Use production API URL for send reply
      const emailResponse = await fetch('https://mechgenz-backend.onrender.com/api/send-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: selectedInquiry.email,
          to_name: selectedInquiry.name,
          reply_message: replyMessage,
          original_message: selectedInquiry.message
        })
      });

      if (emailResponse.ok) {
        // FIXED: Use production API URL for status update
        await fetch(`https://mechgenz-backend.onrender.com/api/submissions/${selectedInquiry._id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'replied' })
        });

        // Refresh inquiries
        await fetchInquiries();
        
        // Show success state
        setReplySuccess(true);
        
        // Update selected inquiry status
        if (selectedInquiry) {
          setSelectedInquiry({ ...selectedInquiry, status: 'replied' });
        }

        // Auto close modal after success
        setTimeout(() => {
          setShowReplyModal(false);
          setReplyMessage('');
          setReplySuccess(false);
        }, 2000);

      } else {
        const errorData = await emailResponse.json();
        alert(`Failed to send reply: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  const toggleSelectInquiry = (inquiryId: string) => {
    setSelectedInquiries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(inquiryId)) {
        newSet.delete(inquiryId);
      } else {
        newSet.add(inquiryId);
      }
      return newSet;
    });
  };

  const selectAllInquiries = () => {
    if (selectedInquiries.size === filteredInquiries.length) {
      setSelectedInquiries(new Set());
    } else {
      setSelectedInquiries(new Set(filteredInquiries.map(inquiry => inquiry._id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedInquiries.size === 0) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedInquiries).map(async (inquiryId) => {
        // FIXED: Use production API URL for delete
        const response = await fetch(`https://mechgenz-backend.onrender.com/api/submissions/${inquiryId}`, {
          method: 'DELETE'
        });
        return response.ok;
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        // Refresh inquiries list
        await fetchInquiries();
        
        // Clear selections
        setSelectedInquiries(new Set());
        
        // Clear selected inquiry if it was deleted
        if (selectedInquiry && selectedInquiries.has(selectedInquiry._id)) {
          setSelectedInquiry(null);
        }
        
        alert(`Successfully deleted ${successCount} inquir${successCount === 1 ? 'y' : 'ies'}`);
      } else {
        alert('Failed to delete inquiries. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting inquiries:', error);
      alert('Error deleting inquiries. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownloadFile = async (fileName: string, originalName: string) => {
    if (!selectedInquiry) return;
    
    try {
      // FIXED: Use production API URL for file download
      const response = await fetch(`https://mechgenz-backend.onrender.com/api/submissions/${selectedInquiry._id}/file/${fileName}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('image')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-3xl font-bold text-gray-900">User Inquiries</h1>
        <p className="text-gray-600 mt-2">Manage customer inquiries and send replies</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Inquiries ({filteredInquiries.length})
              </h2>
              
              {/* Selection Controls */}
              {filteredInquiries.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllInquiries}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    title={selectedInquiries.size === filteredInquiries.length ? 'Deselect All' : 'Select All'}
                  >
                    {selectedInquiries.size === filteredInquiries.length ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    <span>All</span>
                  </button>
                  
                  {selectedInquiries.size > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors duration-200 disabled:opacity-50"
                      title={`Delete ${selectedInquiries.size} selected`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>({selectedInquiries.size})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Selection Info */}
            {selectedInquiries.size > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                {selectedInquiries.size} of {filteredInquiries.length} selected
              </div>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className={`p-4 border-b border-gray-100 transition-colors duration-200 ${
                    selectedInquiry?._id === inquiry._id ? 'bg-orange-50 border-orange-200' : ''
                  } ${
                    selectedInquiries.has(inquiry._id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectInquiry(inquiry._id);
                      }}
                      className="mt-1 flex-shrink-0"
                    >
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors duration-200 ${
                        selectedInquiries.has(inquiry._id)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}>
                        {selectedInquiries.has(inquiry._id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    </button>
                    
                    {/* Inquiry Content */}
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {inquiry.name.charAt(0)}
                    </div>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inquiry.name}
                        </p>
                        <div className="flex items-center space-x-1">
                          {inquiry.uploaded_files && inquiry.uploaded_files.length > 0 && (
                            <Paperclip className="h-3 w-3 text-gray-400" />
                          )}
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                            inquiry.status === 'new' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {inquiry.status === 'new' ? (
                              <Clock className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            <span>{inquiry.status}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{inquiry.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(inquiry.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No inquiries found</p>
              </div>
            )}
          </div>
        </div>

        {/* Inquiry Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          {selectedInquiry ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                  <button
                    onClick={() => setShowReplyModal(true)}
                    disabled={selectedInquiry.status === 'replied'}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                      selectedInquiry.status === 'replied'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <Reply className="h-4 w-4" />
                    <span>{selectedInquiry.status === 'replied' ? 'Already Replied' : 'Send Reply'}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-6 space-y-6">
                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{selectedInquiry.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{selectedInquiry.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedInquiry.phone && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{selectedInquiry.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedInquiry.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedInquiry.message}
                    </p>
                  </div>
                </div>

                {/* Uploaded Files */}
                {selectedInquiry.uploaded_files && selectedInquiry.uploaded_files.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Attached Files</h3>
                    <div className="space-y-2">
                      {selectedInquiry.uploaded_files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="text-gray-500">
                              {getFileIcon(file.content_type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.original_name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.file_size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadFile(file.saved_name, file.original_name)}
                            className="text-orange-600 hover:text-orange-700 transition-colors duration-200"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedInquiry.status === 'new' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedInquiry.status === 'new' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>{selectedInquiry.status === 'new' ? 'New Inquiry' : 'Replied'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an inquiry to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Send Reply</h3>
                  <p className="text-orange-100 text-sm">Sending to: {selectedInquiry.name} ({selectedInquiry.email})</p>
                </div>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplySuccess(false);
                  }}
                  className="text-white hover:text-orange-200 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {replySuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Email Sent Successfully!</h4>
                <p className="text-gray-600">Your reply has been sent to {selectedInquiry.name}.</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Message from {selectedInquiry.name}:
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {selectedInquiry.message}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply: *
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Type your reply here..."
                  />
                </div>
              </div>
            )}
            
            {!replySuccess && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                  }}
                  className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={isReplying || !replyMessage.trim()}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReplying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Reply</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Inquiries</h3>
                  <p className="text-sm text-gray-600">
                    {selectedInquiries.size} inquir{selectedInquiries.size === 1 ? 'y' : 'ies'} selected
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the selected inquir{selectedInquiries.size === 1 ? 'y' : 'ies'}? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete {selectedInquiries.size === 1 ? 'Inquiry' : 'Inquiries'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInquiries;