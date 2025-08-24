/**
 * Deployment Configuration
 * This file handles domain-agnostic configuration for easy deployment
 */

export interface DeploymentConfig {
  serverDomain: string;
  serverName: string;
  isSecure: boolean;
  isDevelopment: boolean;
}

/**
 * Get deployment configuration based on environment
 */
export function getDeploymentConfig(): DeploymentConfig {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return {
      serverDomain: 'localhost:3000',
      serverName: 'Local Development Server',
      isSecure: false,
      isDevelopment: true,
    };
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.local');

  // Development configuration
  if (isDevelopment) {
    return {
      serverDomain: 'localhost:3000',
      serverName: 'Local Development Server',
      isSecure: false,
      isDevelopment: true,
    };
  }

  // Production configuration - use environment variables or derive from current domain
  const customServerDomain = getCustomServerDomain();
  if (customServerDomain) {
    return {
      serverDomain: customServerDomain,
      serverName: getServerName(customServerDomain),
      isSecure: protocol === 'https:',
      isDevelopment: false,
    };
  }

  // Fallback: derive server domain from current frontend domain
  // This assumes your backend is hosted on the same domain or a predictable subdomain
  const serverDomain = deriveServerDomain(hostname, protocol === 'https:');
  
  return {
    serverDomain,
    serverName: getServerName(serverDomain),
    isSecure: protocol === 'https:',
    isDevelopment: false,
  };
}

/**
 * Get custom server domain from environment variables
 */
function getCustomServerDomain(): string | null {
  // Check for Vite environment variable
  if (import.meta?.env?.VITE_SERVER_DOMAIN) {
    return import.meta.env.VITE_SERVER_DOMAIN;
  }

  // Check for runtime configuration (can be set by deployment script)
  if (typeof window !== 'undefined' && (window as any).BRAINBOX_SERVER_DOMAIN) {
    return (window as any).BRAINBOX_SERVER_DOMAIN;
  }

  return null;
}

/**
 * Derive server domain from frontend domain
 */
function deriveServerDomain(frontendHostname: string, isSecure: boolean): string {
  // Strategy 1: API subdomain (recommended)
  // Frontend: app.yourdomain.com → Backend: api.yourdomain.com
  if (frontendHostname.startsWith('app.')) {
    const baseDomain = frontendHostname.substring(4);
    const port = isSecure ? '' : ':3000';
    return `api.${baseDomain}${port}`;
  }

  // Strategy 2: Same domain with /api path
  // Frontend: yourdomain.com → Backend: yourdomain.com/api (handled by reverse proxy)
  const port = isSecure ? '' : ':3000';
  return `${frontendHostname}${port}`;
}

/**
 * Get human-readable server name
 */
function getServerName(serverDomain: string): string {
  if (serverDomain.includes('localhost')) {
    return 'Local Development Server';
  }

  // Extract domain for name
  const domain = serverDomain.replace(/^(api\.|www\.)/, '').replace(/:\d+$/, '');
  const capitalizedDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
  
  return `${capitalizedDomain} Server`;
}

/**
 * Get all available servers for the current deployment
 */
export function getAvailableServers() {
  const config = getDeploymentConfig();
  
  return [{
    domain: config.serverDomain,
    name: config.serverName,
    avatar: '',
    attributes: config.isSecure ? '{}' : '{"insecure":true}',
    version: '0.2.0',
    created_at: new Date().toISOString(),
  }];
}