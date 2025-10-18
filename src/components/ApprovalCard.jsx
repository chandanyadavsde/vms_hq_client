import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, User, CheckSquare, FileText, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Truck, UserCheck, ClipboardCheck, Calendar, Image, FileText as DocumentIcon } from 'lucide-react'
import { getThemeColors } from '../utils/theme.js'
import useApprovalShortcuts from '../hooks/useApprovalShortcuts.js'

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
        type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.3 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <XCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}



// Enterprise API Services
import { apiService } from '../services/index.js'

const ApprovalCard = ({ selectedPlant = 'all', currentTheme = 'teal', activeStatus: externalActiveStatus, onStatusChange, onVehicleCountsUpdate, searchQuery: externalSearchQuery, onClearSearch }) => {
  const [activeSection, setActiveSection] = useState(null)
  const [activeVehicle, setActiveVehicle] = useState(null)
  const [reviewMessage, setReviewMessage] = useState('')
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showApprovedModal, setShowApprovedModal] = useState(false)
  const [showRejectedModal, setShowRejectedModal] = useState(false)
  
  // Custom confirmation modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationData, setConfirmationData] = useState(null)
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  // New pagination and active status state
  const [internalActiveStatus, setInternalActiveStatus] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Use external activeStatus if provided, otherwise use internal
  const activeStatus = externalActiveStatus || internalActiveStatus
  const setActiveStatus = onStatusChange || setInternalActiveStatus

  // Keyboard shortcuts
  const searchInputRef = useRef(null)

  // Keyboard shortcuts handlers
  const handleSearchFocus = useCallback(() => {
    // Search focused via keyboard shortcut
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchTerm('')
  }, [])

  // Initialize keyboard shortcuts
  useApprovalShortcuts({
    onStatusChange: setActiveStatus,
    onSearchFocus: handleSearchFocus,
    onSearchClear: handleSearchClear,
    searchInputRef,
    enabled: true
  })

  // Add direct Ctrl+K handler as backup
  useEffect(() => {
    const handleDirectCtrlK = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        console.log('🚨 Direct Ctrl+K handler triggered!')
        event.preventDefault()
        event.stopPropagation()
        
        if (searchInputRef?.current) {
          console.log('🎯 Direct focus attempt')
          searchInputRef.current.focus()
          searchInputRef.current.select()
        }
      }
    }

    // Add to window to catch it everywhere
    window.addEventListener('keydown', handleDirectCtrlK, { capture: true })
    
    return () => {
      window.removeEventListener('keydown', handleDirectCtrlK, { capture: true })
    }
  }, [])
  
  // API-driven state - keeping existing structure for backward compatibility
  const [pendingVehicles, setPendingVehicles] = useState([])
  const [approvedVehicles, setApprovedVehicles] = useState([])
  const [rejectedVehicles, setRejectedVehicles] = useState([])
  const [inTransitVehicles, setInTransitVehicles] = useState([])
  const [loading, setLoading] = useState({ pending: false, approved: false, rejected: false, 'in-transit': false })
  const [error, setError] = useState({ pending: false, approved: false, rejected: false, 'in-transit': false })
  
  const themeColors = getThemeColors(currentTheme)

  // Track driver approval status for fallback data
  const [driverApprovalStatus, setDriverApprovalStatus] = useState({})

  // Update driver approval status
  const updateDriverApprovalStatus = (driverId, status) => {
    setDriverApprovalStatus(prev => ({
      ...prev,
      [driverId]: status
    }))
  }

  // Get driver approval status for fallback data
  const getDriverApprovalStatus = (driverId) => {
    return driverApprovalStatus[driverId] || 'pending'
  }

  // Helper function to show toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  // Helper function to hide toast
  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' })
  }

  // Trip Completed state
  const [showTripCompletedModal, setShowTripCompletedModal] = useState(false)
  const [selectedVehicleForTrip, setSelectedVehicleForTrip] = useState(null)

  // Handle Trip Completed action
  const handleTripCompleted = (vehicle) => {
    setSelectedVehicleForTrip(vehicle)
    setShowTripCompletedModal(true)
  }

  // Confirm Trip Completed
  const confirmTripCompleted = async () => {
    if (!selectedVehicleForTrip) return

    try {
      const vehicleNumber = selectedVehicleForTrip.custrecord_vehicle_number
      console.log('🎯 Trip Completed for vehicle:', vehicleNumber)
      
      // Call real API to complete trip
      await apiService.vehicles.completeTrip(vehicleNumber)
      
      // Show success message
      showToast(`Trip completed for ${vehicleNumber}! Vehicle is now free.`, 'success')
      
      // Close modal
      setShowTripCompletedModal(false)
      setSelectedVehicleForTrip(null)
      
      // Immediately remove vehicle from In Transit list
      setInTransitVehicles(prevVehicles => 
        prevVehicles.filter(vehicle => 
          vehicle.custrecord_vehicle_number !== vehicleNumber
        )
      )
      
      // Update counts to reflect the removal
      setAllStatusCounts(prevCounts => ({
        ...prevCounts,
        'in-transit': Math.max(0, (prevCounts['in-transit'] || 0) - 1)
      }))
      
      // Update parent counts if callback provided
      if (onVehicleCountsUpdate) {
        onVehicleCountsUpdate(prevCounts => ({
          ...prevCounts,
          'in-transit': Math.max(0, (prevCounts['in-transit'] || 0) - 1)
        }))
      }
      
      console.log(`✅ Vehicle ${vehicleNumber} removed from In Transit list`)
      
    } catch (error) {
      console.error('Trip completion failed:', error)
      showToast(`Failed to complete trip: ${error.message}`, 'error')
    }
  }

  // Enterprise API Service Functions
  const fetchVehicles = async (plant, status, page = 1, limit = 10) => {
    try {
      const response = await apiService.vehicles.getVehicleList(plant, {
        status,
        page,
        limit,
        includeDriver: true
      })
      return response
    } catch (error) {
      console.error(`Error fetching ${status} vehicles:`, error)
      throw error
    }
  }

  // Enterprise Search API Function
  const searchVehicle = async (vehicleNumber) => {
    try {
      const response = await apiService.vehicles.searchVehicle(vehicleNumber)
      return response
    } catch (error) {
      console.error('❌ Search error:', error)
      throw error
    }
  }

  // Removed old fetchActiveStatusData - using enterprise solution above

  // Removed legacy fetchSectionData - using enterprise solution only

  // ENTERPRISE SOLUTION: Smart data loading with caching
  const [allStatusCounts, setAllStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0, 'in-transit': 0 })
  const [dataCache, setDataCache] = useState({})
  const [isPreFetching, setIsPreFetching] = useState(false)

  // ENTERPRISE SEARCH SYSTEM
  const [searchMode, setSearchMode] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  
  // Use external search query from SearchBar
  const searchQuery = externalSearchQuery || ''

  // Master data loading effect - loads both active data and all counts in one go
  useEffect(() => {
    const loadData = async () => {
      const cacheKey = `${selectedPlant}-${activeStatus}-${currentPage}`
      console.log('🚀 Loading data for plant:', selectedPlant, 'status:', activeStatus, 'page:', currentPage)
      console.log(`🔍 Active status type check: "${activeStatus}"`)
      console.log(`🔍 Is In Transit: ${activeStatus === 'in-transit'}`)
      
      // Check cache first for instant loading
      if (dataCache[cacheKey]) {
        console.log('✨ Loading from cache:', cacheKey)
        const cachedData = dataCache[cacheKey]
        
        // Update UI instantly from cache
        const vehicles = cachedData.vehicles || []
        switch (activeStatus) {
        case 'pending':
          setPendingVehicles(vehicles)
          break
        case 'approved':
          setApprovedVehicles(vehicles)
          break
        case 'rejected':
          setRejectedVehicles(vehicles)
          break
        case 'in-transit':
          setInTransitVehicles(vehicles)
          break
      }
        
        setTotalCount(cachedData.totalVehicles)
        setTotalPages(cachedData.totalPages)
        return
      }
      
      try {
        // 1. Load active status data for display (16 cards)
        const activeData = await fetchVehicles(selectedPlant, activeStatus, currentPage, 16)
        
        // 2. Load counts for all statuses (for SearchBar) - only on plant/status change, not page change
        let pendingCount, approvedCount, rejectedCount
        
        if (currentPage === 1) {
          // Only fetch counts on first page or when plant/status changes
          const countsPromises = [
            fetchVehicles(selectedPlant, 'pending', 1, 1),
            fetchVehicles(selectedPlant, 'approved', 1, 1), 
            fetchVehicles(selectedPlant, 'rejected', 1, 1)
          ]
          
          const [activeResponse, ...countResponses] = await Promise.all([
            Promise.resolve(activeData),
            ...countsPromises
          ])
          
          ;[pendingCount, approvedCount, rejectedCount] = countResponses
        } else {
          // On page navigation, just use the active data and keep existing counts
          pendingCount = { pagination: { totalVehicles: allStatusCounts.pending } }
          approvedCount = { pagination: { totalVehicles: allStatusCounts.approved } }
          rejectedCount = { pagination: { totalVehicles: allStatusCounts.rejected } }
        }
        
        // 3. Update active status vehicles
        const vehicles = activeData.vehicles || []
        console.log(`🚗 Setting ${activeStatus} vehicles:`, vehicles.length, 'vehicles')
        
        switch (activeStatus) {
        case 'pending':
          setPendingVehicles(vehicles)
          break
        case 'approved':
          setApprovedVehicles(vehicles)
          break
        case 'rejected':
          setRejectedVehicles(vehicles)
          break
        case 'in-transit':
          console.log('🚛 Setting In Transit vehicles:', vehicles)
          setInTransitVehicles(vehicles)
          break
      }
        
        // 4. Update pagination from active status response
        const totalVehicles = activeData.pagination?.totalVehicles || activeData.totalCount || vehicles.length
        const totalPages = activeData.pagination?.totalPages || Math.ceil(totalVehicles / 16)
        
        setTotalCount(totalVehicles)
        setTotalPages(totalPages)
        setCurrentPage(currentPage)
        
        // 5. Update all counts for SearchBar
        const newCounts = {
          pending: pendingCount.pagination?.totalVehicles || pendingCount.totalCount || 0,
          approved: approvedCount.pagination?.totalVehicles || approvedCount.totalCount || 0,
          rejected: rejectedCount.pagination?.totalVehicles || rejectedCount.totalCount || 0
        }
        
        setAllStatusCounts(newCounts)
        
        if (onVehicleCountsUpdate) {
          onVehicleCountsUpdate(newCounts)
        }
        
        // Cache the data for instant future access
        const cacheData = {
          vehicles,
          totalVehicles,
          totalPages,
          timestamp: Date.now()
        }
        setDataCache(prev => ({
          ...prev,
          [cacheKey]: cacheData
        }))
        
        // Pre-fetch next page for smoother navigation
        if (currentPage < totalPages && !isPreFetching) {
          setIsPreFetching(true)
          setTimeout(async () => {
            try {
              const nextPageKey = `${selectedPlant}-${activeStatus}-${currentPage + 1}`
              if (!dataCache[nextPageKey]) {
                console.log('🔮 Pre-fetching next page:', currentPage + 1)
                const nextPageData = await fetchVehicles(selectedPlant, activeStatus, currentPage + 1, 16)
                setDataCache(prev => ({
                  ...prev,
                  [nextPageKey]: {
                    vehicles: nextPageData.vehicles || [],
                    totalVehicles: nextPageData.pagination?.totalVehicles || 0,
                    totalPages: nextPageData.pagination?.totalPages || 1,
                    timestamp: Date.now()
                  }
                }))
              }
            } catch (error) {
              console.log('Pre-fetch failed:', error)
            }
            setIsPreFetching(false)
          }, 1000) // Pre-fetch after 1 second
        }
        
        console.log('✅ Data loaded successfully:', {
          activeStatus,
          vehiclesOnPage: vehicles.length,
          totalVehicles,
          totalPages,
          currentPage,
          allCounts: newCounts,
          cached: !!dataCache[cacheKey],
          cacheSize: Object.keys(dataCache).length
        })
        
      } catch (error) {
        console.error('❌ Error loading data:', error)
        setError(prev => ({ ...prev, [activeStatus]: true }))
    } finally {
        setLoading(prev => ({ ...prev, [activeStatus]: false }))
    }
  }

    loadData()
  }, [selectedPlant, activeStatus, currentPage])

  // Reset to page 1 when plant or status changes
  useEffect(() => {
    if (currentPage !== 1) {
      console.log('🔄 Resetting to page 1 due to plant/status change')
      setCurrentPage(1)
    }
  }, [selectedPlant, activeStatus])

  // Cache cleanup to prevent memory leaks
  useEffect(() => {
    const cleanupCache = () => {
      const now = Date.now()
      const maxAge = 5 * 60 * 1000 // 5 minutes
      
      setDataCache(prev => {
        const cleaned = {}
        Object.keys(prev).forEach(key => {
          if (now - prev[key].timestamp < maxAge) {
            cleaned[key] = prev[key]
          }
        })
        
        const removedCount = Object.keys(prev).length - Object.keys(cleaned).length
        if (removedCount > 0) {
          console.log(`🧹 Cleaned ${removedCount} expired cache entries`)
        }
        
        return cleaned
      })
    }

    const interval = setInterval(cleanupCache, 60000) // Clean every minute
    return () => clearInterval(interval)
  }, [])

  // Helper functions for pagination
  const handleStatusChange = (newStatus) => {
    setActiveStatus(newStatus)
    setCurrentPage(1) // Reset to page 1 when changing status
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Enterprise Search Functions
  const handleSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      clearSearch()
      return
    }

    setSearchLoading(true)
    setSearchError(null)
    setSearchMode(true)

    try {
      const result = await searchVehicle(query.trim())
      setSearchResult(result)
      console.log('🎯 Search completed successfully')
    } catch (error) {
      setSearchError(error.message)
      setSearchResult(null)
      console.log('💥 Search failed:', error.message)
    } finally {
      setSearchLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchMode(false)
    setSearchResult(null)
    setSearchError(null)
    setSearchLoading(false)
    // Clear the search query in parent component
    if (onClearSearch) {
      onClearSearch()
    }
    console.log('🧹 Search cleared')
  }

  // Removed handleSearchInput - using external search from SearchBar

  // Auto-search when external search query changes
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 3) {
      handleSearch(searchQuery)
    } else if (searchQuery.length === 0 && searchMode) {
      // Only clear search mode, don't call clearSearch which would trigger parent updates
      setSearchMode(false)
      setSearchResult(null)
      setSearchError(null)
      setSearchLoading(false)
    }
  }, [searchQuery])

  // Auto-clear search when query becomes too short
  useEffect(() => {
    if (searchQuery.length > 0 && searchQuery.length < 3 && searchMode) {
      // Only clear search mode, don't trigger parent search clear
      setSearchMode(false)
      setSearchResult(null)
      setSearchError(null)
      setSearchLoading(false)
    }
  }, [searchQuery])

  // ESC key support for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchMode) {
        clearSearch()
      }
    }

    if (searchMode) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [searchMode])

  // Helper function to render attachments
  const renderAttachments = (attachments, documentType) => {
    if (!attachments || attachments.length === 0) {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-sm">No attachments available</p>
        </div>
      )
    }

    return (
      <div className="mt-3">
        <label className="text-gray-700 text-sm font-medium">Attachments</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {attachments.map((doc, index) => {
            const isImage = doc.mimeType?.startsWith('image/')
            const isPDF = doc.mimeType === 'application/pdf'
            
            return (
              <div key={index} className="border border-orange-200/30 rounded-lg p-3 bg-white/60 backdrop-blur-sm shadow-sm">
                {isImage ? (
                  <div className="space-y-2">
                    <img 
                      src={doc.url} 
                      alt={doc.fileName}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-orange-200/20"
                      onClick={() => window.open(doc.url, '_blank')}
                    />
                    <p className="text-gray-700 text-xs truncate font-medium">{doc.fileName}</p>
                  </div>
                ) : isPDF ? (
                  <div className="space-y-2">
                    <div className="w-full h-32 bg-red-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors border border-red-200"
                         onClick={() => window.open(doc.url, '_blank')}>
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-red-600 text-xs font-medium">PDF Document</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs truncate font-medium">{doc.fileName}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full h-32 bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200"
                         onClick={() => window.open(doc.url, '_blank')}>
                      <div className="text-center">
                        <DocumentIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-blue-600 text-xs font-medium">Document</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs truncate font-medium">{doc.fileName}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Helper function to check if vehicle approval is allowed
  const isVehicleApprovalAllowed = (vehicle) => {
    // If no driver assigned, don't allow vehicle approval
    if (!vehicle.assignedDriver) return false
    
    // If driver is not approved, don't allow vehicle approval
    if (vehicle.assignedDriver.approved_by_hq !== 'approved') return false
    
    // If checklist is not confirmed, don't allow vehicle approval
    if (!vehicle.checklistConfirmed) return false
    
    // If driver is not confirmed, don't allow vehicle approval
    if (!vehicle.driverConfirmed) return false
    
    // All conditions met - allow vehicle approval
    return true
  }

  // Helper function to get driver icon colors based on approval status
  const getDriverIconColor = (vehicle) => {
    if (!vehicle.assignedDriver) {
      return {
        icon: 'text-gray-400',
        background: 'bg-gray-500/20'
      }
    }
    
    switch (vehicle.assignedDriver.approved_by_hq) {
      case 'approved':
        return {
          icon: 'text-green-400',
          background: 'bg-green-500/20'
        }
      case 'rejected':
        return {
          icon: 'text-red-400',
          background: 'bg-red-500/20'
        }
      case 'pending':
      default:
        return {
          icon: 'text-yellow-400',
          background: 'bg-yellow-500/20'
        }
    }
  }

  // Helper function to get driver status text
  const getDriverStatusText = (vehicle) => {
    if (!vehicle.assignedDriver) {
      return 'Not Available'
    }
    
    switch (vehicle.assignedDriver.approved_by_hq) {
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'pending':
      default:
        return 'Pending'
    }
  }

  // Helper function to get approval button state
  const getApprovalButtonState = (vehicle, section) => {
    if (section === 'vehicle') {
      return {
        disabled: !isVehicleApprovalAllowed(vehicle),
        message: !isVehicleApprovalAllowed(vehicle) 
          ? (vehicle.assignedDriver ? 'Driver must be approved first' : 'No driver assigned')
          : 'Approve Vehicle Details'
      }
    }
    return {
      disabled: false,
      message: section === 'driver' ? 'Approve Driver Details' : 'Approve'
    }
  }

  // Helper function to get status background color
  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-200'
      case 'approved':
        return 'bg-green-500/20 text-green-200'
      case 'rejected':
        return 'bg-red-500/20 text-red-200'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  // Helper function to render a single card
  const renderCard = (vehicle, index, sectionType) => (
    <motion.div key={vehicle._id || `${sectionType}-${index}`}
      className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-4 cursor-pointer overflow-hidden border border-orange-200/30 shadow-lg hover:shadow-xl"
      whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Enhanced Texture Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-transparent to-green-50/40 opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 via-transparent to-purple-50/20 opacity-40"></div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
              <h3 className="text-lg font-bold text-gray-900">{vehicle.custrecord_vehicle_number}</h3>
            </div>
            <p className="text-xs text-gray-600 flex items-center gap-1.5">
              <span className="w-0.5 h-0.5 rounded-full bg-gray-400"></span>
              {vehicle.custrecord_vehicle_type_ag} • {vehicle.currentPlant}
            </p>
          </div>
          
          {/* Compact Status Badge */}
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
            sectionType === 'pending' ? 'bg-orange-100 text-orange-800 border border-orange-300 shadow-orange-100' :
            sectionType === 'approved' ? 'bg-green-100 text-green-800 border border-green-300 shadow-green-100' :
            sectionType === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300 shadow-red-100' :
            sectionType === 'in-transit' ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-blue-100' :
            'bg-red-100 text-red-800 border border-red-300 shadow-red-100'
          }`}>
            <div className="flex items-center gap-1">
              <div className={`w-1 h-1 rounded-full ${
                sectionType === 'pending' ? 'bg-orange-500' :
                sectionType === 'approved' ? 'bg-green-500' :
                sectionType === 'rejected' ? 'bg-red-500' :
                sectionType === 'in-transit' ? 'bg-blue-500' :
                'bg-red-500'
              }`}></div>
            {sectionType === 'in-transit' ? 'In Transit' : (vehicle.approved_by_hq || sectionType)}
            </div>
          </div>
        </div>

        {/* Compact Sub-Cards Grid */}
        <div className="grid grid-cols-1 gap-3 flex-1">
          {/* Vehicle Details Sub-Card */}
          <motion.div
            className={`relative p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-blue-200/30 cursor-pointer shadow-sm ${
              vehicle.custrecord_vehicle_number ? 'hover:bg-white hover:shadow-md hover:border-blue-300' : 'bg-gray-100/50'
            }`}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
            }}
            onClick={() => {
              setActiveVehicle(vehicle._id || `${sectionType}-${index}`)
              setActiveSection('vehicle')
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 shadow-sm">
                <div className="text-blue-600">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 font-semibold text-sm mb-0.5">Vehicle Details</h4>
                <p className="text-gray-600 text-xs">{vehicle.custrecord_vehicle_number}</p>
              </div>
              <div className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">Available</div>
            </div>
          </motion.div>

          {/* Driver Details Sub-Card */}
          <motion.div
            className={`relative p-3 rounded-xl bg-white/90 backdrop-blur-sm border cursor-pointer shadow-sm ${
              vehicle.assignedDriver ? 'hover:bg-white hover:shadow-md' : 'bg-gray-100/50'
            } ${
              (() => {
                const driverStatus = getDriverStatusText(vehicle)
                const isApproved = driverStatus === 'Approved'
                const isRejected = driverStatus === 'Rejected'
                const isPending = driverStatus === 'Pending'
                
                return isApproved ? 'border-green-200/30 hover:border-green-300' :
                       isRejected ? 'border-red-200/30 hover:border-red-300' :
                       isPending ? 'border-orange-200/30 hover:border-orange-300' :
                       'border-gray-200/30'
              })()
            }`}
            whileHover={vehicle.assignedDriver ? { 
              scale: 1.02,
              boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
            } : {}}
            onClick={() => {
              if (vehicle.assignedDriver) {
                setActiveVehicle(vehicle._id || `${sectionType}-${index}`)
                setActiveSection('driver')
              }
            }}
          >
            <div className="flex items-center gap-2.5">
              {(() => {
                const driverStatus = getDriverStatusText(vehicle)
                const isApproved = driverStatus === 'Approved'
                const isRejected = driverStatus === 'Rejected'
                const isPending = driverStatus === 'Pending'
                
                return (
                  <>
                    <div className={`p-2 rounded-xl shadow-sm ${
                      isApproved ? 'bg-green-500/20' :
                      isRejected ? 'bg-red-500/20' :
                      isPending ? 'bg-orange-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      <div className={`${
                        isApproved ? 'text-green-600' :
                        isRejected ? 'text-red-600' :
                        isPending ? 'text-orange-600' :
                        'text-gray-400'
                      }`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-semibold text-sm mb-0.5">Driver Details</h4>
                      <p className="text-gray-600 text-xs">
                        {vehicle.assignedDriver ? vehicle.assignedDriver.custrecord_driver_name : 'No Driver Available'}
                      </p>
                    </div>
                    <div className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                      isApproved ? 'bg-green-50 text-green-700 border border-green-200' :
                      isRejected ? 'bg-red-50 text-red-700 border border-red-200' :
                      isPending ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {driverStatus}
                    </div>
                  </>
                )
              })()}
            </div>
          </motion.div>

          {/* Checklist Sub-Card */}
          <motion.div
            className={`relative p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-purple-200/30 cursor-pointer shadow-sm ${
              vehicle.checklist && vehicle.checklist.checklistItems ? 'hover:bg-white hover:shadow-md hover:border-purple-300' : 'bg-gray-100/50'
            }`}
            whileHover={vehicle.checklist && vehicle.checklist.checklistItems ? { 
              scale: 1.02,
              boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
            } : {}}
            onClick={() => {
              if (vehicle.checklist && vehicle.checklist.checklistItems) {
                setActiveVehicle(vehicle._id || `${sectionType}-${index}`)
                setActiveSection('checklist')
              }
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl shadow-sm ${
                vehicle.checklist && vehicle.checklist.checklistItems ? 'bg-purple-500/20' : 'bg-gray-500/20'
              }`}>
                <div className={vehicle.checklist && vehicle.checklist.checklistItems ? 'text-purple-600' : 'text-gray-400'}>
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-gray-900 font-semibold text-sm mb-0.5">Checklist</h4>
                <p className="text-gray-600 text-xs">
                  {vehicle.checklist && vehicle.checklist.checklistItems ? 'Checklist Completed' : 'No Checklist Done'}
                </p>
              </div>
              <div className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                vehicle.checklist && vehicle.checklist.checklistItems ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {vehicle.checklist && vehicle.checklist.checklistItems ? 'Available' : 'Not Available'}
              </div>
            </div>
          </motion.div>
          
          {/* Trip Completed Button - Only for In Transit */}
          {sectionType === 'in-transit' && (
            <motion.button
              className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-sm shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2 border-2 border-green-500/20"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation()
                handleTripCompleted(vehicle)
              }}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Trip Completed</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )

  // Helper function to render a section with enterprise animations
  const renderSection = (title, vehicles, modalState, setModalState, sectionType) => {
    const isLoading = loading[sectionType]
    const hasError = error[sectionType]
    
    return (
      <div className="w-full mb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Enterprise Section Header */}
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-3">
              {/* Section Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                sectionType === 'pending' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                sectionType === 'approved' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                {sectionType === 'pending' && (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {sectionType === 'approved' && (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {sectionType === 'rejected' && (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              {/* Section Title and Info */}
              <div className="flex items-center space-x-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                  <p className={`text-xs font-medium ${
                    sectionType === 'pending' ? 'text-orange-600' :
                    sectionType === 'approved' ? 'text-green-600' :
                    sectionType === 'rejected' ? 'text-red-600' :
                    sectionType === 'in-transit' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                                      {sectionType === 'pending' ? 'Awaiting approval' :
                   sectionType === 'approved' ? 'Successfully approved' :
                   sectionType === 'rejected' ? 'Rejected vehicles' :
                   sectionType === 'in-transit' ? 'Vehicles currently in transit' :
                   'Rejected vehicles'}
                  </p>
                </div>
                
                {/* Item Count Badge */}
                <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  sectionType === 'pending' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                  sectionType === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                  sectionType === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                  sectionType === 'in-transit' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {vehicles.length} {vehicles.length === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
            
            {/* Removed View All button - using pagination instead */}
          </motion.div>

          {/* Enterprise Loading State - Skeleton Cards */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(16)].map((_, index) => (
                <motion.div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-orange-200/30 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  {/* Vehicle Info Skeleton */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gradient-to-r from-orange-200 to-orange-300 rounded-lg mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 animate-pulse"></div>
                    </div>
          </div>

                  {/* Content Skeleton */}
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5 animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/5 animate-pulse"></div>
                  </div>

                  {/* Status Badge Skeleton */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="h-6 w-20 bg-gradient-to-r from-orange-200 to-orange-300 rounded-full animate-pulse"></div>
                    <div className="h-8 w-24 bg-gradient-to-r from-orange-200 to-orange-300 rounded-lg animate-pulse"></div>
                  </div>

                  {/* Driver Section Skeleton */}
                  <div className="mt-4 pt-4 border-t border-orange-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 animate-pulse"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="text-center py-8">
              <div className="text-red-400 mb-2">Failed to load {sectionType} vehicles</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 hover:bg-red-500/30"
              >
                Retry
              </button>
            </div>
          )}

                    {/* Enterprise Cards Grid with Smooth Transitions */}
          {!isLoading && !hasError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {vehicles.length === 0 ? (
                <motion.div 
                  className="w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderEmptyStateCard(title, sectionType)}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {vehicles.map((vehicle, index) => (
                    <motion.div
                      key={vehicle._id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.05, 
                        duration: 0.4,
                        type: "spring",
                        stiffness: 100
                      }}
                    >
                      {renderCard(vehicle, index, sectionType)}
                    </motion.div>
                  ))}
            </div>
              )}
            </motion.div>
          )}

          {/* View All Modal */}
          <AnimatePresence>
            {modalState && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                  onClick={() => setModalState(false)}
                />
                <motion.div
                  className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-[95vw] w-full max-h-[90vh] overflow-hidden border border-orange-200/30 shadow-2xl"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  {/* Enhanced Texture Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-transparent to-green-50/40 opacity-60"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 via-transparent to-purple-50/20 opacity-30"></div>
                  
                  {/* Modal Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Enhanced Modal Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                          sectionType === 'pending' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                          sectionType === 'approved' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                          'bg-gradient-to-br from-red-500 to-red-600'
                        }`}>
                          {sectionType === 'pending' && (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {sectionType === 'approved' && (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {sectionType === 'rejected' && (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-gray-900">{title} - All Vehicles</h3>
                          <p className={`text-sm font-medium ${
                            sectionType === 'pending' ? 'text-orange-600' :
                            sectionType === 'approved' ? 'text-green-600' :
                            'text-red-600'
                          }`}>
                            {vehicles.filter(vehicle => 
                              vehicle.custrecord_vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase())
                            ).length} of {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} found
                          </p>
                        </div>
                      </div>
                    <button
                        onClick={() => {
                          setModalState(false)
                          setSearchTerm('') // Clear search when modal closes
                        }}
                        className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-orange-200/30 hover:bg-white hover:shadow-lg transition-all shadow-sm"
                      >
                        <XCircle className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                    {/* Enhanced Search Box */}
                    <div className="mb-8">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search by vehicle number..."
                          value={searchTerm}
                          className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-orange-200/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
                          onChange={(e) => {
                            setSearchTerm(e.target.value)
                          }}
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 overflow-y-auto max-h-[65vh] pr-2">
                      {vehicles
                        .filter(vehicle => 
                          vehicle.custrecord_vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((vehicle, index) => 
                      renderCard(vehicle, index, sectionType)
                    )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Helper function to render empty state card
  const renderEmptyStateCard = (title, sectionType) => {
    const getEmptyStateData = () => {
      switch (sectionType) {
        case 'pending':
          return {
            icon: <Clock className="w-6 h-6" />,
            message: "All caught up!",
            subtitle: "No pending approvals at the moment",
            color: "orange",
            gradient: "from-orange-50/40 via-transparent to-orange-50/20"
          }
        case 'approved':
          return {
            icon: <CheckCircle className="w-6 h-6" />,
            message: "No approved items",
            subtitle: "Approved items will appear here",
            color: "green",
            gradient: "from-green-50/40 via-transparent to-green-50/20"
          }
        case 'rejected':
          return {
            icon: <XCircle className="w-6 h-6" />,
            message: "No rejected items",
            subtitle: "Rejected items will appear here",
            color: "red",
            gradient: "from-red-50/40 via-transparent to-red-50/20"
          }
        default:
          return {
            icon: <FileText className="w-6 h-6" />,
            message: "No items",
            subtitle: "Items will appear here",
            color: "gray",
            gradient: "from-gray-50/40 via-transparent to-gray-50/20"
          }
      }
    }

    const emptyData = getEmptyStateData()
    const colorClasses = {
      orange: "bg-orange-500/20 text-orange-600 border border-orange-200/30",
      green: "bg-green-500/20 text-green-600 border border-green-200/30", 
      red: "bg-red-500/20 text-red-600 border border-red-200/30",
      gray: "bg-gray-500/20 text-gray-600 border border-gray-200/30"
    }

    return (
      <motion.div
        className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer overflow-hidden border shadow-lg hover:shadow-xl w-full"
        style={{ 
          borderColor: sectionType === 'pending' ? 'rgba(251, 146, 60, 0.3)' :
                      sectionType === 'approved' ? 'rgba(34, 197, 94, 0.3)' :
                      sectionType === 'rejected' ? 'rgba(239, 68, 68, 0.3)' :
                      'rgba(156, 163, 175, 0.3)'
        }}
        whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Enhanced Texture Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${emptyData.gradient} opacity-60`}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/10 via-transparent to-purple-50/10 opacity-30"></div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
          {/* Enhanced Icon */}
          <div className={`p-4 rounded-xl ${colorClasses[emptyData.color]} shadow-sm mb-6`}>
            <div className="flex items-center justify-center">
              {emptyData.icon}
            </div>
          </div>
          
          {/* Enhanced Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{emptyData.message}</h3>
            <p className="text-gray-600 text-sm">{emptyData.subtitle}</p>
          </div>
          
          {/* Subtle Animation */}
          <motion.div 
            className="mt-6 w-16 h-1 rounded-full bg-gradient-to-r from-orange-400 to-green-400"
            animate={{ 
              scaleX: [0.8, 1, 0.8],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDocumentStatus = (endDate) => {
    if (!endDate) return 'pending'
    const today = new Date()
    const end = new Date(endDate)
    if (end < today) return 'expired'
    if (end < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) return 'expiring'
    return 'valid'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'text-emerald-400'
      case 'expired': return 'text-red-400'
      case 'expiring': return 'text-yellow-400'
      case 'pending': return 'text-amber-400'
      default: return 'text-slate-400'
    }
  }

  // Driver Approval API Function
  const callDriverApprovalAPI = async (driverId, action, reviewMessage) => {
    try {
      console.log(`Calling driver approval API for driver: ${driverId}, action: ${action}`)
      
      const requestBody = {
        approved_by_hq: action, // "approved" or "rejected"
        approvalMeta: {
          reviewer: "hq.admin",
          reviewedAt: new Date().toISOString(),
          reviewMessage: reviewMessage || ""
        }
      }
      
      const response = await fetch(`http://13.200.229.29:5000/vms/driver-master/approval/${driverId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Driver approval API response:', data)
      
      return { success: true, data }
    } catch (error) {
      console.error('Driver approval API error:', error)
      return { success: false, error: error.message }
    }
  }

  // Vehicle Approval API Function
  const callVehicleApprovalAPI = async (vehicleId, action, reviewMessage) => {
    try {
      console.log(`Calling vehicle approval API for vehicle: ${vehicleId}, action: ${action}`)
      
      const requestBody = {
        approved_by_hq: action, // "approved" or "rejected"
        approvalMeta: {
          reviewer: "hq.admin",
          reviewedAt: new Date().toISOString(),
          reviewMessage: reviewMessage || ""
        }
      }
      
      const response = await fetch(`http://13.200.229.29:5000/vms/vehicle-master/approval/${vehicleId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Vehicle approval API response:', data)
      
      return { success: true, data }
    } catch (error) {
      console.error('Vehicle approval API error:', error)
      return { success: false, error: error.message }
    }
  }

  // Custom confirmation modal component
  const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message, action }) => {
    if (!isOpen) return null

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          className="relative bg-slate-900/95 rounded-3xl p-6 max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 mb-6">{message}</p>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 font-medium rounded-xl transition-colors ${
                  action === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {action === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Update local state with API response data
  const updateLocalDriverStatusWithResponse = (vehicleId, apiResponse) => {
    console.log(`Updating local state with API response: Vehicle ${vehicleId}`)
    
    if (!apiResponse.driver) {
      console.error('No driver data in API response')
      return
    }
    
    const updatedDriver = apiResponse.driver
    
    // Update in all arrays where the vehicle might exist
    const updateArray = (vehicles, setVehicles) => {
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle._id === vehicleId || vehicle.custrecord_vehicle_number === vehicleId) {
          return {
            ...vehicle,
            assignedDriver: vehicle.assignedDriver ? {
              ...vehicle.assignedDriver,
              ...updatedDriver // Use complete API response data
            } : updatedDriver
          }
        }
        return vehicle
      }))
    }
    
    // Update all three arrays
    updateArray(pendingVehicles, setPendingVehicles)
    updateArray(approvedVehicles, setApprovedVehicles)
    updateArray(rejectedVehicles, setRejectedVehicles)
    
    console.log('Local state updated with API response data')
  }

  // Update local state immediately after driver approval
  const updateLocalDriverStatus = (vehicleId, driverId, newStatus) => {
    console.log(`Updating local state: Vehicle ${vehicleId}, Driver ${driverId}, Status ${newStatus}`)
    
    // Update in all arrays where the vehicle might exist
    const updateArray = (vehicles, setVehicles) => {
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle._id === vehicleId || vehicle.custrecord_vehicle_number === vehicleId) {
          return {
            ...vehicle,
            assignedDriver: vehicle.assignedDriver ? {
              ...vehicle.assignedDriver,
              approved_by_hq: newStatus
            } : null
          }
        }
        return vehicle
      }))
    }
    
    // Update all three arrays
    updateArray(pendingVehicles, setPendingVehicles)
    updateArray(approvedVehicles, setApprovedVehicles)
    updateArray(rejectedVehicles, setRejectedVehicles)
    
    console.log('Local state updated successfully')
  }

  // Handle confirmation modal actions
  const handleConfirmationConfirm = async () => {
    if (!confirmationData) return
    
    const { vehicleId, section, action, driverName } = confirmationData
    
    // Find the vehicle
    const vehicle = [...pendingVehicles, ...approvedVehicles, ...rejectedVehicles]
      .find(v => v._id === vehicleId || v.custrecord_vehicle_number === vehicleId)
    
    if (!vehicle || !vehicle.assignedDriver) return
    
    // Close confirmation modal
    setShowConfirmationModal(false)
    setConfirmationData(null)
    
    // Call API based on section
    let result
    if (section === 'driver') {
      result = await callDriverApprovalAPI(
        vehicle.assignedDriver._id, 
        action, 
        reviewMessage
      )
    } else if (section === 'vehicle') {
      result = await callVehicleApprovalAPI(
        vehicleId, 
        action, 
        reviewMessage
      )
    }
    
    if (result.success) {
      // Update local state with API response data
      if (section === 'driver') {
        updateLocalDriverStatusWithResponse(vehicleId, result.data)
        updateDriverApprovalStatus(vehicle.assignedDriver._id, action)
        showToast(`Driver ${driverName} ${action} successfully!`, 'success')
      } else if (section === 'vehicle') {
        updateLocalVehicleStatusWithResponse(vehicleId, result.data)
        showToast(`Vehicle ${confirmationData.vehicleName} ${action} successfully!`, 'success')
      }
      
      // Clear modal first
      setActiveSection(null)
      setActiveVehicle(null)
      setReviewMessage('')
    } else {
      // Show error toast
      const sectionName = section === 'driver' ? 'driver' : 'vehicle'
      showToast(`Failed to ${action} ${sectionName}: ${result.error}`, 'error')
    }
  }

  const handleConfirmationCancel = () => {
    setShowConfirmationModal(false)
    setConfirmationData(null)
  }

  // Enhanced handleApprovalAction with custom confirmation
  const handleApprovalAction = async (vehicleId, section, action) => {
    // Find the vehicle
    const vehicle = [...pendingVehicles, ...approvedVehicles, ...rejectedVehicles]
      .find(v => v._id === vehicleId || v.custrecord_vehicle_number === vehicleId)
    
    if (!vehicle) {
      console.error('Vehicle not found for approval action')
      return
    }

    // Handle driver approval/rejection
    if (section === 'driver' && vehicle.assignedDriver) {
      // Show custom confirmation modal
      setConfirmationData({
        vehicleId,
        section,
        action,
        driverName: vehicle.assignedDriver.custrecord_driver_name
      })
      setShowConfirmationModal(true)
      return
    }

    // Handle vehicle approval/rejection
    if (section === 'vehicle') {
      // Check if vehicle approval is allowed
      if (!isVehicleApprovalAllowed(vehicle)) {
        let message = ''
        
        if (!vehicle.assignedDriver) {
          message = 'Driver not assigned - cannot approve vehicle'
        } else if (vehicle.assignedDriver.approved_by_hq !== 'approved') {
          const status = vehicle.assignedDriver.approved_by_hq
          message = status === 'rejected' ? 'Driver rejected - cannot approve vehicle' : 'Driver must be approved first'
        } else if (!vehicle.checklistConfirmed) {
          message = 'Checklist must be confirmed by Plant user before vehicle can be approved'
        } else if (!vehicle.driverConfirmed) {
          message = 'Driver details must be confirmed by Plant user before vehicle can be approved'
        } else {
          message = 'Vehicle approval blocked'
        }
        
        showToast(message, 'error')
        return
      }
      
      // Show custom confirmation modal for vehicle
      setConfirmationData({
        vehicleId,
        section,
        action,
        vehicleName: vehicle.custrecord_vehicle_number
      })
      setShowConfirmationModal(true)
      return
    }
  }

  // Force refresh data after driver approval
  const forceRefreshData = async () => {
    console.log('Force refreshing all data...')
    
    // Clear existing data first
    setPendingVehicles([])
    setApprovedVehicles([])
    setRejectedVehicles([])
    
    // Force fresh API calls
    try {
      await Promise.all([
        fetchSectionData('pending', selectedPlant),
        fetchSectionData('approved', selectedPlant),
        fetchSectionData('rejected', selectedPlant)
      ])
      console.log('Data refresh completed')
    } catch (error) {
      console.error('Error during force refresh:', error)
    }
  }

  // Update local state with vehicle API response data
  const updateLocalVehicleStatusWithResponse = (vehicleId, apiResponse) => {
    console.log(`Updating local vehicle state with API response: Vehicle ${vehicleId}`)
    
    if (!apiResponse.vehicle) {
      console.error('No vehicle data in API response')
      return
    }
    
    const updatedVehicle = apiResponse.vehicle
    
    // Find the vehicle in current arrays
    const findVehicle = (vehicles) => {
      return vehicles.find(v => v._id === vehicleId || v.custrecord_vehicle_number === vehicleId)
    }
    
    // Remove vehicle from all arrays first
    const removeFromArray = (vehicles, setVehicles) => {
      setVehicles(prev => prev.filter(vehicle => 
        vehicle._id !== vehicleId && vehicle.custrecord_vehicle_number !== vehicleId
      ))
    }
    
    // Remove from all arrays
    removeFromArray(pendingVehicles, setPendingVehicles)
    removeFromArray(approvedVehicles, setApprovedVehicles)
    removeFromArray(rejectedVehicles, setRejectedVehicles)
    
    // Add to correct array based on new status
    const newStatus = updatedVehicle.approved_by_hq
    console.log(`Moving vehicle to ${newStatus} section`)
    
    switch (newStatus) {
      case 'approved':
        setApprovedVehicles(prev => [...prev, updatedVehicle])
        break
      case 'rejected':
        setRejectedVehicles(prev => [...prev, updatedVehicle])
        break
      default:
        setPendingVehicles(prev => [...prev, updatedVehicle])
        break
    }
    
    console.log('Local vehicle state updated and moved to correct section')
  }

  // Helper function to get vehicle approval warning message
  const getVehicleApprovalWarning = (vehicle) => {
    // Check all requirements
    if (!vehicle.assignedDriver) {
      return "Driver not assigned"
    }
    
    if (vehicle.assignedDriver.approved_by_hq !== 'approved') {
      const status = vehicle.assignedDriver.approved_by_hq
      return status === 'rejected' ? 'Driver rejected' : 'Driver must be approved'
    }
    
    if (!vehicle.checklistConfirmed) {
      return "Checklist must be confirmed by Plant user"
    }
    
    if (!vehicle.driverConfirmed) {
      return "Driver details must be confirmed by Plant user"
    }
    
    return null // No warning when all conditions are met
  }

  // Helper function to get vehicle approval button state
  const getVehicleApprovalButtonState = (vehicle) => {
    const isAllowed = isVehicleApprovalAllowed(vehicle)
    
    if (!isAllowed) {
      // Provide specific messages based on what's missing
      if (!vehicle.assignedDriver) {
        return {
          disabled: true,
          message: 'Assign Driver'
        }
      }
      
      if (vehicle.assignedDriver.approved_by_hq !== 'approved') {
        const status = vehicle.assignedDriver.approved_by_hq
        return {
          disabled: true,
          message: status === 'rejected' ? 'Driver Rejected' : 'Approve Driver'
        }
      }
      
      if (!vehicle.checklistConfirmed) {
        return {
          disabled: true,
          message: 'Confirm Checklist'
        }
      }
      
      if (!vehicle.driverConfirmed) {
        return {
          disabled: true,
          message: 'Confirm Driver'
        }
      }
    }
    
    return {
      disabled: !isAllowed,
      message: isAllowed ? 'Approve Vehicle Details' : 'Vehicle approval blocked'
    }
  }

  // Compact approval requirements component
  const ApprovalRequirements = ({ vehicle }) => {
    const requirements = [
      {
        id: 'driver_assignment',
        title: 'Driver Assignment',
        status: !vehicle.assignedDriver ? 'pending' : 'completed',
        message: !vehicle.assignedDriver ? 'Driver not assigned' : 'Driver assigned',
        action: !vehicle.assignedDriver ? 'Plant user must assign driver' : '✅ Complete'
      },
      {
        id: 'driver_approval',
        title: 'Driver Approval',
        status: !vehicle.assignedDriver || vehicle.assignedDriver.approved_by_hq !== 'approved' ? 'pending' : 'completed',
        message: !vehicle.assignedDriver ? 'Driver not assigned' : 
                 vehicle.assignedDriver.approved_by_hq === 'rejected' ? 'Driver rejected' :
                 vehicle.assignedDriver.approved_by_hq === 'pending' ? 'Driver pending approval' : 'Driver approved',
        action: !vehicle.assignedDriver ? 'Assign driver first' : 
                vehicle.assignedDriver.approved_by_hq !== 'approved' ? 'HQ user must approve driver' : '✅ Complete'
      },
      {
        id: 'checklist_confirmation',
        title: 'Checklist Confirmation',
        status: !vehicle.checklistConfirmed ? 'pending' : 'completed',
        message: !vehicle.checklistConfirmed ? 'Checklist not confirmed' : 'Checklist confirmed',
        action: !vehicle.checklistConfirmed ? 'Plant user must confirm checklist' : '✅ Complete'
      },
      {
        id: 'driver_confirmation',
        title: 'Driver Confirmation',
        status: !vehicle.driverConfirmed ? 'pending' : 'completed',
        message: !vehicle.driverConfirmed ? 'Driver details not confirmed' : 'Driver details confirmed',
        action: !vehicle.driverConfirmed ? 'Plant user must confirm driver details' : '✅ Complete'
      }
    ]
    
    const pendingRequirements = requirements.filter(req => req.status === 'pending')
    const completedRequirements = requirements.filter(req => req.status === 'completed')
    
    // Only show if there are pending requirements
    if (pendingRequirements.length === 0) {
      return null
    }
    
    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/30 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
          <h4 className="text-sm font-semibold text-orange-800">Approval Requirements</h4>
          <div className="ml-auto text-xs text-orange-600 font-medium">
            {completedRequirements.length}/{requirements.length} Complete
          </div>
        </div>
        
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div key={req.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              req.status === 'pending' 
                ? 'bg-orange-100/50 border border-orange-200/50' 
                : 'bg-green-100/50 border border-green-200/50'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                req.status === 'pending' 
                  ? 'bg-orange-100 border border-orange-300' 
                  : 'bg-green-100 border border-green-300'
              }`}>
                {req.status === 'pending' ? (
                  <span className="text-orange-600 text-xs font-bold">{index + 1}</span>
                ) : (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${
                  req.status === 'pending' ? 'text-orange-800' : 'text-green-800'
                }`}>
                  {req.title}
                </div>
                <div className={`text-xs mt-0.5 ${
                  req.status === 'pending' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {req.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Helper function to get data for active status
  const getActiveStatusData = () => {
    switch (activeStatus) {
      case 'pending':
        return {
          title: 'PENDING',
          vehicles: pendingVehicles,
          modalState: showPendingModal,
          setModalState: setShowPendingModal
        }
      case 'approved':
        return {
          title: 'APPROVED',
          vehicles: approvedVehicles,
          modalState: showApprovedModal,
          setModalState: setShowApprovedModal
        }
      case 'rejected':
        return {
          title: 'REJECTED',
          vehicles: rejectedVehicles,
          modalState: showRejectedModal,
          setModalState: setShowRejectedModal
        }
      case 'in-transit':
        return {
          title: 'IN TRANSIT',
          vehicles: inTransitVehicles,
          modalState: showApprovedModal, // Reuse approved modal for now
          setModalState: setShowApprovedModal
        }
      default:
        return {
          title: 'PENDING',
          vehicles: pendingVehicles,
          modalState: showPendingModal,
          setModalState: setShowPendingModal
        }
    }
  }

  const activeStatusData = getActiveStatusData()

  return (
    <div className="min-h-screen relative">

      {/* Search Overlay */}
      <AnimatePresence>
        {searchMode && (
          <motion.div
            className="absolute inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background Blur */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={clearSearch} />
            
            {/* Search Results Container */}
            <div className="relative z-50 max-w-5xl mx-auto px-4 pt-12">
              {searchLoading && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lg font-semibold text-gray-700">Searching for {searchQuery}...</p>
                </motion.div>
              )}
              
              {searchError && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
      </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Vehicle Not Found</h3>
                  <p className="text-gray-600 mb-4">{searchError}</p>
                  <motion.button
                    onClick={clearSearch}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Back to Browse
                  </motion.button>
                </motion.div>
              )}
              
              {searchResult && (
                <motion.div
                  className="max-w-lg mx-auto"
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 25, stiffness: 400 }}
                >
                  {/* Search Result Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-xl mb-4"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <Car className="w-7 h-7" />
                      <span className="font-bold text-xl">🎯 Vehicle Found</span>
                    </motion.div>
                    
                    <motion.button
                      onClick={clearSearch}
                      className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-orange-600 transition-colors rounded-xl hover:bg-orange-50 border border-gray-200 hover:border-orange-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Close Search</span>
                    </motion.button>
                  </div>

                  {/* Enhanced Existing Card Component */}
                  <motion.div 
                    className="transform scale-105 shadow-2xl ring-4 ring-orange-200/50"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1.05 }}
                    transition={{ delay: 0.3, type: "spring", damping: 20 }}
                    whileHover={{ scale: 1.08 }}
                  >
                    {renderCard(searchResult, 0, 'search')}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Status Section - Blurred when searching */}
      <motion.div 
        className="mb-12"
        animate={{ 
          opacity: searchMode ? 0.3 : 1,
          filter: searchMode ? 'blur(4px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3 }}
      >
        {renderSection(
          activeStatusData.title, 
          activeStatusData.vehicles, 
          activeStatusData.modalState, 
          activeStatusData.setModalState, 
          activeStatus
        )}
      </motion.div>

      {/* Enterprise Pagination Controls */}
      {totalPages > 1 && !searchMode && (
        <motion.div 
          className="flex flex-col items-center space-y-4 mt-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {/* Pagination Buttons - Perfectly Centered */}
          <div className="flex items-center justify-center space-x-3">
            {/* Previous Button */}
            <motion.button
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700 hover:shadow-xl'
              }`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            >
              Previous
            </motion.button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1
                
                return (
                  <motion.button
                    key={pageNum}
                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all duration-300 ${
                      pageNum === currentPage
                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-xl scale-110 ring-2 ring-orange-300'
                        : 'bg-white text-orange-600 border-2 border-orange-200 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:scale-105'
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}
      </div>

            {/* Next Button */}
            <motion.button
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                currentPage === totalPages 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700 hover:shadow-xl'
              }`}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
              whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
            >
              Next
            </motion.button>
      </div>

          {/* Page Info - Centered Below */}
          <div className="text-sm font-medium bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 px-6 py-3 rounded-xl border-2 border-orange-200 shadow-lg">
            <span className="font-bold">Page {currentPage} of {totalPages}</span>
            <span className="text-orange-600 ml-2">({totalCount} total {activeStatus} vehicles)</span>
          </div>
        </motion.div>
      )}

      {/* Vehicle Details Modal */}
        <AnimatePresence>
          {activeSection === 'vehicle' && activeVehicle && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => {
                  setActiveSection(null)
                  setActiveVehicle(null)
                }}
              />
              <motion.div
                className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide border border-orange-200/30 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ 
                  type: "spring", 
                  damping: 20, 
                  stiffness: 300,
                  duration: 0.4
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Enhanced Multi-Layer Texture Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-green-50/50 opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/30 opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-yellow-50/20 via-transparent to-pink-50/20 opacity-30"></div>
                
                {/* Subtle Animated Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-green-400 to-blue-400 opacity-60 animate-pulse"></div>
                
                {/* Glass Effect Border */}
                <div className="absolute inset-0 rounded-3xl border border-orange-200/40 shadow-inner"></div>
                
                {/* Modal Content */}
                <div className="relative z-10">
                {/* Find the vehicle data */}
                {(() => {
                  const vehicle = [...pendingVehicles, ...approvedVehicles, ...rejectedVehicles]
                    .find(v => v._id === activeVehicle || v.custrecord_vehicle_number === activeVehicle)
                  
                  if (!vehicle) return <div className="text-white">Vehicle not found</div>

                  return (
                    <div>
                      {/* Enhanced Header with Texture */}
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-orange-200/30 relative">
                        {/* Header Background Texture */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 via-transparent to-green-50/30 rounded-t-3xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                        
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center shadow-lg border border-blue-200/30 backdrop-blur-sm">
                            <Truck className="w-8 h-8 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Vehicle Details</h3>
                            <p className="text-gray-600 text-lg font-medium">{vehicle.custrecord_vehicle_number}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveSection(null)
                            setActiveVehicle(null)
                          }}
                          className="relative z-10 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-orange-200/40 hover:bg-white hover:shadow-lg transition-all shadow-sm hover:scale-105"
                        >
                          <XCircle className="w-6 h-6 text-gray-600" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="space-y-6">
                       
                        
                        {/* Approval Requirements */}
                        <ApprovalRequirements vehicle={vehicle} />
                        
                        {/* Basic Vehicle Information */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                          {/* Section Background Texture */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                            <Car className="w-6 h-6 text-blue-600" />
                            Basic Vehicle Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Vehicle Number</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_vehicle_number}</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Current Plant</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.currentPlant}</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Vehicle Type</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_vehicle_type_ag}</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Age of Vehicle</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_age_of_vehicle}</p>
                            </div>
                          </div>
                        </div>

                        {/* Technical Details */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                          {/* Section Background Texture */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-pink-50/20"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                            <DocumentIcon className="w-6 h-6 text-purple-600" />
                            Technical Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Engine Number</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_engine_number_ag}</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Chassis Number</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_chassis_number}</p>
                            </div>
                          </div>
                        </div>

                        {/* Documentation */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                          {/* Section Background Texture */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-teal-50/20"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-green-600" />
                            Documentation
                          </h4>
                          <div className="space-y-4">
                            {/* RC Document */}
                            <div className="bg-white/60 backdrop-blur-sm border border-orange-200/20 rounded-xl p-5 shadow-sm">
                              <h5 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                RC Document
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">RC Number</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_rc_no}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Start Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_rc_start_date)}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">End Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_rc_end_date)}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Status</label>
                                  <p className="text-gray-900 font-semibold mt-1">{getDocumentStatus(vehicle.custrecord_rc_end_date)}</p>
                                </div>
                              </div>
                                                              {renderAttachments(vehicle.custrecord_rc_doc_attach, 'RC Document')}
                            </div>

                            {/* Insurance */}
                            <div className="bg-white/60 backdrop-blur-sm border border-orange-200/20 rounded-xl p-5 shadow-sm">
                              <h5 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Insurance
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Company</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_insurance_company_name_ag}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Policy Number</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_insurance_number_ag}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Start Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_insurance_start_date_ag)}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">End Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_insurance_end_date_ag)}</p>
                                </div>
                              </div>
                                                              {renderAttachments(vehicle.custrecord_insurance_attachment_ag, 'Insurance')}
                            </div>

                            {/* Permit */}
                            <div className="bg-white/60 backdrop-blur-sm border border-orange-200/20 rounded-xl p-5 shadow-sm">
                              <h5 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Permit
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Permit Number</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_permit_number_ag}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Start Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_permit_start_date)}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">End Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_permit_end_date)}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Status</label>
                                  <p className="text-gray-900 font-semibold mt-1">{getDocumentStatus(vehicle.custrecord_permit_end_date)}</p>
                                </div>
                              </div>
                                                              {renderAttachments(vehicle.custrecord_permit_attachment_ag, 'Permit')}
                            </div>

                            {/* PUC */}
                            <div className="bg-white/60 backdrop-blur-sm border border-orange-200/20 rounded-xl p-5 shadow-sm">
                              <h5 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                PUC
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">PUC Number</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_puc_number}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Start Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_puc_start_date_ag)}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">End Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_puc_end_date_ag)}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Status</label>
                                  <p className="text-gray-900 font-semibold mt-1">{getDocumentStatus(vehicle.custrecord_puc_end_date_ag)}</p>
                                </div>
                              </div>
                                                              {renderAttachments(vehicle.custrecord_puc_attachment_ag, 'PUC')}
                            </div>

                            {/* Fitness Certificate */}
                            <div className="bg-white/60 backdrop-blur-sm border border-orange-200/20 rounded-xl p-5 shadow-sm">
                              <h5 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Fitness Certificate
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Valid Until</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.custrecord_tms_vehicle_fit_cert_vld_upto)}</p>
                                </div>
                                <div>
                                  <label className="text-gray-600 text-sm font-medium">Status</label>
                                  <p className="text-gray-900 font-semibold mt-1">{getDocumentStatus(vehicle.custrecord_tms_vehicle_fit_cert_vld_upto)}</p>
                                </div>
                              </div>
                                                              {renderAttachments(vehicle.custrecord_tms_vehicle_fit_cert_attach, 'Fitness Certificate')}
                            </div>
                          </div>
                        </div>

                        {/* Vendor & Owner Information */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                          {/* Section Background Texture */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-purple-50/20"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                            <User className="w-6 h-6 text-indigo-600" />
                            Vendor & Owner Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Vendor Name</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_vendor_name_ag?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Owner Name</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_owner_name_ag}</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Owner Number</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_owner_no_ag}</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-sm font-medium">Created By</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_create_by}</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-sm font-medium">GPS Available</label>
                              <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_vehicle_master_gps_available ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Message and Action Buttons */}
                      <div className="mt-6 pt-6 border-t border-orange-200/30 relative">
                        {/* Section Background Texture */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/10 via-transparent to-yellow-50/10 rounded-b-3xl"></div>
                        <div className="relative z-10 space-y-4">
                          {/* Review Message */}
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Review Message</label>
                            <textarea
                              value={reviewMessage}
                              onChange={(e) => setReviewMessage(e.target.value)}
                              placeholder="Add your review message here..."
                              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-orange-200/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none shadow-sm hover:shadow-md transition-shadow"
                              rows={3}
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            {(() => {
                              const vehicleButtonState = getVehicleApprovalButtonState(vehicle)
                              return (
                                <>
                                  <motion.button
                                    onClick={() => handleApprovalAction(vehicle._id, 'vehicle', 'approved')}
                                    disabled={vehicleButtonState.disabled}
                                    className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                                      vehicleButtonState.disabled
                                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                                    }`}
                                    whileHover={!vehicleButtonState.disabled ? { scale: 1.02 } : {}}
                                    whileTap={!vehicleButtonState.disabled ? { scale: 0.98 } : {}}
                                  >
                                    {/* Button Background Texture */}
                                    {!vehicleButtonState.disabled && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-transparent to-green-600/20"></div>
                                    )}
                                    <div className="relative z-10 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    {vehicleButtonState.message}
                                    </div>
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleApprovalAction(vehicle._id, 'vehicle', 'rejected')}
                                    disabled={vehicleButtonState.disabled}
                                    className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                                      vehicleButtonState.disabled
                                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
                                    }`}
                                    whileHover={!vehicleButtonState.disabled ? { scale: 1.02 } : {}}
                                    whileTap={!vehicleButtonState.disabled ? { scale: 0.98 } : {}}
                                  >
                                    {/* Button Background Texture */}
                                    {!vehicleButtonState.disabled && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-transparent to-red-600/20"></div>
                                    )}
                                    <div className="relative z-10 flex items-center gap-2">
                                    <XCircle className="w-5 h-5" />
                                    Reject Vehicle Details
                                    </div>
                                  </motion.button>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Driver Details Modal */}
        <AnimatePresence>
          {activeSection === 'driver' && activeVehicle && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => {
                  setActiveSection(null)
                  setActiveVehicle(null)
                }}
              />
              <motion.div
                className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide border border-orange-200/30 shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Enhanced Multi-Layer Texture Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-green-50/50 opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/30 opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-yellow-50/20 via-transparent to-pink-50/20 opacity-30"></div>
                
                {/* Subtle Animated Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-green-400 to-blue-400 opacity-60 animate-pulse"></div>
                
                {/* Glass Effect Border */}
                <div className="absolute inset-0 rounded-3xl border border-orange-200/40 shadow-inner"></div>
                
                {/* Find the vehicle data */}
                {(() => {
                  const vehicle = [...pendingVehicles, ...approvedVehicles, ...rejectedVehicles]
                    .find(v => v._id === activeVehicle || v.custrecord_vehicle_number === activeVehicle)
                  
                  if (!vehicle) return <div className="text-gray-900">Vehicle not found</div>

                  return (
                    <div>
                      {/* Enhanced Header with Texture */}
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-orange-200/30 relative">
                        {/* Header Background Texture */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 via-transparent to-green-50/30 rounded-t-3xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                        
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/30 to-green-600/20 flex items-center justify-center shadow-lg border border-green-200/30 backdrop-blur-sm">
                            <User className="w-8 h-8 text-green-700" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Driver Details</h3>
                            <p className="text-gray-600 text-lg font-medium">{vehicle.custrecord_vehicle_number}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveSection(null)
                            setActiveVehicle(null)
                          }}
                          className="relative z-10 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-orange-200/40 hover:bg-white hover:shadow-lg transition-all shadow-sm hover:scale-105"
                        >
                          <XCircle className="w-6 h-6 text-gray-600" />
                        </button>
                      </div>

                      {/* Content */}
                      {vehicle.assignedDriver ? (
                        <div className="space-y-6">
                          {/* Basic Driver Information */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                            {/* Section Background Texture */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-blue-50/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                            
                            <div className="relative z-10">
                              <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                                <User className="w-6 h-6 text-green-600" />
                              Basic Driver Information
                            </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">Driver Name</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.assignedDriver.custrecord_driver_name}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">Mobile Number</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.assignedDriver.custrecord_driver_mobile_no}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">Created By</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.assignedDriver.custrecord_create_by_driver_master}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">LCA Test Status</label>
                                  <p className="text-gray-900 font-semibold mt-1 capitalize">{vehicle.assignedDriver.custrecord_driving_lca_test}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* License Information */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                            {/* Section Background Texture */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                            
                            <div className="relative z-10">
                              <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                              License Information
                            </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">License Number</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.assignedDriver.custrecord_driving_license_no}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">License Category</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.assignedDriver.custrecord_license_category_ag}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">License Start Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.assignedDriver.custrecord_driving_license_s_date)}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">License End Date</label>
                                  <p className="text-gray-900 font-semibold mt-1">{formatDate(vehicle.assignedDriver.custrecord_driver_license_e_date)}</p>
                              </div>
                            </div>
                            
                            {/* License Attachment */}
                            {renderAttachments(
                              vehicle.assignedDriver.custrecord_driving_license_attachment?.map(url => ({
                                url,
                                fileName: 'Driving License',
                                mimeType: 'image/png'
                              })), 
                              'Driving License'
                            )}
                            </div>
                          </div>

                          {/* Vehicle Assignment */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                            {/* Section Background Texture */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-transparent to-yellow-50/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                            
                            <div className="relative z-10">
                              <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                                <Truck className="w-6 h-6 text-orange-600" />
                              Vehicle Assignment
                            </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">Assigned Vehicle</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_vehicle_number}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">Vehicle Type</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.custrecord_vehicle_type_ag}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">Current Plant</label>
                                  <p className="text-gray-900 font-semibold mt-1">{vehicle.currentPlant}</p>
                              </div>
                              <div>
                                  <label className="text-gray-600 text-sm font-medium">Approval Status</label>
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm mt-1 ${
                                  vehicle.assignedDriver.approved_by_hq === 'approved' 
                                      ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : vehicle.assignedDriver.approved_by_hq === 'rejected'
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                }`}>
                                  {vehicle.assignedDriver.approved_by_hq || 'pending'}
                                </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 relative">
                          {/* Empty State Background Texture */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-transparent to-blue-50/30 rounded-xl"></div>
                          <div className="relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-200">
                              <User className="w-10 h-10 text-gray-500" />
                          </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-3">No Driver Assigned</h4>
                            <p className="text-gray-600 text-lg">This vehicle currently has no driver assigned to it.</p>
                          </div>
                        </div>
                      )}

                      {/* Review Message and Action Buttons */}
                      <div className="mt-6 pt-6 border-t border-orange-200/30 relative">
                        {/* Section Background Texture */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/10 via-transparent to-yellow-50/10 rounded-b-3xl"></div>
                        <div className="relative z-10 space-y-4">
                          {/* Review Message */}
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Review Message</label>
                            <textarea
                              value={reviewMessage}
                              onChange={(e) => setReviewMessage(e.target.value)}
                              placeholder="Add your review message here..."
                              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-orange-200/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none shadow-sm hover:shadow-md transition-shadow"
                              rows={3}
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <motion.button
                              onClick={() => handleApprovalAction(vehicle._id, 'driver', 'approved')}
                              className="flex-1 px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {/* Button Background Texture */}
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-transparent to-green-600/20"></div>
                              <div className="relative z-10 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Approve Driver Details
                              </div>
                            </motion.button>
                            <motion.button
                              onClick={() => handleApprovalAction(vehicle._id, 'driver', 'rejected')}
                              className="flex-1 px-6 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {/* Button Background Texture */}
                              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-transparent to-red-600/20"></div>
                              <div className="relative z-10 flex items-center gap-2">
                              <XCircle className="w-5 h-5" />
                              Reject Driver Details
                              </div>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Checklist Modal */}
        <AnimatePresence>
          {activeSection === 'checklist' && activeVehicle && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  setActiveSection(null)
                  setActiveVehicle(null)
                }}
              />
              <motion.div
                className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide border border-orange-200/30 shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Enhanced Multi-Layer Texture Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-green-50/50 opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/30 opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-yellow-50/20 via-transparent to-pink-50/20 opacity-30"></div>
                
                {/* Subtle Animated Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-green-400 to-blue-400 opacity-60 animate-pulse"></div>
                
                {/* Glass Effect Border */}
                <div className="absolute inset-0 rounded-3xl border border-orange-200/40 shadow-inner"></div>
                
                {/* Modal Content */}
                <div className="relative z-10">
                {/* Find the vehicle data */}
                {(() => {
                  const vehicle = [...pendingVehicles, ...approvedVehicles, ...rejectedVehicles]
                    .find(v => v._id === activeVehicle || v.custrecord_vehicle_number === activeVehicle)
                  
                  if (!vehicle) return <div className="text-white">Vehicle not found</div>

                  return (
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center">
                            <CheckSquare className="w-6 h-6 text-lime-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">Checklist Details</h3>
                            <p className="text-gray-600 text-base">{vehicle.custrecord_vehicle_number}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveSection(null)
                            setActiveVehicle(null)
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <XCircle className="w-6 h-6 text-gray-600" />
                        </button>
                      </div>

                      {/* Content */}
                      {vehicle.checklist && vehicle.checklist.checklistItems ? (
                        <div className="space-y-6">
                          {/* Checklist Header */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                            {/* Section Background Texture */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-pink-50/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                            
                            <div className="relative z-10">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <ClipboardCheck className="w-5 h-5 text-purple-600" />
                              Checklist Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-gray-600 text-sm">Checklist Name</label>
                                <p className="text-gray-900 font-medium">{vehicle.checklist.name}</p>
                              </div>
                              <div>
                                <label className="text-gray-600 text-sm">Filled By</label>
                                <p className="text-gray-900 font-medium">{vehicle.checklist.filledBy}</p>
                              </div>
                              <div>
                                <label className="text-gray-600 text-sm">Filled At</label>
                                <p className="text-gray-900 font-medium">{formatDate(vehicle.checklist.filledAt)}</p>
                              </div>
                              <div>
                                <label className="text-gray-600 text-sm">Date</label>
                                <p className="text-gray-900 font-medium">{formatDate(vehicle.checklist.date)}</p>
                              </div>
                              </div>
                            </div>
                          </div>

                          {/* Checklist Items */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                            {/* Section Background Texture */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-transparent to-blue-50/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                            
                            <div className="relative z-10">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <CheckSquare className="w-5 h-5 text-green-600" />
                              Checklist Items
                            </h4>
                            <div className="space-y-4">
                              {vehicle.checklist.checklistItems.map((item, index) => (
                                <div key={index} className="border border-white/10 rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <h5 className="text-gray-900 font-medium flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-700 text-xs font-bold">
                                        {index + 1}
                                      </span>
                                      {item.question}
                                    </h5>
                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                                      item.answer === 'Yes' ? 'bg-green-50 text-green-700 border border-green-200' :
                                      item.answer === 'No' ? 'bg-red-50 text-red-700 border border-red-200' :
                                      'bg-gray-50 text-gray-700 border border-gray-200'
                                    }`}>
                                      {item.answer || 'Not answered'}
                                    </div>
                                  </div>
                                  {item.comment && (
                                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                                      <label className="text-gray-600 text-sm">Comment</label>
                                      <p className="text-gray-900 text-sm mt-1">{item.comment}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            </div>
                          </div>

                          {/* Vehicle Information */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/20 shadow-sm relative overflow-hidden">
                            {/* Section Background Texture */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-indigo-50/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
                            
                            <div className="relative z-10">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Truck className="w-5 h-5 text-blue-600" />
                              Vehicle Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-gray-600 text-sm">Vehicle Number</label>
                                <p className="text-gray-900 font-medium">{vehicle.custrecord_vehicle_number}</p>
                              </div>
                              <div>
                                <label className="text-gray-600 text-sm">Vehicle Type</label>
                                <p className="text-gray-900 font-medium">{vehicle.custrecord_vehicle_type_ag}</p>
                              </div>
                              <div>
                                <label className="text-gray-600 text-sm">Current Plant</label>
                                <p className="text-gray-900 font-medium">{vehicle.currentPlant}</p>
                              </div>
                              <div>
                                <label className="text-gray-600 text-sm">Checklist Status</label>
                                <p className="text-gray-900 font-medium">Completed</p>
                              </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckSquare className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">No Checklist Done</h4>
                          <p className="text-gray-600">This vehicle has no checklist completed yet.</p>
                        </div>
                      )}


                    </div>
                  )
                })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onConfirm={handleConfirmationConfirm}
          onCancel={handleConfirmationCancel}
          title={`${confirmationData?.action === 'approved' ? 'Approve' : 'Reject'} ${confirmationData?.section === 'driver' ? 'Driver' : 'Vehicle'}`}
          message={`Are you sure you want to ${confirmationData?.action} ${confirmationData?.section === 'driver' ? 'driver' : 'vehicle'} "${confirmationData?.driverName || confirmationData?.vehicleName}"?`}
          action={confirmationData?.action}
        />

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={hideToast}
            />
          )}
        </AnimatePresence>

      {/* Trip Completed Confirmation Modal */}
      <AnimatePresence>
        {showTripCompletedModal && selectedVehicleForTrip && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTripCompletedModal(false)} />
            
            <motion.div
              className="relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-green-200"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Trip Completed?</h3>
                <p className="text-gray-600">Are you sure you want to mark this trip as completed?</p>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedVehicleForTrip.custrecord_vehicle_number}</p>
                    <p className="text-sm text-gray-600">{selectedVehicleForTrip.custrecord_vehicle_type_ag}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowTripCompletedModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={confirmTripCompleted}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Trip
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ApprovalCard 

