import baseApiService from './BaseApiService.js'

class PreLrService {
  constructor() {
    this.baseEndpoint = '/vms/ns-prelr'
  }

  /**
   * Get all PRE-LR data from local endpoint
   * @returns {Promise<Object>} API response with PRE-LR data
   */
  async getPreLrs() {
    try {
      const response = await baseApiService.get(`${this.baseEndpoint}/local?limit=1000`)
      return response
    } catch (error) {
      console.error('Error fetching PRE-LRs:', error)
      throw error
    }
  }

  /**
   * Get specific PRE-LR by ID
   * @param {string} preLrId - PRE-LR ID
   * @returns {Promise<Object>} PRE-LR details
   */
  async getPreLrById(preLrId) {
    try {
      const response = await baseApiService.get(`${this.baseEndpoint}/${preLrId}`)
      return response
    } catch (error) {
      console.error('Error fetching PRE-LR details:', error)
      throw error
    }
  }

  /**
   * Transform API data to UI-friendly format
   * @param {Array} apiData - Raw API data array
   * @returns {Array} Transformed data for UI
   */
  transformPreLrData(apiData) {
    return apiData.map(preLr => ({
      id: preLr.header?.name || preLr.preLrNumber || '',
      internalId: preLr.header?.internalId || preLr.internalId || '',
      name: preLr.header?.consignee || preLr.consignee || '',
      consignee: preLr.header?.consignee || preLr.consignee || '',
      consignor: preLr.header?.consignor || preLr.consignor || '',
      lrCount: (preLr.lrCreation || preLr.lrs || []).length,
      wtgNumber: preLr.header?.wtgNumber || preLr.wtgNumber || '',
      content: preLr.header?.content || preLr.content || '',
      fromLocation: preLr.header?.fromLocation || preLr.fromLocation || '',
      district: preLr.header?.site || preLr.site || '', // Map site to district
      site: preLr.header?.site || preLr.site || '',
      state: preLr.header?.stateHeader || preLr.stateHeader || '',
      status: this.mapStatus(preLr.header?.status || preLr.status),
      createdDate: this.formatDate(preLr.createdAt),
      progress: this.calculateProgress(preLr.meta?.stateTracking || preLr.stateTracking),
      rawData: preLr, // Keep original data for detailed views
      associatedLrs: this.transformLrData(preLr.lrCreation || preLr.lrs || []),
      preLrLines: this.transformPreLrLines(preLr.lines || preLr.preLrLines || [])
    }))
  }

  /**
   * Transform LR data for UI display
   * @param {Array} lrs - Raw LR data array
   * @returns {Array} Transformed LR data
   */
  transformLrData(lrs) {
    return lrs.map(lr => ({
      id: lr.lrName,
      lrName: lr.lrName,
      lrDate: lr.lrDate,
      status: this.mapLrStatus(lr.status),
      vehicleNo: lr.vehicleNo,
      vehicleType: lr.vehicleType,
      vehicleReqDate: lr.vehicleReqDate,
      vehicleRepDate: lr.vehicleRepDate,
      vehicleDepDate: lr.vehicleDepDate,
      vehicleRelDate: lr.vehicleRelDate,
      assignmentStatus: lr.local?.vehicle?.assignmentStatus || lr.vehicle?.assignmentStatus || 'unassigned',
      driverStatus: lr.local?.driver?.driverStatus || lr.driver?.driverStatus || 'unassigned',
      punchlistStatus: lr.local?.punchlist?.status || lr.punchlist?.status || 'pending',
      punchlistType: lr.local?.punchlist?.punchlistType || lr.punchlist?.punchlistType || 'general',
      ready: lr.status === 'Delivered' && (lr.local?.vehicle?.assignmentStatus === 'assigned' || lr.vehicle?.assignmentStatus === 'assigned'),
      rawData: lr
    }))
  }

  /**
   * Transform PRE-LR lines data for table display
   * @param {Array} lines - Raw PRE-LR lines data
   * @returns {Array} Transformed lines data
   */
  transformPreLrLines(lines) {
    return lines.map(line => ({
      id: line.prelrLineItnernalId,
      lineId: line.prelrLineItnernalId,
      subContent: line.subContent,
      totalQuantity: line.totalQuantity,
      vehicleType: line.vehicleType,
      vehicleCategory: line.vehicleCategory,
      customerRate: line.customerRate,
      newCustomerRate: line.newCustomerRate,
      lrCreatedQty: line.lrCreatedQty,
      lrRemainingQty: line.lrRemainingQty,
      lineConsigner: line.lineConsigner,
      lineRemarks: line.lineRemarks,
      shortClose: line.shortClose,
      lineStatus: this.mapLineStatus(line.lineStatus),
      rawData: line
    }))
  }

