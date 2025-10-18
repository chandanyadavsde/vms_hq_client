/**
 * Dashboard Service
 * Aggregates data from all VMS sources for comprehensive dashboard analytics
 */

import PreLrService from './PreLrService.js'
import VehicleService from './VehicleService.js'
import DriverService from './DriverService.js'

class DashboardService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Get comprehensive dashboard data
   * @returns {Promise<Object>} Complete dashboard data
   */
  async getDashboardData() {
    try {
      console.log('🚀 Fetching comprehensive dashboard data...')
      
      // Fetch all data in parallel for better performance
      const [preLrData, vehicleData, driverData] = await Promise.allSettled([
        this.getPreLrAnalytics(),
        this.getVehicleAnalytics(),
        this.getDriverAnalytics()
      ])

      // Process results and handle partial failures
      const dashboardData = {
        preLr: preLrData.status === 'fulfilled' ? preLrData.value : this.getDefaultPreLrData(),
        vehicles: vehicleData.status === 'fulfilled' ? vehicleData.value : this.getDefaultVehicleData(),
        drivers: driverData.status === 'fulfilled' ? driverData.value : this.getDefaultDriverData(),
        lastUpdated: new Date().toISOString(),
        errors: this.extractErrors([preLrData, vehicleData, driverData])
      }

      // Calculate derived metrics
      dashboardData.metrics = this.calculateDerivedMetrics(dashboardData)
      dashboardData.alerts = this.generateAlerts(dashboardData)

      console.log('✅ Dashboard data compiled successfully')
      return dashboardData
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      throw new Error('Failed to load dashboard data. Please try again.')
    }
  }

  /**
   * Get PRE-LR analytics and statistics
   * @returns {Promise<Object>} PRE-LR analytics data
   */
  async getPreLrAnalytics() {
    try {
      const response = await PreLrService.getPreLrs()
      const preLrs = response.success ? response.data : []
      
      const analytics = {
        total: preLrs.length,
        byStatus: this.groupByStatus(preLrs, 'status'),
        byPlant: this.groupByPlant(preLrs),
        recentActivity: this.getRecentActivity(preLrs),
        trends: this.calculateTrends(preLrs),
        topConsignees: this.getTopConsignees(preLrs),
        lrDistribution: this.calculateLrDistribution(preLrs)
      }

      return analytics
    } catch (error) {
      console.error('❌ Error fetching PRE-LR analytics:', error)
      throw error
    }
  }

  /**
   * Get vehicle analytics and statistics
   * @returns {Promise<Object>} Vehicle analytics data
   */
  async getVehicleAnalytics() {
    try {
      const response = await VehicleService.getAllVehicles({ limit: 1000 })
      const vehicles = response.vehicles || []
      
      const analytics = {
        total: vehicles.length,
        byStatus: this.groupByVehicleStatus(vehicles),
        byPlant: this.groupByVehiclePlant(vehicles),
        assignmentRate: this.calculateAssignmentRate(vehicles),
        documentExpiry: this.getDocumentExpiry(vehicles),
        utilization: this.calculateUtilization(vehicles)
      }

      return analytics
    } catch (error) {
      console.error('❌ Error fetching vehicle analytics:', error)
      throw error
    }
  }

  /**
   * Get driver analytics and statistics
   * @returns {Promise<Object>} Driver analytics data
   */
  async getDriverAnalytics() {
    try {
      const response = await DriverService.getAllDrivers({ limit: 1000 })
      const drivers = response.drivers || []
      
      const analytics = {
        total: drivers.length,
        byStatus: this.groupByDriverStatus(drivers),
        licenseExpiry: this.getLicenseExpiry(drivers),
        testStatus: this.getTestStatus(drivers),
        assignmentRate: this.calculateDriverAssignmentRate(drivers)
      }

      return analytics
    } catch (error) {
      console.error('❌ Error fetching driver analytics:', error)
      throw error
    }
  }

  /**
   * Group data by status
   * @param {Array} data - Data array
   * @param {string} statusField - Status field name
   * @returns {Object} Grouped data
   */
  groupByStatus(data, statusField) {
    return data.reduce((acc, item) => {
      const status = item[statusField] || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Group PRE-LRs by plant (using state/district)
   * @param {Array} preLrs - PRE-LR data
   * @returns {Object} Plant-wise grouping
   */
  groupByPlant(preLrs) {
    return preLrs.reduce((acc, preLr) => {
      const plant = preLr.state || preLr.district || 'Unknown'
      if (!acc[plant]) {
        acc[plant] = { total: 0, active: 0, completed: 0, pending: 0 }
      }
      acc[plant].total++
      acc[plant][preLr.status] = (acc[plant][preLr.status] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Group vehicles by status
   * @param {Array} vehicles - Vehicle data
   * @returns {Object} Status grouping
   */
  groupByVehicleStatus(vehicles) {
    return vehicles.reduce((acc, vehicle) => {
      const status = vehicle.hasDriver ? 'assigned' : 'available'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Group vehicles by plant
   * @param {Array} vehicles - Vehicle data
   * @returns {Object} Plant grouping
   */
  groupByVehiclePlant(vehicles) {
    return vehicles.reduce((acc, vehicle) => {
      const plant = vehicle.currentPlant || 'Unknown'
      acc[plant] = (acc[plant] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Group drivers by status
   * @param {Array} drivers - Driver data
   * @returns {Object} Status grouping
   */
  groupByDriverStatus(drivers) {
    return drivers.reduce((acc, driver) => {
      const hasVehicle = driver.assignedVehicles && driver.assignedVehicles.length > 0
      const status = hasVehicle ? 'assigned' : 'available'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Get recent PRE-LR activity
   * @param {Array} preLrs - PRE-LR data
   * @returns {Array} Recent activity
   */
  getRecentActivity(preLrs) {
    return preLrs
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      .slice(0, 5)
      .map(preLr => ({
        id: preLr.id,
        consignee: preLr.consignee,
        consignor: preLr.consignor,
        lrCount: preLr.lrCount,
        status: preLr.status,
        createdDate: preLr.createdDate,
        fromLocation: preLr.fromLocation,
        toLocation: preLr.district || preLr.state
      }))
  }

  /**
   * Calculate trends (simplified for now)
   * @param {Array} preLrs - PRE-LR data
   * @returns {Object} Trend data
   */
  calculateTrends(preLrs) {
    // Simplified trend calculation
    const lastWeek = preLrs.filter(p => {
      const date = new Date(p.createdDate)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    }).length

    const previousWeek = Math.max(1, Math.floor(preLrs.length * 0.8)) // Simulated
    const growth = ((lastWeek - previousWeek) / previousWeek) * 100

    return {
      weeklyGrowth: Math.round(growth),
      lastWeek,
      previousWeek
    }
  }

  /**
   * Get top consignees
   * @param {Array} preLrs - PRE-LR data
   * @returns {Array} Top consignees
   */
  getTopConsignees(preLrs) {
    const consigneeCount = preLrs.reduce((acc, preLr) => {
      acc[preLr.consignee] = (acc[preLr.consignee] || 0) + 1
      return acc
    }, {})

    return Object.entries(consigneeCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  /**
   * Calculate LR distribution
   * @param {Array} preLrs - PRE-LR data
   * @returns {Object} LR distribution
   */
  calculateLrDistribution(preLrs) {
    const totalLrs = preLrs.reduce((sum, preLr) => sum + preLr.lrCount, 0)
    const avgLrsPerPreLr = preLrs.length > 0 ? totalLrs / preLrs.length : 0

    return {
      totalLrs,
      avgLrsPerPreLr: Math.round(avgLrsPerPreLr * 10) / 10,
      maxLrs: Math.max(...preLrs.map(p => p.lrCount), 0),
      minLrs: Math.min(...preLrs.map(p => p.lrCount), 0)
    }
  }

  /**
   * Calculate vehicle assignment rate
   * @param {Array} vehicles - Vehicle data
   * @returns {number} Assignment rate percentage
   */
  calculateAssignmentRate(vehicles) {
    if (vehicles.length === 0) return 0
    const assigned = vehicles.filter(v => v.hasDriver).length
    return Math.round((assigned / vehicles.length) * 100)
  }

  /**
   * Calculate driver assignment rate
   * @param {Array} drivers - Driver data
   * @returns {number} Assignment rate percentage
   */
  calculateDriverAssignmentRate(drivers) {
    if (drivers.length === 0) return 0
    const assigned = drivers.filter(d => d.assignedVehicles && d.assignedVehicles.length > 0).length
    return Math.round((assigned / drivers.length) * 100)
  }

  /**
   * Get document expiry information
   * @param {Array} vehicles - Vehicle data
   * @returns {Object} Document expiry data
   */
  getDocumentExpiry(vehicles) {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const expiring = vehicles.filter(vehicle => {
      const rawData = vehicle.rawData
      if (!rawData) return false

      const insuranceExpiry = rawData.custrecord_insurance_end_date_ag
      const rcExpiry = rawData.custrecord_rc_end_date
      const permitExpiry = rawData.custrecord_permit_end_date
      const pucExpiry = rawData.custrecord_puc_end_date_ag

      return [insuranceExpiry, rcExpiry, permitExpiry, pucExpiry].some(date => {
        if (!date) return false
        const expiryDate = new Date(date)
        return expiryDate <= thirtyDaysFromNow && expiryDate >= now
      })
    }).length

    return {
      expiring,
      total: vehicles.length,
      percentage: vehicles.length > 0 ? Math.round((expiring / vehicles.length) * 100) : 0
    }
  }

  /**
   * Get license expiry information
   * @param {Array} drivers - Driver data
   * @returns {Object} License expiry data
   */
  getLicenseExpiry(drivers) {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const expiring = drivers.filter(driver => {
      const expiryDate = driver.identification?.licenseExpiry
      if (!expiryDate) return false
      const expiry = new Date(expiryDate)
      return expiry <= thirtyDaysFromNow && expiry >= now
    }).length

    return {
      expiring,
      total: drivers.length,
      percentage: drivers.length > 0 ? Math.round((expiring / drivers.length) * 100) : 0
    }
  }

  /**
   * Get test status information
   * @param {Array} drivers - Driver data
   * @returns {Object} Test status data
   */
  getTestStatus(drivers) {
    const passed = drivers.filter(d => d.rawData?.custrecord_driving_lca_test === 'passed').length
    const failed = drivers.filter(d => d.rawData?.custrecord_driving_lca_test === 'fail').length
    const pending = drivers.length - passed - failed

    return {
      passed,
      failed,
      pending,
      total: drivers.length
    }
  }

  /**
   * Calculate vehicle utilization
   * @param {Array} vehicles - Vehicle data
   * @returns {Object} Utilization data
   */
  calculateUtilization(vehicles) {
    const assigned = vehicles.filter(v => v.hasDriver).length
    const available = vehicles.filter(v => !v.hasDriver).length
    const total = vehicles.length

    return {
      assigned,
      available,
      total,
      utilizationRate: total > 0 ? Math.round((assigned / total) * 100) : 0
    }
  }

  /**
   * Calculate derived metrics
   * @param {Object} data - Dashboard data
   * @returns {Object} Derived metrics
   */
  calculateDerivedMetrics(data) {
    const { preLr, vehicles, drivers } = data

    return {
      overallEfficiency: this.calculateOverallEfficiency(preLr, vehicles, drivers),
      resourceUtilization: this.calculateResourceUtilization(vehicles, drivers),
      orderCompletionRate: this.calculateOrderCompletionRate(preLr),
      systemHealth: this.calculateSystemHealth(data)
    }
  }

  /**
   * Calculate overall efficiency score
   * @param {Object} preLr - PRE-LR data
   * @param {Object} vehicles - Vehicle data
   * @param {Object} drivers - Driver data
   * @returns {number} Efficiency score (0-100)
   */
  calculateOverallEfficiency(preLr, vehicles, drivers) {
    const orderCompletion = preLr.byStatus?.completed || 0
    const totalOrders = preLr.total || 1
    const vehicleUtilization = vehicles.utilization?.utilizationRate || 0
    const driverUtilization = drivers.assignmentRate || 0

    const completionScore = (orderCompletion / totalOrders) * 40
    const vehicleScore = (vehicleUtilization / 100) * 30
    const driverScore = (driverUtilization / 100) * 30

    return Math.round(completionScore + vehicleScore + driverScore)
  }

  /**
   * Calculate resource utilization
   * @param {Object} vehicles - Vehicle data
   * @param {Object} drivers - Driver data
   * @returns {Object} Resource utilization
   */
  calculateResourceUtilization(vehicles, drivers) {
    return {
      vehicleUtilization: vehicles.utilization?.utilizationRate || 0,
      driverUtilization: drivers.assignmentRate || 0,
      averageUtilization: Math.round(((vehicles.utilization?.utilizationRate || 0) + (drivers.assignmentRate || 0)) / 2)
    }
  }

  /**
   * Calculate order completion rate
   * @param {Object} preLr - PRE-LR data
   * @returns {number} Completion rate percentage
   */
  calculateOrderCompletionRate(preLr) {
    const completed = preLr.byStatus?.completed || 0
    const total = preLr.total || 1
    return Math.round((completed / total) * 100)
  }

  /**
   * Calculate system health score
   * @param {Object} data - Dashboard data
   * @returns {number} Health score (0-100)
   */
  calculateSystemHealth(data) {
    const { preLr, vehicles, drivers } = data
    
    // Factors affecting system health
    const orderVolume = preLr.total > 0 ? Math.min(preLr.total / 100, 1) : 0
    const vehicleHealth = vehicles.documentExpiry?.percentage < 10 ? 1 : 0.5
    const driverHealth = drivers.licenseExpiry?.percentage < 10 ? 1 : 0.5
    const resourceBalance = Math.abs((vehicles.utilization?.utilizationRate || 0) - (drivers.assignmentRate || 0)) < 20 ? 1 : 0.5

    const healthScore = (orderVolume * 25) + (vehicleHealth * 25) + (driverHealth * 25) + (resourceBalance * 25)
    return Math.round(healthScore)
  }

  /**
   * Generate system alerts
   * @param {Object} data - Dashboard data
   * @returns {Array} Alert list
   */
  generateAlerts(data) {
    const alerts = []
    const { preLr, vehicles, drivers } = data

    // Document expiry alerts
    if (vehicles.documentExpiry?.expiring > 0) {
      alerts.push({
        type: 'warning',
        category: 'vehicles',
        message: `${vehicles.documentExpiry.expiring} vehicle(s) have documents expiring within 30 days`,
        priority: 'high',
        action: 'Review vehicle documents'
      })
    }

    // License expiry alerts
    if (drivers.licenseExpiry?.expiring > 0) {
      alerts.push({
        type: 'warning',
        category: 'drivers',
        message: `${drivers.licenseExpiry.expiring} driver(s) have licenses expiring within 30 days`,
        priority: 'high',
        action: 'Review driver licenses'
      })
    }

    // Low utilization alerts
    if (vehicles.utilization?.utilizationRate < 70) {
      alerts.push({
        type: 'info',
        category: 'vehicles',
        message: `Vehicle utilization is ${vehicles.utilization.utilizationRate}%. Consider reassigning resources.`,
        priority: 'medium',
        action: 'Review vehicle assignments'
      })
    }

    // High pending orders
    const pendingOrders = preLr.byStatus?.pending || 0
    if (pendingOrders > preLr.total * 0.3) {
      alerts.push({
        type: 'warning',
        category: 'orders',
        message: `${pendingOrders} orders are pending. Consider increasing capacity.`,
        priority: 'medium',
        action: 'Review order processing'
      })
    }

    return alerts
  }

  /**
   * Extract errors from Promise.allSettled results
   * @param {Array} results - Promise.allSettled results
   * @returns {Array} Error list
   */
  extractErrors(results) {
    return results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason?.message || 'Unknown error')
  }

  /**
   * Get default data for failed requests
   */
  getDefaultPreLrData() {
    return {
      total: 0,
      byStatus: {},
      byPlant: {},
      recentActivity: [],
      trends: { weeklyGrowth: 0, lastWeek: 0, previousWeek: 0 },
      topConsignees: [],
      lrDistribution: { totalLrs: 0, avgLrsPerPreLr: 0, maxLrs: 0, minLrs: 0 }
    }
  }

  getDefaultVehicleData() {
    return {
      total: 0,
      byStatus: {},
      byPlant: {},
      assignmentRate: 0,
      documentExpiry: { expiring: 0, total: 0, percentage: 0 },
      utilization: { assigned: 0, available: 0, total: 0, utilizationRate: 0 }
    }
  }

  getDefaultDriverData() {
    return {
      total: 0,
      byStatus: {},
      licenseExpiry: { expiring: 0, total: 0, percentage: 0 },
      testStatus: { passed: 0, failed: 0, pending: 0, total: 0 },
      assignmentRate: 0
    }
  }
}

export default new DashboardService()

