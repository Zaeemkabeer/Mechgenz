// API Configuration - HARDCODED FOR PRODUCTION
const API_BASE_URL = 'https://mechgenz-backend.onrender.com';

export const API_ENDPOINTS = {
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact`,
  CONTACT_SUBMISSIONS: `${API_BASE_URL}/api/submissions`,
  CONTACT_STATS: `${API_BASE_URL}/api/stats`,
  HEALTH_CHECK: `${API_BASE_URL}/health`,
  // Add admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_PROFILE: `${API_BASE_URL}/api/admin/profile`,
  SEND_REPLY: `${API_BASE_URL}/api/send-reply`,
  WEBSITE_IMAGES: `${API_BASE_URL}/api/website-images`,
} as const;

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  submission_id?: string;
}

export interface ApiError {
  detail: string;
  message?: string;
}

// API utility functions
export const submitContactForm = async (formData: FormData): Promise<ContactResponse> => {
  console.log('Submitting to:', API_ENDPOINTS.CONTACT_SUBMIT); // Debug log
  
  const response = await fetch(API_ENDPOINTS.CONTACT_SUBMIT, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.message || 'Failed to submit form');
  }

  return result;
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    console.log('Health check URL:', API_ENDPOINTS.HEALTH_CHECK); // Debug log
    const response = await fetch(API_ENDPOINTS.HEALTH_CHECK);
    const result = await response.json();
    return response.ok && result.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};