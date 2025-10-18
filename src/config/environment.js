/**
 * Environment Configuration for VMS Application
 * Centralizes all environment-specific settings
 */

const environment = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutes

  // Application Configuration
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  VERSION: import.meta.env.VITE_VERSION || '1.0.0',

  // Feature Flags
  ENABLE_SEARCH: import.meta.env.VITE_ENABLE_SEARCH !== 'false',
  ENABLE_PAGINATION: import.meta.env.VITE_ENABLE_PAGINATION !== 'false',
  ENABLE_CACHING: import.meta.env.VITE_ENABLE_CACHING !== 'false',

  // Derived values
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
}

// Validation
if (!environment.API_BASE_URL) {
  console.error('❌ API_BASE_URL is required but not configured')
}

// Development logging
if (environment.IS_DEVELOPMENT) {
  console.log('🔧 Environment Configuration:', {
    API_BASE_URL: environment.API_BASE_URL,
    ENVIRONMENT: environment.ENVIRONMENT,
    CACHE_TTL: environment.CACHE_TTL,
  })
}

export default environment
