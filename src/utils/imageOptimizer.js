/**
 * Cloudinary & General Image URL Optimizer
 * Automatically adds f_auto, q_auto, and responsive width transformations.
 */
export const optimizeImage = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url;

  // Cloudinary image optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Avoid double transformation if already optimized
    if (url.includes('f_auto') || url.includes('q_auto')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }

  // Unsplash image optimization
  if (url.includes('images.unsplash.com')) {
    const hasParams = url.includes('?');
    return `${url}${hasParams ? '&' : '?'}auto=format&fit=crop&q=75&w=${width}`;
  }

  return url;
};
