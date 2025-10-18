/**
 * Centralized API Configuration for VMS Application
 * Single source of truth for all API endpoints
 */

import environment from './environment.js'

// Base API Configuration
export const API_CONFIG = {
  BASE_URL: environment.API_BASE_URL,
  TIMEOUT: environment.API_TIMEOUT,
  CACHE_TTL: environment.CACHE_TTL,
}

// API Endpoints - Organized by Domain
export const API_ENDPOINTS = {
  // Vehicle Management
  VEHICLE: {
    // Vehicle listing with filters
    LIST: (plant) => `/vms/vehicle/plant/${plant}`,
    
    // Vehicle search by number
    SEARCH: (vehicleNumber) => `/vms/vehicle/number/${vehicleNumber}`,
    
    // In Transit vehicles (global, not plant-specific)
    IN_TRANSIT: () => `/vms/vehicle/in-transit`,
    
    // Vehicle approval actions
    APPROVAL: (vehicleId) => `/vms/vehicle-master/approval/${vehicleId}`,
    
    // Trip completion (set currentPlant to "free")
    COMPLETE_TRIP: (vehicleNumber) => `/vms/vehicle/${vehicleNumber}`,
    
    // Vehicle details
    DETAILS: (vehicleId) => `/vms/vehicle/details/${vehicleId}`,
  },

  // Driver Management  
  DRIVER: {
    // Driver listing
    LIST: (plant) => `/vms/driver/plant/${plant}`,
    
    // Driver details
    DETAILS: (driverId) => `/vms/driver/details/${driverId}`,
    
    // Driver approval actions
    APPROVAL: (driverId) => `/vms/driver-master/approval/${driverId}`,
    
    // Driver search
    SEARCH: (licenseNumber) => `/vms/driver/license/${licenseNumber}`,
  },

  // Plant Management
  PLANT: {
    // Get all plants
    LIST: () => `/vms/plants`,
    
    // Plant details
    DETAILS: (plantId) => `/vms/plant/${plantId}`,
    
    // Plant statistics
    STATS: (plantId) => `/vms/plant/${plantId}/stats`,
  },

  // Dashboard & Analytics
  DASHBOARD: {
    // Overall statistics
    STATS: () => `/vms/dashboard/stats`,
    
    // Approval metrics
    APPROVAL_METRICS: () => `/vms/dashboard/approval-metrics`,
    
    // Vehicle counts by status
    VEHICLE_COUNTS: (plant) => `/vms/dashboard/vehicle-counts/${plant}`,
  },

  // File Management
  FILES: {
    // File upload
    UPLOAD: () => `/vms/files/upload`,
    
    // File download
    DOWNLOAD: (fileId) => `/vms/files/download/${fileId}`,
    
    // File preview
    PREVIEW: (fileId) => `/vms/files/preview/${fileId}`,
  },

  // Authentication (Future)
  AUTH: {
    LOGIN: () => `/auth/login`,
    LOGOUT: () => `/auth/logout`,
    REFRESH: () => `/auth/refresh`,
    PROFILE: () => `/auth/profile`,
  },

  // Notifications (Future)
  NOTIFICATIONS: {
    LIST: () => `/vms/notifications`,
    MARK_READ: (notificationId) => `/vms/notifications/${notificationId}/read`,
    SETTINGS: () => `/vms/notification-settings`,
  },
}

// Query Parameter Builders
export const QUERY_BUILDERS = {
  // Vehicle list query parameters
  vehicleList: ({ status, page = 1, limit = 16, includeDriver = true, sortBy, sortOrder }) => {
    const params = new URLSearchParams({
      status,
      page: page.toString(),
      limit: limit.toString(),
      includeDriver: includeDriver.toString(),
    })
    
    if (sortBy) params.append('sortBy', sortBy)
    if (sortOrder) params.append('sortOrder', sortOrder)
    
    return params.toString()
  },

  // Driver list query parameters
  driverList: ({ status, page = 1, limit = 10, sortBy, sortOrder }) => {
    const params = new URLSearchParams({
      status,
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (sortBy) params.append('sortBy', sortBy)
    if (sortOrder) params.append('sortOrder', sortOrder)
    
    return params.toString()
  },

  // Dashboard filters
  dashboardStats: ({ dateFrom, dateTo, plant, status }) => {
    const params = new URLSearchParams()
    
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    if (plant) params.append('plant', plant)
    if (status) params.append('status', status)
    
    return params.toString()
  },
}

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}

// Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

// Development helpers
if (environment.IS_DEVELOPMENT) {
  console.log('🔗 API Configuration Loaded:', {
    BASE_URL: API_CONFIG.BASE_URL,
    TIMEOUT: API_CONFIG.TIMEOUT,
    ENDPOINTS_COUNT: Object.keys(API_ENDPOINTS).length,
  })
}
