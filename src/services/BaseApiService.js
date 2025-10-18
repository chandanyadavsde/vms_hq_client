/**
 * Base API Service for VMS Application
 * Handles common API functionality: auth, error handling, caching, retries
 */

import { API_CONFIG, HTTP_STATUS, HTTP_METHODS } from '../config/api.js'
import environment from '../config/environment.js'

class BaseApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.cache = new Map()
    this.requestInterceptors = []
    this.responseInterceptors = []
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Build full URL
   */
  buildURL(endpoint, params = '') {
    const url = `${this.baseURL}${endpoint}`
    return params ? `${url}?${params}` : url
  }

  /**
   * Get cache key
   */
  getCacheKey(method, url, data) {
    return `${method}:${url}:${JSON.stringify(data || {})}`
  }

  /**
   * Check cache
   */
  getFromCache(cacheKey) {
    if (!environment.ENABLE_CACHING) return null
    
    const cached = this.cache.get(cacheKey)
    if (!cached) return null
    
    const now = Date.now()
    if (now > cached.expiry) {
      this.cache.delete(cacheKey)
      return null
    }
    
    console.log('📦 Cache hit:', cacheKey)
    return cached.data
  }

  /**
   * Set cache
   */
  setCache(cacheKey, data, ttl = API_CONFIG.CACHE_TTL) {
    if (!environment.ENABLE_CACHING) return
    
    this.cache.set(cacheKey, {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    })
    
    console.log('💾 Cache set:', cacheKey)
  }

  /**
   * Clear cache by pattern
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
      console.log('🧹 Cache cleared for pattern:', pattern)
    } else {
      this.cache.clear()
      console.log('🧹 All cache cleared')
    }
  }

  /**
   * Apply request interceptors
   */
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config }
    
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig)
    }
    
    return modifiedConfig
  }

  /**
   * Apply response interceptors
   */
  async applyResponseInterceptors(response) {
    let modifiedResponse = response
    
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse)
    }
    
    return modifiedResponse
  }

  /**
   * Core request method with enterprise features
   */
  async request(method, endpoint, data = null, config = {}) {
    const startTime = Date.now()
    
    // Build URL and cache key
    const url = this.buildURL(endpoint, config.params)
    const cacheKey = this.getCacheKey(method, url, data)
    
    // Check cache for GET requests
    if (method === HTTP_METHODS.GET) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    // Prepare request configuration
    let requestConfig = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    }

    // Handle FormData for file uploads
    if (data instanceof FormData) {
      // Don't set Content-Type for FormData, let browser set it with boundary
      delete requestConfig.headers['Content-Type']
    }

    // Add body for non-GET requests
    if (data && method !== HTTP_METHODS.GET) {
      if (data instanceof FormData) {
        requestConfig.body = data
      } else {
        requestConfig.body = JSON.stringify(data)
      }
    }

    // Apply request interceptors
    requestConfig = await this.applyRequestInterceptors(requestConfig)

    try {
      console.log(`🚀 API Request: ${method} ${url}`)
      console.log(`🔧 Request config:`, requestConfig)
      
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      requestConfig.signal = controller.signal

      // Make the request
      const response = await fetch(url, requestConfig)
      clearTimeout(timeoutId)

      // Apply response interceptors
      const interceptedResponse = await this.applyResponseInterceptors(response)

      // Handle response
      if (!interceptedResponse.ok) {
        let errorMessage = `HTTP ${interceptedResponse.status}: ${interceptedResponse.statusText}`
        let errorDetails = null
        
        try {
          const errorData = await interceptedResponse.json()
          errorDetails = errorData
          errorMessage = errorData.details || errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          console.warn('Could not parse error response as JSON:', e)
        }
        
        const error = new Error(errorMessage)
        error.response = {
          status: interceptedResponse.status,
          statusText: interceptedResponse.statusText,
          data: errorDetails
        }
        throw error
      }

      const responseData = await interceptedResponse.json()
      const duration = Date.now() - startTime

      console.log(`✅ API Success: ${method} ${url} (${duration}ms)`)

      // Cache GET responses
      if (method === HTTP_METHODS.GET) {
        this.setCache(cacheKey, responseData)
      }

      // Clear related cache for mutations
      if (method !== HTTP_METHODS.GET) {
        this.clearCache(endpoint.split('/')[1]) // Clear by domain
      }

      return responseData

    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ API Error: ${method} ${url} (${duration}ms)`, error)

      // Handle specific error types
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`)
      }

      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check your connection')
      }

      throw error
    }
  }

  /**
   * Convenience methods
   */
  async get(endpoint, params = '', config = {}) {
    return this.request(HTTP_METHODS.GET, endpoint, null, { ...config, params })
  }

  async post(endpoint, data, config = {}) {
    return this.request(HTTP_METHODS.POST, endpoint, data, config)
  }

  async put(endpoint, data, config = {}) {
    return this.request(HTTP_METHODS.PUT, endpoint, data, config)
  }

  async patch(endpoint, data, config = {}) {
    return this.request(HTTP_METHODS.PATCH, endpoint, data, config)
  }

  async delete(endpoint, config = {}) {
    return this.request(HTTP_METHODS.DELETE, endpoint, null, config)
  }
}

// Create singleton instance
const baseApiService = new BaseApiService()

// Add default interceptors
baseApiService.addRequestInterceptor(async (config) => {
  // Add authentication headers (future)
  // config.headers.Authorization = `Bearer ${token}`
  
  // Add correlation ID for tracing
  config.headers['X-Correlation-ID'] = `vms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return config
})

baseApiService.addResponseInterceptor(async (response) => {
  // Log response headers in development
  if (environment.IS_DEVELOPMENT) {
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()))
  }
  
  return response
})

export { BaseApiService }
export default baseApiService
