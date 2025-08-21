// Configuration file for API URLs
// Update this when deploying to production

const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000' 
  : process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com';

export const API_AUTH_URL = `${API_BASE_URL}/api`;
