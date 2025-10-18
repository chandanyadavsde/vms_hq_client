/**
 * VMS API Services Export
 * Central hub for all API services
 */

import BaseApiService from './BaseApiService.js'
import VehicleService from './VehicleService.js'
import DriverService from './DriverService.js'
import DashboardService from './DashboardService.js'
import VehicleDriverService from './VehicleDriverService.js'

// Export individual services
export { default as BaseApiService } from './BaseApiService.js'
export { default as VehicleService } from './VehicleService.js'
export { default as DriverService } from './DriverService.js'
export { default as DashboardService } from './DashboardService.js'
export { default as VehicleDriverService } from './VehicleDriverService.js'

// Export combined API service object
export const apiService = {
  base: BaseApiService,
  vehicles: VehicleService,
  drivers: DriverService,
  dashboard: DashboardService,
  vehicleDriver: VehicleDriverService,
  
  // Future services will be added here:
  // plants: PlantService,
  // auth: AuthService,
  // notifications: NotificationService,
}

// Development utilities
if (import.meta.env.MODE === 'development') {
  // Expose to window for debugging
  window.apiService = apiService
  
  console.log('🛠️ API Services initialized:', {
    base: '✅ BaseApiService',
    vehicles: '✅ VehicleService',
    // Add more as they're implemented
  })
}

export default apiService
