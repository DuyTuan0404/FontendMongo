// Cấu hình backend URL
const getBackendUrl = () => {
  // Trong môi trường development, sử dụng localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3098';
  }

  // Trong môi trường production, sử dụng domain thực tế
  // Hoặc có thể lấy từ environment variable
  return 'http://192.168.1.138:3098' || 'http://localhost:3098';
};

export const BACKEND_URL = getBackendUrl();
export const API_BASE_URL = `${BACKEND_URL}/v1/api`;
export const UPLOADS_URL = `${BACKEND_URL}/uploads`;

export default {
  BACKEND_URL,
  API_BASE_URL,
  UPLOADS_URL
};
