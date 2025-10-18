import { useState, useEffect, useCallback } from 'react'
import VehicleService from '../../../services/VehicleService.js'
import DriverService from '../../../services/DriverService.js'

const useMasters = () => {
  // State
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDrivers: 0,
    limit: 20,
    hasNext: false,
    hasPrev: false
  })

  // Mock data for development
  const mockVehicles = [
    {
      id: 'VH001',
      vehicleNumber: 'MH01AB1234',
      plant: 'Mumbai North',
      status: 'Active',
      type: 'Truck',
      specifications: {
        make: 'Tata',
        model: 'Ace',
        year: 2023,
        color: 'White',
        engineNumber: 'ENG001',
        chassisNumber: 'CHS001'
      },
      drivers: [
        {
          driverId: 'D001',
          driverName: 'John Doe',
          type: 'Primary',
          status: 'Active',
          assignedDate: '2024-01-15'
        },
        {
          driverId: 'D002',
          driverName: 'Jane Smith',
          type: 'Backup',
          status: 'Active',
          assignedDate: '2024-01-20'
        }
      ],
      otherPersonnel: [
        {
          personId: 'P001',
          personName: 'Mike Wilson',
          role: 'Mechanic',
          status: 'Active',
          assignedDate: '2024-01-10'
        }
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: 'VH002',
      vehicleNumber: 'MH02CD5678',
      plant: 'Mumbai South',
      status: 'Maintenance',
      type: 'Van',
      specifications: {
        make: 'Mahindra',
        model: 'Bolero',
        year: 2022,
        color: 'Blue',
        engineNumber: 'ENG002',
        chassisNumber: 'CHS002'
      },
      drivers: [
        {
          driverId: 'D003',
          driverName: 'Bob Johnson',
          type: 'Primary',
          status: 'Active',
          assignedDate: '2024-01-05'
        }
      ],
      otherPersonnel: [],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-10'
    }
  ]

  const mockDrivers = [
    {
      id: 'D001',
      name: 'John Doe',
      contact: {
        phone: '+91 98765 43210',
        email: 'john.doe@example.com',
        address: 'Mumbai, Maharashtra'
      },
      identification: {
        licenseNumber: 'DL123456789',
        licenseType: 'Heavy Vehicle',
        licenseExpiry: '2025-12-31',
        aadharNumber: '1234 5678 9012',
        panNumber: 'ABCDE1234F'
      },
      documents: [
        {
          id: 'DOC001',
          type: 'License',
          url: '/documents/license.pdf',
          expiryDate: '2025-12-31',
          status: 'Valid'
        }
      ],
      status: 'Active',
      assignedVehicles: [
        {
          vehicleId: 'VH001',
          vehicleNumber: 'MH01AB1234',
          type: 'Primary',
          status: 'Active',
          assignedDate: '2024-01-15'
        }
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: 'D002',
      name: 'Jane Smith',
      contact: {
        phone: '+91 98765 43211',
        email: 'jane.smith@example.com',
        address: 'Mumbai, Maharashtra'
      },
      identification: {
        licenseNumber: 'DL123456790',
        licenseType: 'Heavy Vehicle',
        licenseExpiry: '2026-06-30',
        aadharNumber: '1234 5678 9013',
        panNumber: 'ABCDE1235F'
      },
      documents: [
        {
          id: 'DOC002',
          type: 'License',
          url: '/documents/license2.pdf',
          expiryDate: '2026-06-30',
          status: 'Valid'
        }
      ],
      status: 'Active',
      assignedVehicles: [
        {
          vehicleId: 'VH001',
          vehicleNumber: 'MH01AB1234',
          type: 'Backup',
          status: 'Active',
          assignedDate: '2024-01-20'
        }
      ],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-20'
    }
  ]

  // API Functions
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching vehicles from API...')
      const response = await VehicleService.getAllVehicles()
      
      console.log('📥 Vehicles fetched successfully:', response)
      setVehicles(response.vehicles || [])
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch vehicles'
      setError(errorMessage)
      console.error('❌ Error fetching vehicles:', err)
      
      // Fallback to mock data if API fails
      console.log('🔄 Using mock data as fallback...')
      setVehicles(mockVehicles)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDrivers = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching drivers from API...')
      const response = await DriverService.getAllDrivers({ page, limit: 20 })
      
      console.log('📥 Drivers fetched successfully:', response)
      setDrivers(response.drivers || [])
      setPagination(response.pagination || pagination)
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch drivers'
      setError(errorMessage)
      console.error('❌ Error fetching drivers:', err)
      
      // Fallback to mock data if API fails
      console.log('🔄 Using mock data as fallback...')
      setDrivers(mockDrivers)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, use mock data
      // In production, this would be: const response = await apiService.get('/assignments')
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay
      setAssignments([]) // Will be populated from vehicle-driver relationships
    } catch (err) {
      setError('Failed to fetch assignments')
      console.error('Error fetching assignments:', err)
    } finally {
      setLoading(false)
    }
  }, [])


  const createDriver = useCallback(async (driverData) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Creating driver with data:', driverData)
      const response = await DriverService.createDriver(driverData)
      
      console.log('✅ Driver created successfully:', response)
      
      // Refresh the driver list
      await fetchDrivers()
      
      return response.driver
    } catch (err) {
      const errorMessage = err.message || 'Failed to create driver'
      setError(errorMessage)
      console.error('❌ Error creating driver:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchDrivers])

  const createVehicle = useCallback(async (vehicleData) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Creating vehicle with data:', vehicleData)
      const response = await VehicleService.createVehicle(vehicleData)
      
      console.log('✅ Vehicle created successfully:', response)
      
      // Refresh the vehicle list
      await fetchVehicles()
      
      return response.vehicle || response
    } catch (err) {
      const errorMessage = err.message || 'Failed to create vehicle'
      setError(errorMessage)
      console.error('❌ Error creating vehicle:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchVehicles])

  const updateVehicle = useCallback(async (vehicleNumber, patchData) => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Updating vehicle:', vehicleNumber, patchData)
      
      // Use real API with PATCH
      const response = await VehicleService.updateVehicle(vehicleNumber, patchData)
      console.log('✅ Vehicle updated successfully:', response)
      
      // Refresh the vehicle data after successful update
      await fetchVehicles()
      
      return response
    } catch (err) {
      const errorMessage = err.message || 'Failed to update vehicle'
      setError(errorMessage)
      console.error('❌ Error updating vehicle:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchVehicles])

  const updateDriver = useCallback(async (driverId, driverData) => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, use mock data
      // In production, this would be: const response = await apiService.put(`/drivers/${driverId}`, driverData)
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, ...driverData, updatedAt: new Date().toISOString().split('T')[0] }
          : driver
      ))
    } catch (err) {
      setError('Failed to update driver')
      console.error('Error updating driver:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteVehicle = useCallback(async (vehicleId) => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, use mock data
      // In production, this would be: const response = await apiService.delete(`/vehicles/${vehicleId}`)
      await new Promise(resolve => setTimeout(resolve, 600)) // Simulate API delay
      
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId))
    } catch (err) {
      setError('Failed to delete vehicle')
      console.error('Error deleting vehicle:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteDriver = useCallback(async (driverId) => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, use mock data
      // In production, this would be: const response = await apiService.delete(`/drivers/${driverId}`)
      await new Promise(resolve => setTimeout(resolve, 600)) // Simulate API delay
      
      setDrivers(prev => prev.filter(driver => driver.id !== driverId))
    } catch (err) {
      setError('Failed to delete driver')
      console.error('Error deleting driver:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const assignDriver = useCallback(async (vehicleId, driverId, assignmentData) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Assigning driver to vehicle:', { vehicleId, driverId, assignmentData })
      
      // Find the vehicle and driver data
      const vehicle = vehicles.find(v => v.id === vehicleId)
      const driver = drivers.find(d => d.id === driverId)
      
      if (!vehicle || !driver) {
        throw new Error('Vehicle or driver not found')
      }
      
      // Use the real API to assign driver
      const response = await DriverService.assignDriverToVehicle(
        vehicle.vehicleNumber || vehicle.custrecord_vehicle_number,
        driverId
      )
      
      console.log('✅ Driver assignment successful:', response)
      
      // Refresh the vehicle data to get updated driver information
      await fetchVehicles()
      
      return response
    } catch (err) {
      const errorMessage = err.message || 'Failed to assign driver'
      setError(errorMessage)
      console.error('❌ Error assigning driver:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [drivers, vehicles, fetchVehicles])

  return {
    // Data
    vehicles,
    drivers,
    assignments,
    
    // State
    loading,
    error,
    pagination,
    
    // Actions
    fetchVehicles,
    fetchDrivers,
    fetchAssignments,
    createDriver,
    createVehicle,
    updateVehicle,
    updateDriver,
    deleteVehicle,
    deleteDriver,
    assignDriver
  }
}

export default useMasters
