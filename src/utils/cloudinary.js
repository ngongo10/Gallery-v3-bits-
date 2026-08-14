/**
 * Cloudinary URL utilities for responsive images
 */

/**
 * Build a single optimized Cloudinary image URL
 * @param {string} url - Image URL (Cloudinary or regular)
 * @param {Object} options - URL parameters
 * @param {number} options.w - Width in pixels
 * @param {boolean} options.dprAuto - Enable automatic DPR (device pixel ratio)
 * @returns {string} Optimized image URL
 */
export function buildSrc(url, options = {}) {
  if (!url) return '';

  // If it's already a Cloudinary URL, enhance it with parameters
  if (url.includes('res.cloudinary.com')) {
    const params = [];
    if (options.w) params.push(`w_${Math.round(options.w)}`);
    if (options.dprAuto) params.push('dpr_auto');
    
    if (params.length === 0) return url;

    // Insert parameters before the filename
    const parts = url.split('/');
    const lastPartIndex = parts.length - 1;
    const filename = parts[lastPartIndex];
    
    // Find the 'upload' segment and insert after it
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex !== -1) {
      parts.splice(uploadIndex + 1, 0, params.join(','));
      return parts.join('/');
    }
    return url;
  }

  // For non-Cloudinary URLs, return as-is
  return url;
}

/**
 * Build a srcset string for responsive images at multiple widths
 * @param {string} url - Image URL (Cloudinary or regular)
 * @param {number[]} widths - Array of widths in pixels
 * @returns {string} srcset attribute value
 */
export function buildSrcSet(url, widths = []) {
  if (!url || widths.length === 0) return '';

  if (!url.includes('res.cloudinary.com')) {
    // For non-Cloudinary URLs, return simple srcset
    return widths.map(w => `${url} ${w}w`).join(', ');
  }

  // Build Cloudinary srcset with different widths
  return widths
    .map(width => {
      const optimized = buildSrc(url, { w: width, dprAuto: true });
      return `${optimized} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate default sizes attribute value for responsive images
 * @param {number} tileWidth - Primary tile width in pixels
 * @returns {string} sizes attribute value
 */
export function defaultSizes(tileWidth = 200) {
  if (!tileWidth) return '(max-width: 768px) 100vw, 80vw';
  
  const px = Math.round(tileWidth);
  return `(max-width: 768px) 100vw, (max-width: 1024px) 80vw, ${px}px`;
}