  /**
   * Map API status to UI status
   * @param {string} apiStatus - Status from API
   * @returns {string} UI-friendly status
   */
  mapStatus(apiStatus) {
    // Trim to handle trailing spaces from NetSuite
    const trimmedStatus = apiStatus ? apiStatus.trim() : ''

    const statusMap = {
      'Open': 'open',
      'Close': 'closed',  // NetSuite sends "Close" not "Closed"
      'Closed': 'closed', // Handle both variants
      'Processing': 'processing',
      'Pending': 'pending'
    }
    return statusMap[trimmedStatus] || 'pending'
  }

  /**
   * Map LR status to UI status
   * @param {string} lrStatus - LR status from API
   * @returns {string} UI-friendly status
   */
  mapLrStatus(lrStatus) {
    // Trim to handle trailing spaces from NetSuite
    const trimmedStatus = lrStatus ? lrStatus.trim() : ''

    const statusMap = {
      'Delivered': 'completed',
      'Submitted': 'processing',  // NetSuite sends "Submitted" for LRs
      'In Transit': 'processing',
      'Pending': 'pending',
      'Cancelled': 'cancelled'
    }
    return statusMap[trimmedStatus] || 'pending'
  }

  /**
   * Map line status to UI status
   * @param {string} lineStatus - Line status from API
   * @returns {string} UI-friendly status
   */
  mapLineStatus(lineStatus) {
    const statusMap = {
      'pending': 'pending',
      'completed': 'completed',
      'processing': 'processing',
      'cancelled': 'cancelled'
    }
    return statusMap[lineStatus] || 'pending'
  }

