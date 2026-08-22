/**
 * Cloudinary URL utilities for responsive images
 */

export const CLOUDINARY_CLOUD_NAME = 'g55oyjhn';
export const CLOUDINARY_TRANSFORM = 'f_auto,q_auto,c_limit';

export function cloudinaryBaseUrl() {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_TRANSFORM}`;
}

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

  if (url.includes('res.cloudinary.com')) {
    const params = [];
    if (options.w) params.push(`w_${Math.round(options.w)}`);
    if (options.dprAuto) params.push('dpr_auto');

    if (params.length === 0) return url;

    const parts = url.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex !== -1) {
      const next = parts[uploadIndex + 1] || '';
      if (next.includes('_')) {
        parts[uploadIndex + 1] = `${parts[uploadIndex + 1]},${params.join(',')}`;
      } else {
        parts.splice(uploadIndex + 1, 0, params.join(','));
      }
      return parts.join('/');
    }
    return url;
  }

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
    return widths.map(w => `${url} ${w}w`).join(', ');
  }

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
  if (!tileWidth) return '(max-width: 768px) 46vw, 80vw';

  const px = Math.round(tileWidth);
  return `(max-width: 768px) 46vw, (max-width: 1024px) 80vw, ${px}px`;
}
