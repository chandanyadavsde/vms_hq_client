import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Car, Users, Save, ArrowLeft, ArrowRight, Link } from 'lucide-react'
import { BaseModal } from '../../common'
import VehicleBasicInfo from '../Vehicle/VehicleForm/VehicleBasicInfo.jsx'
import VehicleTechnical from '../Vehicle/VehicleForm/VehicleTechnical.jsx'
import VehicleDocuments from '../Vehicle/VehicleForm/VehicleDocuments.jsx'
import VehicleAssignment from '../Vehicle/VehicleForm/VehicleAssignment.jsx'
import DriverBasicInfo from '../Driver/DriverForm/DriverBasicInfo.jsx'
import DriverLicense from '../Driver/DriverForm/DriverLicense.jsx'

const UnifiedFormModal = ({
  isOpen,
  onClose,
  onCreateVehicle,
  onCreateDriver,
  currentTheme = 'teal'
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [vehicleData, setVehicleData] = useState({
    vehicleNumber: '',
    plant: '',
    status: 'Active',
    type: 'Truck',
    specifications: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      engineNumber: '',
      chassisNumber: ''
    },
    documents: [],
    drivers: [],
    otherPersonnel: []
  })

  const [driverData, setDriverData] = useState({
    name: '',
    contact: {
      phone: '',
      email: '',
      address: ''
    },
    identification: {
      licenseNumber: '',
      licenseType: 'Heavy Vehicle',
      licenseExpiry: '',
      aadharNumber: '',
      panNumber: ''
    },
    documents: [],
    status: 'Active',
    assignedVehicles: []
  })

  const totalSteps = 6

  // Reset form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setVehicleData({
        vehicleNumber: '',
        plant: '',
        status: 'Active',
        type: 'Truck',
        specifications: {
          make: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
          engineNumber: '',
          chassisNumber: ''
        },
        documents: [],
        drivers: [],
        otherPersonnel: []
      })
      setDriverData({
        name: '',
        contact: {
          phone: '',
          email: '',
          address: ''
        },
        identification: {
          licenseNumber: '',
          licenseType: 'Heavy Vehicle',
          licenseExpiry: '',
          aadharNumber: '',
          panNumber: ''
        },
        documents: [],
        status: 'Active',
        assignedVehicles: []
      })
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Step 1: Create the vehicle first
      const createdVehicle = await onCreateVehicle(vehicleData)
      
      // Step 2: Add the vehicle assignment to driver data
      const updatedDriverData = {
        ...driverData,
        assignedVehicles: [{
          vehicleId: createdVehicle?.id || `temp_${Date.now()}`,
          vehicleNumber: vehicleData.vehicleNumber,
          type: 'Primary',
          status: 'Active',
          assignedDate: new Date().toISOString().split('T')[0]
        }]
      }
      
      // Step 3: Create the driver with vehicle assignment
      const createdDriver = await onCreateDriver(updatedDriverData)
      
      // Step 4: Update vehicle with driver assignment (if needed)
      const driverAssignment = {
        id: `temp_${Date.now()}`,
        driverId: createdDriver?.id || `temp_${Date.now()}`,
        driverName: driverData.name,
        type: 'Primary',
        status: 'Active',
        assignedDate: new Date().toISOString().split('T')[0]
      }
      
      // Add driver to vehicle's driver list if not already included
      if (!vehicleData.drivers.some(d => d.driverName === driverData.name)) {
        vehicleData.drivers.push(driverAssignment)
      }
      
      onClose()
    } catch (error) {
      console.error('Error creating vehicle and driver:', error)
    }
  }

  const updateVehicleData = (updates) => {
    setVehicleData(prev => ({ ...prev, ...updates }))
  }

  const updateDriverData = (updates) => {
    setDriverData(prev => ({ ...prev, ...updates }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VehicleBasicInfo
            formData={vehicleData}
            setFormData={updateVehicleData}
            currentTheme={currentTheme}
          />
        )
      case 2:
        return (
          <VehicleTechnical
            formData={vehicleData}
            setFormData={updateVehicleData}
            currentTheme={currentTheme}
          />
        )
      case 3:
        return (
          <VehicleDocuments
            formData={vehicleData}
            setFormData={updateVehicleData}
            currentTheme={currentTheme}
          />
        )
      case 4:
        return (
          <VehicleAssignment
            formData={vehicleData}
            setFormData={updateVehicleData}
            currentTheme={currentTheme}
          />
        )
      case 5:
        return (
          <DriverBasicInfo
            formData={driverData}
            setFormData={updateDriverData}
            currentTheme={currentTheme}
          />
        )
      case 6:
        return (
          <DriverLicense
            formData={driverData}
            setFormData={updateDriverData}
            currentTheme={currentTheme}
          />
        )
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Vehicle - Basic Information'
      case 2:
        return 'Vehicle - Technical Specifications'
      case 3:
        return 'Vehicle - Documents'
      case 4:
        return 'Vehicle - Assignments'
      case 5:
        return 'Driver - Basic Information'
      case 6:
        return 'Driver - License & Documents'
      default:
        return 'Unified Creation'
    }
  }

  const getStepIcon = () => {
    if (currentStep <= 4) {
      return <Car className="w-5 h-5" />
    } else {
      return <Users className="w-5 h-5" />
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return vehicleData.vehicleNumber && vehicleData.plant && vehicleData.type
      case 2:
        return vehicleData.specifications.make && vehicleData.specifications.model
      case 3:
        return true // Documents are optional
      case 4:
        return true // Assignments are optional
      case 5:
        return driverData.name && driverData.contact.phone
      case 6:
        return driverData.identification.licenseNumber && 
               driverData.identification.licenseType && 
               driverData.identification.licenseExpiry
      default:
        return false
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          {getStepIcon()}
          <span>Create Vehicle + Driver - {getStepTitle()}</span>
        </div>
      }
      maxWidth="max-w-4xl"
      height="h-[90vh]"
    >
      <div className="flex flex-col h-full">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step <= currentStep
                    ? step <= 4 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 6 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-all ${
                    step < currentStep 
                      ? step < 4 
                        ? 'bg-orange-500' 
                        : 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Phase Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep <= 4 
                ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <Car className="w-4 h-4" />
              <span className="text-sm font-medium">Vehicle Creation</span>
              <span className="text-xs bg-white px-2 py-1 rounded-full">
                Steps 1-4
              </span>
            </div>
            
            <div className="w-8 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep > 4 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Driver Creation</span>
              <span className="text-xs bg-white px-2 py-1 rounded-full">
                Steps 5-6
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <motion.button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
            whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>

            {currentStep < totalSteps ? (
              <motion.button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${
                  isStepValid()
                    ? currentStep <= 4
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={isStepValid() ? { scale: 1.02 } : {}}
                whileTap={isStepValid() ? { scale: 0.98 } : {}}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${
                  isStepValid()
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={isStepValid() ? { scale: 1.02 } : {}}
                whileTap={isStepValid() ? { scale: 0.98 } : {}}
              >
                <Link className="w-4 h-4" />
                Create Vehicle + Driver
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

export default UnifiedFormModal
