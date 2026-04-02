// Wrapper around fetch that automatically adds Authorization header
const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
};

export default apiFetch;