  /**
   * Calculate progress percentage
   * @param {Object} stateTracking - State tracking object
   * @returns {number} Progress percentage
   */
  calculateProgress(stateTracking) {
    if (!stateTracking || !stateTracking.totalQuantity || stateTracking.totalQuantity === 0) {
      return 0
    }
    return Math.round((stateTracking.lrCreatedQuantity / stateTracking.totalQuantity) * 100)
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString('en-GB')
    } catch (error) {
      return dateString
    }
  }

  /**
   * Get status color class for UI
   * @param {string} status - Status string
   * @returns {string} Tailwind CSS class
   */
  getStatusColor(status) {
    const colorMap = {
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Get LR status color class for UI
   * @param {string} status - LR status string
   * @returns {string} Tailwind CSS class
   */
  getLrStatusColor(status) {
    return this.getStatusColor(status)
  }

  /**
   * Get line status color class for UI
   * @param {string} status - Line status string
   * @returns {string} Tailwind CSS class
   */
  getLineStatusColor(status) {
    return this.getStatusColor(status)
  }

  /**
   * Apply advanced filters to PRE-LR data
   * @param {Array} preLrs - Array of PRE-LR data
   * @param {Object} filters - Filter configuration object
   * @returns {Array} Filtered PRE-LR data
   */
  applyFilters(preLrs, filters) {
    if (!filters || Object.keys(filters).length === 0) return preLrs

    return preLrs.filter(preLr => {
      // PRE-LR Status filter
      if (filters.preLrStatus && filters.preLrStatus.length > 0) {
        if (!filters.preLrStatus.some(s => s.value === preLr.status)) return false
      }

      // Site filter
      if (filters.site && filters.site.length > 0) {
        if (!filters.site.some(s => s.value === preLr.site)) return false
      }

      // District filter
      if (filters.district && filters.district.length > 0) {
        if (!filters.district.some(d => d.value === preLr.district)) return false
      }

      // State filter
      if (filters.state && filters.state.length > 0) {
        if (!filters.state.some(s => s.value === preLr.state)) return false
      }

      // Consignor filter
      if (filters.consignor && filters.consignor.length > 0) {
        if (!filters.consignor.some(c => c.value === preLr.consignor)) return false
      }

      // Consignee filter
      if (filters.consignee && filters.consignee.length > 0) {
        if (!filters.consignee.some(c => c.value === preLr.consignee)) return false
      }

      // WTG Number filter
      if (filters.wtgNumber && filters.wtgNumber.length > 0) {
        if (!filters.wtgNumber.some(w => w.value === preLr.wtgNumber)) return false
      }

      // Date Range filter
      if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
        const preLrDate = new Date(preLr.rawData?.createdAt || preLr.createdDate)
        if (filters.dateRange.from && preLrDate < new Date(filters.dateRange.from)) return false
        if (filters.dateRange.to && preLrDate > new Date(filters.dateRange.to)) return false
      }

      // LR Status filter - check if ANY LR matches the selected statuses
      if (filters.lrStatus && filters.lrStatus.length > 0) {
        const hasMatchingLr = preLr.associatedLrs.some(lr =>
          filters.lrStatus.some(s => s.value === lr.status)
        )
        if (!hasMatchingLr) return false
      }

      // Vehicle Assignment filter - check if ANY LR matches
      if (filters.vehicleAssigned && filters.vehicleAssigned !== 'all') {
        const hasMatchingLr = preLr.associatedLrs.some(lr => {
          const isAssigned = lr.assignmentStatus === 'assigned' ||
                           lr.assignmentStatus === 'confirmed' ||
                           lr.assignmentStatus === 'in_transit' ||
                           lr.assignmentStatus === 'delivered'
          if (filters.vehicleAssigned === 'assigned' && !isAssigned) return false
          if (filters.vehicleAssigned === 'unassigned' && isAssigned) return false
          return true
        })
        if (!hasMatchingLr) return false
      }

      // Driver Assignment filter - check if ANY LR matches
      if (filters.driverAssigned && filters.driverAssigned !== 'all') {
        const hasMatchingLr = preLr.associatedLrs.some(lr => {
          const isAssigned = lr.driverStatus === 'assigned' ||
                           lr.driverStatus === 'confirmed' ||
                           lr.driverStatus === 'available' ||
                           lr.driverStatus === 'busy'
          if (filters.driverAssigned === 'assigned' && !isAssigned) return false
          if (filters.driverAssigned === 'unassigned' && isAssigned) return false
          return true
        })
        if (!hasMatchingLr) return false
      }

      // Punchlist Status filter - check if ANY LR matches
      if (filters.punchlistStatus && filters.punchlistStatus.length > 0) {
        const hasMatchingLr = preLr.associatedLrs.some(lr =>
          filters.punchlistStatus.some(s => s.value === lr.punchlistStatus)
        )
        if (!hasMatchingLr) return false
      }

      // Line Status filter - check if ANY line matches
      if (filters.lineStatus && filters.lineStatus.length > 0) {
        const hasMatchingLine = preLr.preLrLines.some(line =>
          filters.lineStatus.some(s => s.value === line.lineStatus)
        )
        if (!hasMatchingLine) return false
      }

      // Remaining Quantity filter - check if ANY line matches the range
      if (filters.remainingQty && (filters.remainingQty.min || filters.remainingQty.max)) {
        const hasMatchingLine = preLr.preLrLines.some(line => {
          const remainingQty = parseInt(line.lrRemainingQty) || 0
          if (filters.remainingQty.min && remainingQty < parseInt(filters.remainingQty.min)) return false
          if (filters.remainingQty.max && remainingQty > parseInt(filters.remainingQty.max)) return false
          return true
        })
        if (!hasMatchingLine) return false
      }

      return true
    })
  }

  /**
   * Sort PRE-LR data by specified field and direction
   * @param {Array} preLrs - Array of PRE-LR data
   * @param {Object} sortConfig - Sort configuration {key, direction}
   * @returns {Array} Sorted PRE-LR data
   */
  sortPreLrs(preLrs, sortConfig) {
    if (!sortConfig || !sortConfig.key) return preLrs

    return [...preLrs].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Special handling for status sorting (priority order)
      if (sortConfig.key === 'status') {
        const statusPriority = {
          'pending': 1,
          'processing': 2,
          'active': 3,
          'completed': 4
        }
        const aPriority = statusPriority[aValue] || 999
        const bPriority = statusPriority[bValue] || 999
        return sortConfig.direction === 'asc'
          ? aPriority - bPriority
          : bPriority - aPriority
      }

      // Special handling for date sorting
      if (sortConfig.key === 'createdDate') {
        const aDate = new Date(a.rawData?.createdAt || aValue)
        const bDate = new Date(b.rawData?.createdAt || bValue)
        return sortConfig.direction === 'asc'
          ? aDate - bDate
          : bDate - aDate
      }

      // Special handling for numeric fields
      if (sortConfig.key === 'lrCount' || sortConfig.key === 'progress') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      // Default string comparison
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue
    })
  }
}

export default new PreLrService()
