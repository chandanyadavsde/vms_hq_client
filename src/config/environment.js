/**
 * Environment Configuration for VMS Application
 * Centralizes all environment-specific settings
 */

const environment = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  USE_PROXY: import.meta.env.VITE_USE_PROXY === 'true',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutes
  
  // Get the actual API URL based on proxy setting
  get API_URL() {
    if (this.USE_PROXY && this.IS_PRODUCTION) {
      return '/api/proxy'; // Use Vercel proxy in production
    }
    return this.API_BASE_URL; // Use direct URL in development
  },

  // Application Configuration
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  VERSION: import.meta.env.VITE_VERSION || '1.0.0',

  // Feature Flags
  ENABLE_SEARCH: import.meta.env.VITE_ENABLE_SEARCH !== 'false',
  ENABLE_PAGINATION: import.meta.env.VITE_ENABLE_PAGINATION !== 'false',
  ENABLE_CACHING: import.meta.env.VITE_ENABLE_CACHING !== 'false',
  DISABLE_HTTPS_CHECK: import.meta.env.VITE_DISABLE_HTTPS_CHECK === 'true',

  // Derived values
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
}

// Validation
if (!environment.API_BASE_URL) {
  console.error('❌ API_BASE_URL is required but not configured')
}

// HTTPS Warning
if (environment.IS_PRODUCTION && environment.API_BASE_URL.startsWith('http://') && !environment.DISABLE_HTTPS_CHECK) {
  console.warn('⚠️ Using HTTP API in production - mixed content may be blocked by browsers')
}

// Development logging
if (environment.IS_DEVELOPMENT) {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: environment.API_BASE_URL,
    API_URL: environment.API_URL,
    USE_PROXY: environment.USE_PROXY,
    ENVIRONMENT: environment.ENVIRONMENT,
    CACHE_TTL: environment.CACHE_TTL,
    DISABLE_HTTPS_CHECK: environment.DISABLE_HTTPS_CHECK,
  })
}

export default environment
