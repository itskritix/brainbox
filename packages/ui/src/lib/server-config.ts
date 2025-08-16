/**
 * Single server configuration for the application
 * In development: uses localhost:3000/config as per old setup
 * In production: uses the actual deployment domain
 */
export const getServerUrl = (): string => {
  // Use Vite's import.meta.env instead of process.env for browser compatibility
  const isDevelopment = import.meta.env.DEV;
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  // In development, use localhost:3000/config (as per old setup)
  if (isDevelopment) {
    return serverUrl || 'http://localhost:3000/config';
  }
  
  // In production, use environment variable or derive from current domain
  if (serverUrl) {
    return serverUrl;
  }
  
  // Fallback: use current domain with /config path
  const currentDomain = window.location.origin;
  return `${currentDomain}/config`;
};

export const getServerDomain = (): string => {
  const url = getServerUrl();
  try {
    return new URL(url).host;
  } catch {
    // Fallback if URL parsing fails
    return window.location.host;
  }
};