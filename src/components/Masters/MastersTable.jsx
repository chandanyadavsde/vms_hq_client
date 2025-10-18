import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Car, User, Phone, MapPin, Building2, Calendar, UserCheck, Eye, FileText, AlertCircle, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react'
import VehicleDetailsPopup from './VehicleDetailsPopup'
import ContactManagementModal from './ContactManagementModal'
import DriverAssignmentModal from './DriverAssignmentModal'
import DriverDetailsModal from './DriverDetailsModal'
import DriverFormModal from './Driver/DriverForm/DriverFormModal'
import VehicleFormModal from './Vehicle/VehicleForm/VehicleFormModal'
import UnifiedVehicleDriverModal from './UnifiedVehicleDriverModal'
import LoadingSkeleton from './LoadingSkeleton'
import SearchResult from './SearchResult'
import ImageModal from './ImageModal'
import VehicleService from '../../services/VehicleService'
import DriverService from '../../services/DriverService'
import EnterpriseFilters from './EnterpriseFilters'
import ColumnManager from './ColumnManager'
import ExportButton from './ExportButton'

const MastersTable = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('vehicle') // 'vehicle' or 'driver'
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showDriverFormModal, setShowDriverFormModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showVehicleDriverModal, setShowVehicleDriverModal] = useState(false)
  const [selectedVehicleForAction, setSelectedVehicleForAction] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageData, setSelectedImageData] = useState(null)

  // API State
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResult, setSearchResult] = useState(null)
  const [driverSearchResult, setDriverSearchResult] = useState(null)
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [totalDrivers, setTotalDrivers] = useState(0)

  // Enterprise Features State
  const [filters, setFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [visibleColumns, setVisibleColumns] = useState([
    'vehicle', 'driver', 'plantStatus', 'plant', 'operationalStatus', 'lastUpdated', 'createdBy', 'other'
  ])


  // API Functions
  // Transform vehicle data for UI display
  const transformVehicleData = (vehicle) => {
    return {
      ...vehicle,
      // Ensure we have the new fields with fallbacks
      plantStatus: (() => {
        const operationalStatus = vehicle.operationalStatus
        if (['inbound', 'at gate', 'inspection', 'available', 'loaded'].includes(operationalStatus)) {
          return 'assigned'
        }
        return 'unassigned'
      })(),
      operationalStatus: vehicle.operationalStatus || 'available',
      // Ensure other fields have fallbacks
      driverName: vehicle.driverName || 'No Driver Assigned',
      mobileNumber: vehicle.mobileNumber || 'N/A',
      currentPlant: vehicle.currentPlant || 'N/A',
      lastUpdated: vehicle.lastUpdated || (vehicle.updatedAt 
        ? new Date(vehicle.updatedAt).toLocaleDateString()
        : 'Not Available'),
      createdBy: vehicle.createdBy || 'N/A'
    }
  }

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 MastersTable: Fetching all vehicles...')
      const response = await VehicleService.getAllVehicles()
      console.log('📥 MastersTable: Received response:', response)

      // Transform vehicles to include new fields
      const transformedVehicles = (response.vehicles || []).map(transformVehicleData)
      setVehicles(transformedVehicles)
      setTotalVehicles(response.pagination?.totalVehicles || transformedVehicles.length)
      console.log('✅ MastersTable: State updated with', transformedVehicles.length, 'vehicles')
    } catch (err) {
      setError(err.message)
      console.error('❌ MastersTable: Error fetching vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 MastersTable: Fetching all drivers...')
      const response = await DriverService.getAllDrivers({ limit: 5000 })
      console.log('📥 MastersTable: Received response:', response)
      setDrivers(response.drivers || [])
      setTotalDrivers(response.pagination?.totalDrivers || response.drivers?.length || 0)
      console.log('✅ MastersTable: State updated with', response.drivers?.length || 0, 'drivers')
    } catch (err) {
      setError(err.message)
      console.error('❌ MastersTable: Error fetching drivers:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchVehicle = async (vehicleNumber) => {
    if (!vehicleNumber.trim()) {
      setSearchResult(null)
      return
    }

    try {
      setSearchLoading(true)
      setError(null)
      console.log('🔍 MastersTable: Searching for vehicle:', vehicleNumber.trim())
      const response = await VehicleService.searchVehicle(vehicleNumber.trim())
      console.log('📥 MastersTable: Search response received:', response)
      setSearchResult(response)
    } catch (err) {
      console.error('❌ MastersTable: Search error:', err)
      setError(err.message)
      setSearchResult(null)
    } finally {
      setSearchLoading(false)
    }
  }

  const searchDriver = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setDriverSearchResult(null)
      return
    }

    try {
      setSearchLoading(true)
      setError(null)
      console.log('🔍 MastersTable: Searching for driver:', searchTerm.trim())
      const response = await DriverService.searchDriver(searchTerm.trim())
      console.log('📥 MastersTable: Driver search response received:', response)
      setDriverSearchResult(response)
    } catch (err) {
      console.error('❌ MastersTable: Driver search error:', err)
      setError(`Driver search failed: ${err.message}`)
      setDriverSearchResult(null)
    } finally {
      setSearchLoading(false)
    }
  }



  const createVehicle = async (apiResponse) => {
    try {
      console.log('🚗 MastersTable: Processing vehicle creation response:', apiResponse)
      
      // Close the modal immediately for better UX
      setShowVehicleModal(false)
      
      // Transform the API response to match our UI structure
      const transformedVehicle = {
        id: apiResponse._id,
        vehicleNumber: apiResponse.custrecord_vehicle_number,
        driverName: apiResponse.assignedDriver?.custrecord_driver_name || 'No Driver Assigned',
        mobileNumber: apiResponse.assignedDriver?.custrecord_driver_mobile_no || 'N/A',
      // Plant Status: assigned if operationalStatus is inbound/at gate/inspection/available/loaded, otherwise unassigned
      plantStatus: (() => {
        const operationalStatus = apiResponse.operationalStatus
        if (['inbound', 'at gate', 'inspection', 'available', 'loaded'].includes(operationalStatus)) {
          return 'assigned'
        }
        return 'unassigned'
      })(),
        // Operational Status: show the actual operational status
        operationalStatus: apiResponse.operationalStatus || 'available',
        currentPlant: apiResponse.currentPlant || 'N/A',
        lastUpdated: apiResponse.updatedAt 
          ? new Date(apiResponse.updatedAt).toLocaleDateString()
          : 'Not Available',
        createdBy: apiResponse.custrecord_create_by || 'N/A',
        contactPersons: apiResponse.contactPersons || [],
        rawData: apiResponse,
        hasDriver: !!apiResponse.assignedDriver,
        hasChecklist: apiResponse.checklistConfirmed || false,
        hasContacts: apiResponse.contactPersons && apiResponse.contactPersons.length > 0,
        approvalStatus: apiResponse.approved_by_hq,
        approvalMeta: apiResponse.approvalMeta
      }
      
      // Add the new vehicle to the list
      setVehicles(prev => [transformedVehicle, ...prev])

      // Update total count
      setTotalVehicles(prev => prev + 1)
      
      console.log('🎉 Vehicle created and added to list successfully!')
      return apiResponse
      
    } catch (err) {
      console.error('❌ MastersTable: Error processing vehicle creation:', err)
      setError(err.message)
      throw err
    }
  }

  const createDriver = async (driverData) => {
    try {
      console.log('👤 MastersTable: Creating driver:', driverData)
      const response = await DriverService.createDriver(driverData)
      console.log('✅ MastersTable: Driver created successfully:', response)
      
      // Add the new driver to the existing list (optimistic update)
      if (response && response._id) {
        const newDriver = {
          ...response,
          // Transform API response to match our UI format
          name: response.custrecord_driver_name,
          contact: {
            phone: response.custrecord_driver_mobile_no
          },
          identification: {
            licenseNumber: response.custrecord_driving_license_no,
            licenseType: response.custrecord_license_category_ag,
            licenseStart: response.custrecord_driving_license_s_date,
            licenseExpiry: response.custrecord_driver_license_e_date,
            licenseTestStatus: response.custrecord_driving_lca_test || 'passed'
          },
          documents: response.custrecord_driving_license_attachment?.map(url => ({
            id: Date.now().toString(),
            fileName: url.split('/').pop(),
            url: url,
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'Uploaded'
          })) || [],
          // Add missing properties that the UI expects
          assignedVehicles: response.assignedVehicle ? [response.assignedVehicle] : [],
          assignedVehicle: response.assignedVehicle || null
        }
        
        // Add to the beginning of the drivers list
        setDrivers(prev => [newDriver, ...prev])

        // Update total count
        setTotalDrivers(prev => prev + 1)
        
        console.log('✅ MastersTable: Driver added to list successfully')
      }
      
      // Close the modal
      setShowDriverFormModal(false)
      
      return response
    } catch (err) {
      console.error('❌ MastersTable: Error creating driver:', err)
      // Don't set global error, let the form handle it
      throw err
    }
  }

  const handleVehicleUpdate = async (vehicleNumber, patchData) => {
    try {
      console.log('🔄 MastersTable: Updating vehicle:', vehicleNumber, patchData)
      
      // Use VehicleService to update the vehicle
      const response = await VehicleService.updateVehicle(vehicleNumber, patchData)
      console.log('✅ MastersTable: Vehicle updated successfully:', response)
      
      // Extract updated vehicle data from response
      const updatedVehicleData = response.vehicle || response.data || response
      
      // Update the selected vehicle immediately with fresh data
      if (selectedVehicle && (selectedVehicle.vehicleNumber === vehicleNumber || selectedVehicle.custrecord_vehicle_number === vehicleNumber)) {
        console.log('🔄 Updating selected vehicle with fresh data:', updatedVehicleData)
        console.log('📷 Image arrays in API response:', {
          rc: updatedVehicleData.rawData?.custrecord_rc_doc_attach?.length || 0,
          insurance: updatedVehicleData.rawData?.custrecord_insurance_attachment_ag?.length || 0,
          permit: updatedVehicleData.rawData?.custrecord_permit_attachment_ag?.length || 0,
          puc: updatedVehicleData.rawData?.custrecord_puc_attachment_ag?.length || 0
        })
        
        // Merge the updated data with existing vehicle structure
        const updatedSelectedVehicle = {
          ...selectedVehicle,
          ...updatedVehicleData,
          // Ensure we update the current plant field specifically
          currentPlant: updatedVehicleData.currentPlant || selectedVehicle.currentPlant,
          // Update the rawData if available (this contains the document dates and image arrays)
          rawData: {
            ...selectedVehicle.rawData,
            ...updatedVehicleData.rawData,
            // Document END dates
            custrecord_rc_end_date: updatedVehicleData.custrecord_rc_end_date || updatedVehicleData.rawData?.custrecord_rc_end_date || selectedVehicle.rawData?.custrecord_rc_end_date,
            custrecord_insurance_end_date_ag: updatedVehicleData.custrecord_insurance_end_date_ag || updatedVehicleData.rawData?.custrecord_insurance_end_date_ag || selectedVehicle.rawData?.custrecord_insurance_end_date_ag,
            custrecord_permit_end_date: updatedVehicleData.custrecord_permit_end_date || updatedVehicleData.rawData?.custrecord_permit_end_date || selectedVehicle.rawData?.custrecord_permit_end_date,
            custrecord_puc_end_date_ag: updatedVehicleData.custrecord_puc_end_date_ag || updatedVehicleData.rawData?.custrecord_puc_end_date_ag || selectedVehicle.rawData?.custrecord_puc_end_date_ag,
            custrecord_fitness_end_date: updatedVehicleData.custrecord_fitness_end_date || updatedVehicleData.rawData?.custrecord_fitness_end_date || selectedVehicle.rawData?.custrecord_fitness_end_date,
            // Document START dates (NEW)
            custrecord_rc_start_date: updatedVehicleData.custrecord_rc_start_date || updatedVehicleData.rawData?.custrecord_rc_start_date || selectedVehicle.rawData?.custrecord_rc_start_date,
            custrecord_insurance_start_date_ag: updatedVehicleData.custrecord_insurance_start_date_ag || updatedVehicleData.rawData?.custrecord_insurance_start_date_ag || selectedVehicle.rawData?.custrecord_insurance_start_date_ag,
            custrecord_permit_start_date: updatedVehicleData.custrecord_permit_start_date || updatedVehicleData.rawData?.custrecord_permit_start_date || selectedVehicle.rawData?.custrecord_permit_start_date,
            custrecord_puc_start_date_ag: updatedVehicleData.custrecord_puc_start_date_ag || updatedVehicleData.rawData?.custrecord_puc_start_date_ag || selectedVehicle.rawData?.custrecord_puc_start_date_ag,
            // Insurance text fields (NEW)
            custrecord_insurance_company_name_ag: updatedVehicleData.custrecord_insurance_company_name_ag || updatedVehicleData.rawData?.custrecord_insurance_company_name_ag || selectedVehicle.rawData?.custrecord_insurance_company_name_ag,
            custrecord_insurance_number_ag: updatedVehicleData.custrecord_insurance_number_ag || updatedVehicleData.rawData?.custrecord_insurance_number_ag || selectedVehicle.rawData?.custrecord_insurance_number_ag,
            // 🔧 FIX: Specifically update image arrays from API response
            custrecord_rc_doc_attach: updatedVehicleData.rawData?.custrecord_rc_doc_attach || selectedVehicle.rawData?.custrecord_rc_doc_attach,
            custrecord_insurance_attachment_ag: updatedVehicleData.rawData?.custrecord_insurance_attachment_ag || selectedVehicle.rawData?.custrecord_insurance_attachment_ag,
            custrecord_permit_attachment_ag: updatedVehicleData.rawData?.custrecord_permit_attachment_ag || selectedVehicle.rawData?.custrecord_permit_attachment_ag,
            custrecord_puc_attachment_ag: updatedVehicleData.rawData?.custrecord_puc_attachment_ag || selectedVehicle.rawData?.custrecord_puc_attachment_ag,
            // 🔧 FIX: Update operational status and history for journey stepper
            operationalStatus: updatedVehicleData.operationalStatus || updatedVehicleData.rawData?.operationalStatus || selectedVehicle.rawData?.operationalStatus,
            statusMeta: updatedVehicleData.statusMeta || updatedVehicleData.rawData?.statusMeta || selectedVehicle.rawData?.statusMeta,
            statusHistory: updatedVehicleData.statusHistory || updatedVehicleData.rawData?.statusHistory || selectedVehicle.rawData?.statusHistory || []
          }
        }
        
        console.log('📷 Updated image arrays in new state:', {
          rc: updatedSelectedVehicle.rawData?.custrecord_rc_doc_attach?.length || 0,
          insurance: updatedSelectedVehicle.rawData?.custrecord_insurance_attachment_ag?.length || 0,
          permit: updatedSelectedVehicle.rawData?.custrecord_permit_attachment_ag?.length || 0,
          puc: updatedSelectedVehicle.rawData?.custrecord_puc_attachment_ag?.length || 0
        })
        
        setSelectedVehicle(updatedSelectedVehicle)
      }
      
      // Refresh the vehicle list in background (no await to avoid blocking UI)
      fetchVehicles().catch(err =>
        console.error('⚠️ Background refresh failed:', err)
      )
      
      return updatedVehicleData
    } catch (err) {
      console.error('❌ MastersTable: Error updating vehicle:', err)
      throw err
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResult(null)
    setDriverSearchResult(null)
    setError(null)
  }

  // Manual refresh function
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered')
    setError(null)

    try {
      if (viewMode === 'vehicle') {
        await fetchVehicles()
        console.log('✅ Vehicles refreshed successfully')
      } else {
        await fetchDrivers()
        console.log('✅ Drivers refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Refresh failed:', error)
      setError('Failed to refresh data')
    }
  }

  // Refresh single vehicle in detail modal
  const handleVehicleRefresh = async () => {
    if (!selectedVehicle) return

    const vehicleNumber = selectedVehicle.vehicleNumber || selectedVehicle.custrecord_vehicle_number

    try {
      console.log('🔄 Refreshing vehicle:', vehicleNumber)

      // Fetch fresh vehicle data from API
      const response = await VehicleService.searchVehicle(vehicleNumber)
      console.log('✅ Fresh vehicle data received:', response)

      // Extract vehicle data from response
      const freshVehicleData = response.vehicle || response.data || response

      // Update the selected vehicle state with fresh data
      setSelectedVehicle(freshVehicleData)

      console.log('✅ Vehicle refreshed in modal')
      return freshVehicleData
    } catch (error) {
      console.error('❌ Failed to refresh vehicle:', error)
      setError('Failed to refresh vehicle data')
      throw error
    }
  }

  // Clear driver data when switching to vehicle mode to prevent interference
  const clearDriverData = () => {
    setDrivers([])
    setDriverSearchResult(null)
  }

  // ============= ENTERPRISE FEATURES =============

  // Sorting functionality
  const handleSort = (columnKey) => {
    let direction = 'asc'
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: columnKey, direction })
  }

  const getSortedData = (data) => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

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

  // Filtering functionality
  const getFilteredData = (data) => {
    if (!filters || Object.keys(filters).length === 0) return data

    return data.filter(item => {
      // Plant Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.some(s => s.value === item.plantStatus)) return false
      }

      // Plant Location filter
      if (filters.plant && filters.plant.length > 0) {
        if (!filters.plant.some(p => p.value === item.currentPlant)) return false
      }

      // Operational Status filter
      if (filters.operationalStatus && filters.operationalStatus.length > 0) {
        if (!filters.operationalStatus.some(s => s.value === item.operationalStatus)) return false
      }

      // Approval Status filter
      if (filters.approvalStatus && filters.approvalStatus.length > 0) {
        if (!filters.approvalStatus.some(s => s.value === item.approvalStatus)) return false
      }

      // Driver Assignment filter
      if (filters.hasDriver && filters.hasDriver !== 'all') {
        if (filters.hasDriver === 'assigned' && !item.hasDriver) return false
        if (filters.hasDriver === 'unassigned' && item.hasDriver) return false
      }

      // Date Range filter
      if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
        const itemDate = new Date(item.lastUpdated)
        if (filters.dateRange.from && itemDate < new Date(filters.dateRange.from)) return false
        if (filters.dateRange.to && itemDate > new Date(filters.dateRange.to)) return false
      }

      return true
    })
  }


  // Column management
  const columnDefinitions = [
    { id: 'vehicle', label: 'Vehicle', required: true },
    { id: 'driver', label: 'Driver', required: false },
    { id: 'plantStatus', label: 'Plant Status', required: false },
    { id: 'plant', label: 'Plant', required: false },
    { id: 'operationalStatus', label: 'Operational Status', required: false },
    { id: 'lastUpdated', label: 'Last Updated', required: false },
    { id: 'createdBy', label: 'Created By', required: false },
    { id: 'other', label: 'Actions', required: true }
  ]

  const handleColumnToggle = (columnId) => {
    const column = columnDefinitions.find(col => col.id === columnId)
    if (column && column.required) return // Don't toggle required columns

    if (visibleColumns.includes(columnId)) {
      setVisibleColumns(visibleColumns.filter(id => id !== columnId))
    } else {
      setVisibleColumns([...visibleColumns, columnId])
    }
  }

  const resetColumns = () => {
    setVisibleColumns(['vehicle', 'driver', 'plantStatus', 'plant', 'operationalStatus', 'lastUpdated', 'createdBy', 'other'])
  }

  // Process data with filters and sorting
  const processedVehicles = getSortedData(getFilteredData(vehicles))

  // Effects
  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    console.log('🔄 View mode changed to:', viewMode)
    if (viewMode === 'driver') {
      console.log('🚀 Fetching drivers...')
      // Only fetch if we don't have drivers already
      if (drivers.length === 0) {
        fetchDrivers()
      } else {
        console.log('✅ Drivers already loaded, skipping fetch')
      }
    } else if (viewMode === 'vehicle') {
      // Clear driver data to prevent interference
      clearDriverData()
      // Ensure we have vehicle data when switching back to vehicle mode
      if (vehicles.length === 0) {
        console.log('🚀 Refreshing vehicle data...')
        fetchVehicles()
      }
    }
  }, [viewMode])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        if (viewMode === 'vehicle') {
          searchVehicle(searchQuery)
        } else {
          // Skip API call for driver search - use local filtering only
          // searchDriver(searchQuery) // Disabled API call
          console.log('🔍 Driver search using local filtering only')
        }
      } else {
        setSearchResult(null)
        setDriverSearchResult(null)
      }
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, viewMode])




  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.contact.phone.includes(searchQuery) ||
    driver.identification.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (driver.assignedVehicles && driver.assignedVehicles.length > 0 && driver.assignedVehicles[0].vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    driver.createdAt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle)
  }

  const handleDriverClick = (driver) => {
    console.log('🔄 Driver clicked (raw):', driver)
    console.log('🔄 Driver data structure:', {
      name: driver.name,
      contact: driver.contact,
      identification: driver.identification,
      assignedVehicles: driver.assignedVehicles || [],
      documents: driver.documents
    })
    setSelectedDriver(driver)
  }

  const handleDriverUpdate = (updatedDriverData) => {
    console.log('🔄 Updating driver in list:', updatedDriverData)
    
    // Transform the API response to match our UI format
    const updatedDriver = {
      id: updatedDriverData._id,
      name: updatedDriverData.custrecord_driver_name || 'N/A',
      contact: {
        phone: updatedDriverData.custrecord_driver_mobile_no || 'N/A',
        email: updatedDriverData.custrecord_driver_email || 'N/A',
        address: updatedDriverData.custrecord_driver_address || 'N/A'
      },
      identification: {
        licenseNumber: updatedDriverData.custrecord_driving_license_no || 'N/A',
        licenseType: updatedDriverData.custrecord_license_category_ag || 'N/A',
        licenseExpiry: updatedDriverData.custrecord_driver_license_e_date || 'N/A',
        licenseStart: updatedDriverData.custrecord_driving_license_s_date || 'N/A',
        aadharNumber: updatedDriverData.custrecord_driver_aadhar || 'N/A',
        panNumber: updatedDriverData.custrecord_driver_pan || 'N/A'
      },
      documents: updatedDriverData.custrecord_driving_license_attachment?.map((url, index) => ({
        id: `license_${index}`,
        type: 'Driving License',
        url: url,
        status: 'Valid'
      })) || [],
      status: updatedDriverData.approved_by_hq === 'approved' ? 'Active' : 'Pending',
      assignedVehicles: [],
      createdAt: updatedDriverData.createdAt || 'N/A',
      updatedAt: updatedDriverData.updatedAt || 'N/A',
      rawData: updatedDriverData
    }
    
    // Update the driver in the drivers list
    setDrivers(prev => prev.map(driver => 
      driver.id === updatedDriver.id ? updatedDriver : driver
    ))
    
    // Update the selected driver if it's the same one
    setSelectedDriver(updatedDriver)
    
    console.log('✅ Driver updated in list successfully')
  }

  const handleContactAction = (vehicle) => {
    setSelectedVehicleForAction(vehicle)
    setShowContactModal(true)
  }

  const handleContactUpdate = async (vehicleNumber, updatedVehicleData) => {
    try {
      console.log('🔄 Contact updated for vehicle:', vehicleNumber, updatedVehicleData)
      
      // Update the vehicle in the vehicles list
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => 
          vehicle.vehicleNumber === vehicleNumber 
            ? { ...vehicle, contactPersons: updatedVehicleData.contactPersons }
            : vehicle
        )
      )
      
      // Update selected vehicle if it's the same one
      if (selectedVehicle && selectedVehicle.vehicleNumber === vehicleNumber) {
        setSelectedVehicle(prev => ({
          ...prev,
          contactPersons: updatedVehicleData.contactPersons
        }))
      }
      
      console.log('✅ Contact updated in list successfully')
    } catch (err) {
      console.error('❌ Error updating contact:', err)
    }
  }

  // Handle unified form success (vehicle + driver + contacts)
  const handleUnifiedFormSuccess = async (createdData) => {
    console.log('🎉 MastersTable: Unified form completed successfully:', createdData)
    
    try {
      // Process the created vehicle
      if (createdData.vehicle) {
        console.log('🚗 Processing created vehicle:', createdData.vehicle)
        await createVehicle(createdData.vehicle)
      }
      
      // Process the created driver
      if (createdData.driver) {
        console.log('👤 Processing created driver:', createdData.driver)
        
        // The driver data from unified modal is already the API response
        // So we can directly add it to the drivers list without calling createDriver API again
        if (createdData.driver._id) {
          const newDriver = {
            ...createdData.driver,
            // Transform API response to match our UI format
            name: createdData.driver.custrecord_driver_name,
            contact: {
              phone: createdData.driver.custrecord_driver_mobile_no
            },
            identification: {
              licenseNumber: createdData.driver.custrecord_driving_license_no,
              licenseType: createdData.driver.custrecord_license_category_ag,
              licenseStart: createdData.driver.custrecord_driving_license_s_date,
              licenseExpiry: createdData.driver.custrecord_driver_license_e_date,
              licenseTestStatus: createdData.driver.custrecord_driving_lca_test || 'passed'
            },
            documents: createdData.driver.custrecord_driving_license_attachment?.map(url => ({
              id: Date.now().toString(),
              fileName: url.split('/').pop(),
              url: url,
              uploadDate: new Date().toISOString().split('T')[0],
              status: 'Uploaded'
            })) || [],
            // Add missing properties that the UI expects
            assignedVehicles: createdData.driver.assignedVehicle ? [createdData.driver.assignedVehicle] : [],
            assignedVehicle: createdData.driver.assignedVehicle || null
          }
          
          // Add to the beginning of the drivers list
          setDrivers(prev => [newDriver, ...prev])

          // Update total count
          setTotalDrivers(prev => prev + 1)
          
          console.log('✅ Driver added to list successfully from unified form')
        }
      }
      
      // NEW: Update the vehicle with driver info after a short delay to ensure assignment is complete
      if (createdData.vehicle && createdData.driver) {
        setTimeout(() => {
          console.log('🔄 Updating vehicle with driver information...')
          setVehicles(prev => prev.map(vehicle => 
            vehicle.id === createdData.vehicle._id 
              ? {
                  ...vehicle,
                  driverName: createdData.driver.custrecord_driver_name,
                  mobileNumber: createdData.driver.custrecord_driver_mobile_no,
                  hasDriver: true,
                  rawData: {
                    ...vehicle.rawData,
                    assignedDriver: createdData.driver
                  }
                }
              : vehicle
          ))
          console.log('✅ Vehicle updated with driver information successfully!')
        }, 1000) // 1 second delay to ensure driver assignment API call has completed
      }
      
      // Contacts are already handled by the vehicle update
      console.log('✅ All data processed successfully!')
      
    } catch (error) {
      console.error('❌ Error processing unified form data:', error)
      setError('Failed to refresh data after form completion')
    }
  }

  const handleDriverAction = (vehicle) => {
    console.log('🚗 Driver action clicked for vehicle:', vehicle)
    console.log('🚗 Vehicle driver data:', vehicle.rawData?.assignedDriver)
    console.log('🚗 Vehicle driver name:', vehicle.driverName)
    
    // Check if vehicle has an actual assigned driver
    const hasAssignedDriver = vehicle.rawData?.assignedDriver && 
                             vehicle.driverName !== 'No Driver Assigned'
    
    if (hasAssignedDriver) {
      // Driver is assigned - do nothing (no click functionality)
      console.log('🚗 Driver is assigned - no action taken')
      return
    } else {
      // Open driver assignment modal for vehicles with no driver
      setSelectedVehicleForAction(vehicle)
      setShowDriverModal(true)
    }
  }

  const handleImageClick = (driver) => {
    console.log('🖼️ Image clicked for driver:', driver)
    console.log('🖼️ Driver documents:', driver.documents)
    console.log('🖼️ Raw data attachments:', driver.rawData?.custrecord_driving_license_attachment)
    
    // Get the first attachment URL
    const imageUrl = driver.documents && driver.documents.length > 0 
      ? driver.documents[0].url 
      : driver.rawData?.custrecord_driving_license_attachment?.[0]
    
    if (imageUrl) {
      setSelectedImageData({
        imageUrl,
        driverName: driver.name,
        licenseNumber: driver.identification?.licenseNumber || 'N/A'
      })
      setShowImageModal(true)
    } else {
      // Show placeholder modal for no image
      setSelectedImageData({
        imageUrl: null,
        driverName: driver.name,
        licenseNumber: driver.identification?.licenseNumber || 'N/A'
      })
      setShowImageModal(true)
    }
  }



  const getStatusColor = (status) => {
    if (!status) {
      return 'bg-slate-100 text-slate-600 border-slate-200'
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inbound':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'at gate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inspection':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'loaded':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header Section - Enterprise */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Master Management</h1>
            <p className="text-slate-600 text-sm">Comprehensive vehicle and driver management system</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Export Buttons */}
            <ExportButton
              data={viewMode === 'vehicle' ? processedVehicles : filteredDrivers}
              filename={viewMode === 'vehicle' ? 'vehicles-export' : 'drivers-export'}
              viewMode={viewMode}
            />

            {/* Column Manager */}
            {viewMode === 'vehicle' && (
              <ColumnManager
                columns={columnDefinitions}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
                onReset={resetColumns}
              />
            )}

            {/* Filters */}
            {viewMode === 'vehicle' && (
              <EnterpriseFilters
                onFilterChange={setFilters}
                onClearFilters={() => setFilters({})}
                activeFilters={filters}
              />
            )}

            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            <motion.button
              onClick={() => {
                if (viewMode === 'vehicle') {
                  setShowVehicleModal(true)
                } else {
                  setShowDriverFormModal(true)
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewMode === 'vehicle' ? '+ Vehicle' : '+ Driver'}
            </motion.button>

            {viewMode === 'vehicle' && (
              <motion.button
                onClick={() => setShowVehicleDriverModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + Vehicle + Driver
              </motion.button>
            )}
          </div>
        </div>


        {/* Search and Filter Bar - Ultra Compact */}
        <div className="bg-slate-50 rounded-lg p-1.5 mb-2">
          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="flex-1 relative">
              {searchLoading ? (
                <RefreshCw className="absolute left-2 top-1/2 transform -translate-y-1/2 text-orange-500 w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              )}
              <input
                type="text"
                placeholder={viewMode === 'vehicle' ? "Search by vehicle number..." : "Search by driver name, license number..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <AlertCircle className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Toggle Icons - Compact */}
            <div className="flex items-center gap-0.5 bg-white rounded-md border border-slate-200 p-0.5">
              <button
                onClick={() => setViewMode('vehicle')}
                className={`flex items-center gap-1 px-2 py-1 rounded-sm transition-all text-xs font-medium ${
                  viewMode === 'vehicle'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Car className="w-3 h-3" />
                Vehicle
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Switching to driver view mode')
                  setViewMode('driver')
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-sm transition-all text-xs font-medium ${
                  viewMode === 'driver'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-3 h-3" />
                Driver
              </button>
            </div>

            {/* Filter, Group, and More buttons removed - not needed */}
          </div>
        </div>

                {/* Search Result Display - Only for Vehicle Mode */}
                <AnimatePresence>
                  {searchResult && viewMode === 'vehicle' && (
                    <SearchResult
                      result={searchResult}
                      onClose={clearSearch}
                      viewMode={viewMode}
                      onVehicleClick={handleVehicleClick}
                      onDriverAction={handleDriverAction}
                      onContactAction={handleContactAction}
                    />
                  )}
                </AnimatePresence>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <div>
                          <h3 className="text-sm font-semibold text-red-800">Error</h3>
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                        <button
                          onClick={() => setError(null)}
                          className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


        {/* Modern Card-Based Table - Compressed */}
        <div className="space-y-1">
          {/* Header Row - Sticky */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-slate-100">
            {viewMode === 'vehicle' ? (
              // Vehicle Table Header
              <div className="grid grid-cols-11 gap-4 items-center">
                {/* Vehicle - Sortable */}
                {visibleColumns.includes('vehicle') && (
                  <button
                    onClick={() => handleSort('vehicleNumber')}
                    className="col-span-2 flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                  >
                    <Car className="w-4 h-4" />
                    <span>Vehicle</span>
                    {sortConfig.key === 'vehicleNumber' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Driver - Sortable */}
                {visibleColumns.includes('driver') && (
                  <button
                    onClick={() => handleSort('driverName')}
                    className="col-span-2 flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Driver</span>
                    {sortConfig.key === 'driverName' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Plant Status - Sortable */}
                {visibleColumns.includes('plantStatus') && (
                  <button
                    onClick={() => handleSort('plantStatus')}
                    className="col-span-1 flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                  >
                    <span>Status</span>
                    {sortConfig.key === 'plantStatus' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Plant - Sortable */}
                {visibleColumns.includes('plant') && (
                  <button
                    onClick={() => handleSort('currentPlant')}
                    className="col-span-1 flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Plant</span>
                    {sortConfig.key === 'currentPlant' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Operational Status - Sortable */}
                {visibleColumns.includes('operationalStatus') && (
                  <button
                    onClick={() => handleSort('operationalStatus')}
                    className="col-span-1 flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                  >
                    <span>Op Status</span>
                    {sortConfig.key === 'operationalStatus' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Last Updated - Sortable */}
                {visibleColumns.includes('lastUpdated') && (
                  <button
                    onClick={() => handleSort('lastUpdated')}
                    className="col-span-1 flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Updated</span>
                    {sortConfig.key === 'lastUpdated' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Created By - Sortable */}
                {visibleColumns.includes('createdBy') && (
                  <button
                    onClick={() => handleSort('createdBy')}
                    className="col-span-1 flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Created</span>
                    {sortConfig.key === 'createdBy' && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Actions */}
                {visibleColumns.includes('other') && (
                  <div className="col-span-1 text-slate-600 font-semibold text-xs uppercase tracking-wide text-right pr-2">
                    Actions
                  </div>
                )}
              </div>
            ) : (
              // Driver Table Header
              <div className="grid grid-cols-11 gap-2 items-center">
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    <User className="w-3.5 h-3.5" />
                    Name
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    <Phone className="w-3.5 h-3.5" />
                    Contact
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    <FileText className="w-3.5 h-3.5" />
                    License
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5" />
                    Start
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5" />
                    Expiry
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    <Car className="w-3.5 h-3.5" />
                    Vehicle
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    <UserCheck className="w-3.5 h-3.5" />
                    Created
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    <Eye className="w-3.5 h-3.5" />
                    Image
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Rows - Card Style */}
          <div className="space-y-1 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {loading ? (
              <LoadingSkeleton viewMode={viewMode} />
            ) : viewMode === 'vehicle' ? (
              // Vehicle Data Rows
              processedVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md border border-slate-100 hover:border-orange-200 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                whileHover={{ scale: 1.005 }}
              >
                <div className="grid grid-cols-11 gap-4 items-center">
                  {/* Vehicle */}
                  {visibleColumns.includes('vehicle') && (
                  <div className="col-span-2">
                    <button
                      onClick={() => handleVehicleClick(vehicle)}
                      className="flex items-center gap-2 text-left w-full group-hover:bg-orange-50 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                        <Car className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{vehicle.vehicleNumber}</div>
                        <div className="text-xs text-slate-500">Vehicle ID</div>
                      </div>
                    </button>
                  </div>
                  )}

                  {/* Driver */}
                  {visibleColumns.includes('driver') && (
                   <div className="col-span-2">
                     {vehicle.rawData?.assignedDriver && vehicle.driverName !== 'No Driver Assigned' ? (
                       <div className="flex items-center gap-2 text-left w-full p-1.5 rounded-lg">
                         <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                           <User className="w-3 h-3 text-slate-600" />
                         </div>
                         <div>
                           <div className="font-medium text-slate-800 text-xs">{vehicle.driverName}</div>
                           <div className="text-xs text-slate-500">{vehicle.mobileNumber}</div>
                         </div>
                       </div>
                     ) : (
                       <button
                         onClick={() => handleDriverAction(vehicle)}
                         className="flex items-center gap-2 text-left w-full group-hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                       >
                         <div className="w-6 h-6 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                           <User className="w-3 h-3 text-blue-600" />
                         </div>
                         <div>
                           <div className="font-medium text-slate-800 text-xs">{vehicle.driverName}</div>
                           <div className="text-xs text-slate-500">{vehicle.mobileNumber}</div>
                         </div>
                       </button>
                     )}
                   </div>
                  )}

                  {/* Plant Status */}
                  {visibleColumns.includes('plantStatus') && (
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      vehicle.plantStatus === 'assigned'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {vehicle.plantStatus || 'unassigned'}
                    </span>
                  </div>
                  )}

                  {/* Plant */}
                  {visibleColumns.includes('plant') && (
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-700 text-xs font-medium">{vehicle.currentPlant}</span>
                    </div>
                  </div>
                  )}

                  {/* Operational Status */}
                  {visibleColumns.includes('operationalStatus') && (
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(vehicle.operationalStatus)}`}>
                      {vehicle.operationalStatus || 'available'}
                    </span>
                  </div>
                  )}

                  {/* Last Updated */}
                  {visibleColumns.includes('lastUpdated') && (
                  <div className="col-span-1">
                    <div className="flex items-center gap-1 pr-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-700 text-xs font-medium whitespace-nowrap">{vehicle.lastUpdated}</span>
                    </div>
                  </div>
                  )}

                  {/* Created */}
                  {visibleColumns.includes('createdBy') && (
                  <div className="col-span-1">
                    <div className="flex items-center gap-1 pr-3">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-700 text-xs font-medium truncate" title={vehicle.createdBy}>{vehicle.createdBy}</span>
                    </div>
                  </div>
                  )}

                  {/* Other/Contacts */}
                  {visibleColumns.includes('other') && (
                  <div className="col-span-1">
                    <div className="flex items-center justify-end pr-2">
                      <button
                        onClick={() => handleContactAction(vehicle)}
                        className="p-1.5 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                        title="Manage Contacts"
                      >
                        <User className="w-3 h-3 text-orange-600" />
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              </motion.div>
              ))
            ) : (
              // Driver Data Rows
              filteredDrivers.map((driver, index) => {
                console.log('🔍 Driver data for table:', driver)
                console.log('📅 License start:', driver.identification?.licenseStart)
                console.log('📅 License expiry:', driver.identification?.licenseExpiry)
                return (
                <motion.div
                  key={driver.id}
                  className="bg-white rounded-lg p-1.5 shadow-sm hover:shadow-md border border-slate-100 hover:border-orange-200 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="grid grid-cols-11 gap-2 items-center">
                    {/* Name */}
                    <div className="col-span-2">
                      <button
                        onClick={() => handleDriverClick(driver)}
                        className="flex items-center gap-2 text-left w-full group-hover:bg-orange-50 p-1 rounded-lg transition-colors"
                      >
                        <div className="w-6 h-6 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                          <User className="w-3 h-3 text-orange-600" />
                        </div>
                        <div className="font-semibold text-slate-800 text-xs">{driver.name}</div>
                      </button>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center">
                          <Phone className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        <div className="font-medium text-slate-800 text-xs">{driver.contact.phone}</div>
                      </div>
                    </div>

                    {/* License */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center">
                          <FileText className="w-2.5 h-2.5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-xs">{driver.identification.licenseNumber}</div>
                        </div>
                      </div>
                    </div>

                    {/* License Start Date */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-800 text-xs">
                            {driver.identification?.licenseStart || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expire Date */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-800 text-xs">
                            {driver.identification?.licenseExpiry || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Attached */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-800 text-xs">
                            {driver.assignedVehicles && driver.assignedVehicles.length > 0 ? driver.assignedVehicles[0].vehicleNumber : 'No Vehicle'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Created */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-700 text-xs font-medium">{driver.createdAt}</span>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => handleImageClick(driver)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="View License Document"
                      >
                        <Eye className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
                );
              })
            )}
          </div>

                     {/* Footer Info */}
           <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
             <div className="flex items-center justify-between text-sm">
               <div className="text-slate-600">
                 {viewMode === 'vehicle' ? (
                   <>
                     Showing <span className="font-bold text-slate-800">{processedVehicles.length}</span> of{' '}
                     <span className="font-bold text-slate-800">{totalVehicles}</span> vehicles
                     {Object.keys(filters).length > 0 && (
                       <span className="ml-2 text-orange-600 font-medium">
                         (filtered)
                       </span>
                     )}
                   </>
                 ) : (
                   <>
                     Showing <span className="font-bold text-slate-800">{filteredDrivers.length}</span> of{' '}
                     <span className="font-bold text-slate-800">{totalDrivers}</span> drivers
                   </>
                 )}
               </div>
               <div className="flex items-center gap-4 text-xs">
                 <span className="text-slate-500">
                   <span className="text-orange-600 font-medium">Click</span> vehicle for details •{' '}
                   <span className="text-blue-600 font-medium">Use filters</span> to refine results
                 </span>
               </div>
             </div>
           </div>

        </div>



        {/* Vehicle Details Popup */}
        <AnimatePresence>
          {selectedVehicle && (
            <VehicleDetailsPopup
              vehicle={selectedVehicle}
              onClose={() => setSelectedVehicle(null)}
              onVehicleUpdate={handleVehicleUpdate}
              onRefresh={handleVehicleRefresh}
            />
          )}
        </AnimatePresence>


        {/* Contact Management Modal */}
        <AnimatePresence>
          {showContactModal && selectedVehicleForAction && (
            <ContactManagementModal
              vehicle={selectedVehicleForAction}
              onClose={() => {
                setShowContactModal(false)
                setSelectedVehicleForAction(null)
              }}
              onContactUpdate={handleContactUpdate}
            />
          )}
        </AnimatePresence>

        {/* Driver Assignment Modal */}
        <AnimatePresence>
          {showDriverModal && selectedVehicleForAction && (
            <DriverAssignmentModal
              vehicle={selectedVehicleForAction}
              onClose={() => {
                setShowDriverModal(false)
                setSelectedVehicleForAction(null)
              }}
              onDriverAssigned={(vehicle, driver) => {
                console.log('🎉 Driver assigned:', { vehicle, driver })
                // TODO: Update vehicle list with assigned driver
                // Refresh the vehicle data or update the specific vehicle
                fetchVehicles()
              }}
            />
          )}
        </AnimatePresence>

        {/* Driver Details Modal */}
        <AnimatePresence>
          {selectedDriver && (
            <DriverDetailsModal
              driver={selectedDriver}
              onClose={() => setSelectedDriver(null)}
              onDriverUpdate={handleDriverUpdate}
            />
          )}
        </AnimatePresence>

        {/* Vehicle Form Modal */}
        <AnimatePresence>
          {showVehicleModal && (
            <VehicleFormModal
              isOpen={showVehicleModal}
              onClose={() => setShowVehicleModal(false)}
              onCreateVehicle={createVehicle}
            />
          )}
        </AnimatePresence>

        {/* Driver Form Modal */}
        <AnimatePresence>
          {showDriverFormModal && (
            <DriverFormModal
              isOpen={showDriverFormModal}
              onClose={() => setShowDriverFormModal(false)}
              onCreateDriver={createDriver}
              currentTheme="teal"
            />
          )}
        </AnimatePresence>

        {/* Unified Vehicle + Driver + Contacts Modal */}
        <AnimatePresence>
          {showVehicleDriverModal && (
            <UnifiedVehicleDriverModal
              isOpen={showVehicleDriverModal}
              onClose={() => setShowVehicleDriverModal(false)}
              onSuccess={handleUnifiedFormSuccess}
              currentTheme="teal"
            />
          )}
        </AnimatePresence>

        {/* Image Modal */}
        <AnimatePresence>
          {showImageModal && selectedImageData && (
            <ImageModal
              isOpen={showImageModal}
              onClose={() => {
                setShowImageModal(false)
                setSelectedImageData(null)
              }}
              imageUrl={selectedImageData.imageUrl}
              driverName={selectedImageData.driverName}
              licenseNumber={selectedImageData.licenseNumber}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default MastersTable
