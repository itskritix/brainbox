/**
 * Single server configuration for the application
 * In development: uses localhost:3000/config as per old setup
 * In production: uses the actual deployment domain
 */

// Constants to avoid magic strings
const DEFAULT_DEV_SERVER = 'http://localhost:3000/config';
const CONFIG_PATH = '/config';

/**
 * Validates if a URL is properly formatted for server configuration
 */
const validateServerUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Gets the server URL based on environment configuration
 */
export const getServerUrl = (): string => {
  // Use Vite's import.meta.env instead of process.env for browser compatibility
  const isDevelopment = import.meta.env.DEV;
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  // In development, use localhost:3000/config (as per old setup)
  if (isDevelopment) {
    const devUrl = serverUrl || DEFAULT_DEV_SERVER;
    if (!validateServerUrl(devUrl)) {
      console.warn('Invalid development server URL:', devUrl, 'Using default:', DEFAULT_DEV_SERVER);
      return DEFAULT_DEV_SERVER;
    }
    return devUrl;
  }
  
  // In production, use environment variable or derive from current domain
  if (serverUrl) {
    if (!validateServerUrl(serverUrl)) {
      console.warn('Invalid production server URL:', serverUrl, 'Falling back to current domain');
      const currentDomain = window.location.origin;
      return `${currentDomain}${CONFIG_PATH}`;
    }
    return serverUrl;
  }
  
  // Fallback: use current domain with /config path
  const currentDomain = window.location.origin;
  return `${currentDomain}${CONFIG_PATH}`;
};

/**
 * Extracts the domain from the server URL
 */
export const getServerDomain = (): string => {
  const url = getServerUrl();
  try {
    return new URL(url).host;
  } catch (error) {
    console.warn('Failed to parse server URL:', url, error);
    return window.location.host;
  }
};