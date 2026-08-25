/**
 * Cloudinary & General Image URL Optimizer
 * Automatically adds f_auto, q_auto, and responsive width transformations.
 */
export const optimizeImage = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url;

  // Cloudinary image optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const uploadMarker = '/upload/';
    const uploadIndex = url.indexOf(uploadMarker);
    const afterUpload = url.slice(uploadIndex + uploadMarker.length);
    const segments = afterUpload.split('/');
    const hasTransformations = /^(?:f_auto|q_auto|w_\d+|c_limit|c_fill)(?:,|$)/.test(segments[0]);
    if (hasTransformations) segments.shift();
    return `${url.slice(0, uploadIndex + uploadMarker.length)}f_auto,q_auto,c_limit,w_${width}/${segments.join('/')}`;
  }

  // Unsplash image optimization
  if (url.includes('images.unsplash.com')) {
    const hasParams = url.includes('?');
    return `${url}${hasParams ? '&' : '?'}auto=format&fit=crop&q=75&w=${width}`;
  }

  return url;
};

/**
 * Generates srcSet and sizes attributes for responsive images
 * @param {string} url - Original image URL
 * @param {Array<number>} widths - Array of widths for srcSet
 * @param {string} sizes - CSS sizes string
 * @param {boolean} isThumbnail - If true, adds aggressive cropping and formatting
 * @returns {Object} { src, srcSet, sizes }
 */
export const getResponsiveImageAttributes = (url, widths = [500, 800, 1200], sizes = "(max-width: 640px) 100vw, 800px", isThumbnail = false) => {
  if (!url || typeof url !== 'string') return { src: url, srcSet: undefined, sizes: undefined };

  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const srcSet = widths.map(w => {
      const transform = isThumbnail ? `c_limit,w_${w},f_auto,q_auto` : `f_auto,q_auto,w_${w}`;
      return `${buildCloudinaryUrl(url, transform)} ${w}w`;
    }).join(', ');
    
    // Default src uses the middle or largest width
    const defaultTransform = isThumbnail ? `c_limit,w_${widths[0]},f_auto,q_auto` : `f_auto,q_auto,w_${widths[0]}`;
    const src = buildCloudinaryUrl(url, defaultTransform);

    return { src, srcSet, sizes };
  }

  if (url.includes('images.unsplash.com')) {
    const hasParams = url.includes('?');
    const separator = hasParams ? '&' : '?';
    const srcSet = widths.map(w => {
      return `${url}${separator}auto=format&fit=crop&q=75&w=${w} ${w}w`;
    }).join(', ');
    
    return {
      src: `${url}${separator}auto=format&fit=crop&q=75&w=${widths[0]}`,
      srcSet,
      sizes
    };
  }

  return { src: url, srcSet: undefined, sizes: undefined };
};

const buildCloudinaryUrl = (url, transform) => {
  const uploadMarker = '/upload/';
  const uploadIndex = url.indexOf(uploadMarker);
  const afterUpload = url.slice(uploadIndex + uploadMarker.length);
  const segments = afterUpload.split('/');
  if (/^(?:f_auto|q_auto|w_\d+|c_limit|c_fill)(?:,|$)/.test(segments[0])) segments.shift();
  return `${url.slice(0, uploadIndex + uploadMarker.length)}${transform}/${segments.join('/')}`;
};
