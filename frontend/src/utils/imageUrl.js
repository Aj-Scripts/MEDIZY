export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-doctor.png';
  
  // Remove base URL if it exists (for backward compatibility)
  const cleanPath = imagePath.replace(/^https?:\/\/[^\/]+/, '');
  
  // Return full URL for display
  const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  return `${baseUrl}${cleanPath}`;
};