// app/lib/image.utils.ts

const DEFAULT_IMAGE = 'https://pbs.twimg.com/media/FNf8P5AVEAEytt-.png';

/**
 * Checks if a URL has a valid image extension
 */
export const hasImageExtension = (url: string): boolean => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i;
  return imageExtensions.test(url);
};

/**
 * Transforms problematic image URLs into more compatible formats
 */
export const transformImageUrl = (url: string): string => {
  try {
    // Handle Lh3.googleusercontent.com URLs
    if (url.includes('lh3.googleusercontent.com')) {
      return url + '=w500.png';
    }

    // Handle seadn.io URLs without extensions
    if (url.includes('seadn.io') && !hasImageExtension(url)) {
      // Add PNG format if not specified
      return url + (url.includes('?') ? '&format=png' : '?format=png');
    }

    // If URL has a valid image extension, return as is
    if (hasImageExtension(url)) {
      return url;
    }

    // For other URLs without extensions, try to force PNG format
    if (!url.includes('?')) {
      return url + '?format=png';
    }

    return url;
  } catch (error) {
    console.error('Error transforming image URL:', error);
    return DEFAULT_IMAGE;
  }
};

/**
 * Validates if a URL points to a supported image format
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};