// Sends a page view event to the backend analytics endpoint
const trackPageView = (page) => {
  try {
    const token = localStorage.getItem('authToken');
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ page })
    }).catch(() => {}); // fire and forget, never block UI
  } catch {
    // ignore
  }
};

export default trackPageView;
