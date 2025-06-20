// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact/submit`,
  CONTACT_SUBMISSIONS: `${API_BASE_URL}/api/contact/submissions`,
  CONTACT_STATS: `${API_BASE_URL}/api/contact/stats`,
  HEALTH_CHECK: `${API_BASE_URL}/health`,
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
export const submitContactForm = async (formData: ContactFormData): Promise<ContactResponse> => {
  const response = await fetch(API_ENDPOINTS.CONTACT_SUBMIT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.message || 'Failed to submit form');
  }

  return result;
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH_CHECK);
    const result = await response.json();
    return response.ok && result.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};