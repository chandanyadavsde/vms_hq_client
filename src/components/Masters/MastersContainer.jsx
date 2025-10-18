import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Filter, Building2, Activity } from 'lucide-react'
import { getThemeColors } from '../../utils/theme.js'
import { BaseModal } from '../common'
import useMasters from './hooks/useMasters.js'
import VehicleService from '../../services/VehicleService.js'
import MastersHeader from './MastersHeader.jsx'
import MastersTabs from './MastersTabs.jsx'
import VehicleGrid from './Vehicle/VehicleGrid.jsx'
import DriverGrid from './Driver/DriverGrid.jsx'
import DriverFormModal from './Driver/DriverForm/DriverFormModal.jsx'
import VehicleFormModal from './Vehicle/VehicleForm/VehicleFormModal.jsx'
import AssignmentModal from './Assignment/AssignmentModal.jsx'
import UnifiedFormModal from './Unified/UnifiedFormModal.jsx'
import VehicleFlowModal from './VehicleFlowModal.jsx'
import VehicleDriverFormModal from './VehicleDriverFormModal.jsx'
import PaginationControls from './PaginationControls.jsx'

const MastersContainer = ({ currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)
  
  // Custom hook for masters data and operations
  const {
    vehicles,
    drivers,
    assignments,
    loading,
    error,
    pagination,
    createDriver,
    createVehicle,
    assignDriver,
    updateVehicle,
    updateDriver,
    deleteVehicle,
    deleteDriver,
    fetchVehicles,
    fetchDrivers,
    fetchAssignments
  } = useMasters()

  // UI State
  const [activeTab, setActiveTab] = useState('vehicles')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlant, setSelectedPlant] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  // Modal State
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showUnifiedModal, setShowUnifiedModal] = useState(false)
  const [showVehicleFlowModal, setShowVehicleFlowModal] = useState(false)
  const [showVehicleDriverModal, setShowVehicleDriverModal] = useState(false)
  
  // Form State
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [editingDriver, setEditingDriver] = useState(null)
  const [selectedVehicleForAssignment, setSelectedVehicleForAssignment] = useState(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
    fetchAssignments()
  }, [])

  // Filtered data based on search and filters
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = searchQuery === '' || 
        vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.plant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.drivers.some(driver => 
          driver.driverName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      
      const matchesPlant = selectedPlant === 'all' || vehicle.plant === selectedPlant
      const matchesStatus = selectedStatus === 'all' || vehicle.status === selectedStatus
      
      return matchesSearch && matchesPlant && matchesStatus
    })
  }, [vehicles, searchQuery, selectedPlant, selectedStatus])

  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const matchesSearch = searchQuery === '' || 
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.contact.phone.includes(searchQuery) ||
        driver.identification.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || driver.status === selectedStatus
      
      return matchesSearch && matchesStatus
    })
  }, [drivers, searchQuery, selectedStatus])

  // Event Handlers

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle)
    setShowVehicleModal(true)
  }

  const handleEditDriver = (driver) => {
    setEditingDriver(driver)
    setShowDriverModal(true)
  }

  const handleAssignDriver = (vehicle) => {
    setSelectedVehicleForAssignment(vehicle)
    setShowAssignmentModal(true)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDrivers(newPage)
    }
  }

  const handleCloseModals = () => {
    setShowVehicleModal(false)
    setShowDriverModal(false)
    setShowAssignmentModal(false)
    setShowUnifiedModal(false)
    setShowVehicleFlowModal(false)
    setShowVehicleDriverModal(false)
    setEditingVehicle(null)
    setEditingDriver(null)
    setSelectedVehicleForAssignment(null)
  }

  // Handle vehicle flow selection
  const handleVehicleFlowSelect = (flow) => {
    setShowVehicleFlowModal(false)
    if (flow === 'vehicle') {
      setShowVehicleModal(true)
    } else if (flow === 'vehicle-driver') {
      setShowVehicleDriverModal(true)
    }
  }

  // Handle vehicle + driver creation
  const handleAddVehicleDriver = () => {
    setShowVehicleDriverModal(true)
  }


  // Get unique plants for filter
  const availablePlants = useMemo(() => {
    const plants = [...new Set(vehicles.map(v => v.plant))]
    return ['all', ...plants]
  }, [vehicles])

  // Get unique statuses for filter
  const availableStatuses = useMemo(() => {
    const statuses = [...new Set([
      ...vehicles.map(v => v.status),
      ...drivers.map(d => d.status)
    ])]
    return ['all', ...statuses]
  }, [vehicles, drivers])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Loading Masters...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-red-200/50 shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchVehicles()
              fetchDrivers()
              fetchAssignments()
            }}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MastersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPlant={selectedPlant}
        onPlantChange={setSelectedPlant}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        availablePlants={availablePlants}
        availableStatuses={availableStatuses}
        onAddNew={() => {
          if (activeTab === 'drivers') {
            setShowDriverModal(true)
          } else {
            setShowVehicleFlowModal(true)
          }
        }}
        onAddVehicleDriver={handleAddVehicleDriver}
        activeTab={activeTab}
        currentTheme={currentTheme}
      />
      

      {/* Tabs */}
      <MastersTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        vehicleCount={filteredVehicles.length}
        driverCount={filteredDrivers.length}
        currentTheme={currentTheme}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'vehicles' && (
            <motion.div
              key="vehicles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VehicleGrid
                vehicles={filteredVehicles}
                onEditVehicle={handleEditVehicle}
                onDeleteVehicle={deleteVehicle}
                onAssignDriver={handleAssignDriver}
                currentTheme={currentTheme}
              />
            </motion.div>
          )}

          {activeTab === 'drivers' && (
            <motion.div
              key="drivers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Top Pagination */}
              {!loading && !error && drivers.length > 0 && (
                <div className="mb-4">
                  <PaginationControls
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalDrivers}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                    position="top"
                    compact={true}
                  />
                </div>
              )}

              <DriverGrid
                drivers={filteredDrivers}
                onEditDriver={handleEditDriver}
                onDeleteDriver={deleteDriver}
                currentTheme={currentTheme}
              />

              {/* Bottom Pagination */}
              {!loading && !error && drivers.length > 0 && (
                <div className="mt-4">
                  <PaginationControls
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalDrivers}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                    position="bottom"
                    compact={false}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Link className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Assignment Management</h3>
                <p className={`text-lg mb-8 ${themeColors.accentText}`}>
                  Manage vehicle-driver assignments and relationships
                </p>
                <p className="text-white/60">Coming Soon...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      {/* Vehicle Form Modal */}
      <VehicleFormModal
        isOpen={showVehicleModal}
        onClose={handleCloseModals}
        vehicle={editingVehicle}
        onCreateVehicle={createVehicle}
        onUpdateVehicle={updateVehicle}
        currentTheme={currentTheme}
      />

      {/* Driver Form Modal */}
      <DriverFormModal
        isOpen={showDriverModal}
        onClose={handleCloseModals}
        driver={editingDriver}
        onCreateDriver={createDriver}
        onUpdateDriver={updateDriver}
        currentTheme={currentTheme}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={handleCloseModals}
        vehicle={selectedVehicleForAssignment}
        drivers={drivers}
        onAssignDriver={assignDriver}
        currentTheme={currentTheme}
      />

      {/* Unified Form Modal */}
      <UnifiedFormModal
        isOpen={showUnifiedModal}
        onClose={handleCloseModals}
        onCreateDriver={createDriver}
        currentTheme={currentTheme}
      />

      {/* Vehicle Flow Selection Modal */}
      <VehicleFlowModal
        isOpen={showVehicleFlowModal}
        onClose={handleCloseModals}
        onFlowSelect={handleVehicleFlowSelect}
        currentTheme={currentTheme}
      />

      {/* Vehicle + Driver Form Modal */}
      <VehicleDriverFormModal
        isOpen={showVehicleDriverModal}
        onClose={handleCloseModals}
        onCreateVehicle={createVehicle}
        onCreateDriver={createDriver}
        currentTheme={currentTheme}
      />
    </div>
  )
}

export default MastersContainer
