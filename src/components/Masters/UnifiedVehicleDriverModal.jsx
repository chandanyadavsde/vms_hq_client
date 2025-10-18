import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Car, 
  User, 
  Phone,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react'
import VehicleFormModal from './Vehicle/VehicleForm/VehicleFormModal.jsx'
import DriverFormModal from './Driver/DriverForm/DriverFormModal.jsx'
import ContactManagementModal from './ContactManagementModal.jsx'
import VehicleService from '../../services/VehicleService.js'
import DriverService from '../../services/DriverService.js'

const UnifiedVehicleDriverModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentTheme = 'teal'
}) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Data storage between steps
  const [createdVehicle, setCreatedVehicle] = useState(null)
  const [createdDriver, setCreatedDriver] = useState(null)
  const [contactPersons, setContactPersons] = useState([])

  // Modal states for each step
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setCompletedSteps([])
      setCreatedVehicle(null)
      setCreatedDriver(null)
      setContactPersons([])
      setError('')
      setSuccess('')
    }
  }, [isOpen])

  // Step navigation
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Step indicator component
  const StepIndicator = ({ step, title, icon: Icon, isCompleted, isCurrent }) => {
    return (
      <div className={`flex items-center ${isCompleted || isCurrent ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          isCompleted 
            ? 'bg-green-500 border-green-500 text-white' 
            : isCurrent 
            ? 'bg-orange-500 border-orange-500 text-white'
            : 'bg-white border-slate-300 text-slate-400'
        }`}>
          {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        <div className="ml-3">
          <div className={`text-sm font-medium ${
            isCurrent ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-slate-500'
          }`}>
            {title}
          </div>
        </div>
      </div>
    )
  }

  // Handle vehicle creation
  const handleVehicleCreated = (vehicle) => {
    console.log('✅ Vehicle created:', vehicle)
    setCreatedVehicle(vehicle)
    setCompletedSteps(prev => [...prev, 1])
    setShowVehicleModal(false)
    nextStep() // Move to Step 2 after vehicle creation
  }

  // Handle driver creation - wrapper function that calls API
  const handleDriverCreation = async (driverData) => {
    try {
      setLoading(true)
      setError('')
      console.log('🚀 Creating driver with data:', driverData)
      
      // Call the actual API to create the driver
      const createdDriver = await DriverService.createDriver(driverData)
      console.log('✅ Driver created successfully:', createdDriver)
      
      // Pass the created driver object to handleDriverCreated
      handleDriverCreated(createdDriver)
    } catch (error) {
      console.error('❌ Error creating driver:', error)
      const errorMessage = error.message || error.toString() || 'Unknown error'
      setError('Failed to create driver: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle driver creation callback
  const handleDriverCreated = (driver) => {
    console.log('✅ Driver created:', driver)
    setCreatedDriver(driver)
    setShowDriverModal(false)
    
    // Assign driver to vehicle
    if (createdVehicle) {
      assignDriverToVehicle(driver)
    } else {
      setCompletedSteps(prev => [...prev, 2])
    }
  }

  // Assign driver to vehicle
  const assignDriverToVehicle = async (driver) => {
    try {
      setLoading(true)
      console.log('🔗 Assigning driver to vehicle:', { 
        vehicleNumber: createdVehicle.custrecord_vehicle_number, 
        driver: driver
      })
      
      // Get driver ID from the created driver object
      const driverId = driver._id || driver.id
      
      if (!driverId) {
        throw new Error('Driver ID not found in driver object')
      }
      
      console.log('🔍 Driver ID found:', driverId)
      
      // Add a small delay to ensure driver is fully created in database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Use VehicleService.assignDriver which handles the license number extraction
      await VehicleService.assignDriver(createdVehicle.custrecord_vehicle_number, driverId)
      
      console.log('✅ Driver assigned to vehicle successfully')
      setCompletedSteps(prev => [...prev, 2])
      nextStep() // Move to Step 3 after driver assignment
    } catch (error) {
      console.error('❌ Error assigning driver to vehicle:', error)
      const errorMessage = error.message || error.toString() || 'Unknown error'
      setError('Failed to assign driver to vehicle: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle contact management
  const handleContactUpdate = (vehicleNumber, updatedVehicle) => {
    console.log('✅ Contacts updated:', updatedVehicle)
    setContactPersons(updatedVehicle.contactPersons || [])
  }

  // Handle final completion
  const handleComplete = () => {
    setSuccess('Vehicle, driver, and contacts created successfully!')
    
    // Notify parent component with created data
    if (onSuccess && createdVehicle) {
      onSuccess({
        vehicle: createdVehicle,
        driver: createdDriver,
        contacts: contactPersons
      })
    }
    
    setTimeout(() => {
      handleClose()
    }, 2000)
  }

  const handleClose = () => {
    setCurrentStep(1)
    setCompletedSteps([])
    setCreatedVehicle(null)
    setCreatedDriver(null)
    setContactPersons([])
    setError('')
    setSuccess('')
    setShowVehicleModal(false)
    setShowDriverModal(false)
    setShowContactModal(false)
    onClose()
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Car className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Step 1: Create Vehicle</h3>
                <p className="text-slate-600 text-sm">First, let's create the vehicle details</p>
              </div>
            </div>

            {createdVehicle ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Vehicle Created Successfully!</p>
                    <p className="text-green-700 text-sm">Vehicle Number: {createdVehicle.custrecord_vehicle_number}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Ready to Create Vehicle</h4>
                <p className="text-slate-600 mb-4">Click the button below to open the vehicle creation form</p>
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Car className="w-4 h-4" />
                  Create Vehicle
                </button>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Step 2: Create Driver</h3>
                <p className="text-slate-600 text-sm">Now, let's create the driver and assign them to the vehicle</p>
              </div>
            </div>

            {createdDriver ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Driver Created & Assigned Successfully!</p>
                    <p className="text-green-700 text-sm">Driver: {createdDriver.custrecord_driver_name}</p>
                    <p className="text-green-700 text-sm">Vehicle: {createdVehicle?.custrecord_vehicle_number}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Ready to Create Driver</h4>
                <p className="text-slate-600 mb-4">Click the button below to open the driver creation form</p>
                <button
                  onClick={() => setShowDriverModal(true)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <User className="w-4 h-4" />
                  Create Driver
                </button>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assigning driver to vehicle...</span>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Step 3: Add Contacts (Optional)</h3>
                <p className="text-slate-600 text-sm">Finally, add secondary drivers and emergency contacts</p>
              </div>
            </div>

            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">Manage Contacts (Optional)</h4>
              <p className="text-slate-600 mb-4">Add secondary drivers and emergency contacts for this vehicle</p>
              <button
                onClick={() => setShowContactModal(true)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Phone className="w-4 h-4" />
                Manage Contacts
              </button>
            </div>

            {contactPersons.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h5 className="font-medium text-slate-800 mb-2">Current Contacts ({contactPersons.length})</h5>
                <div className="space-y-2">
                  {contactPersons.map((contact, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className={`w-2 h-2 rounded-full ${
                        contact.type === 'secondary_driver' ? 'bg-blue-500' : 'bg-orange-500'
                      }`} />
                      <span>{contact.name}</span>
                      <span className="text-slate-400">•</span>
                      <span>{contact.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal Content - Full Screen */}
        <motion.div
          className="relative bg-white rounded-lg w-full h-full max-w-none max-h-none m-4 border border-slate-200 shadow-lg flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Car className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Create Vehicle + Driver + Contacts</h2>
                <p className="text-slate-600 text-sm">Complete all steps to create vehicle with driver and contacts</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <StepIndicator 
                step={1} 
                title="Vehicle Details" 
                icon={Car} 
                isCompleted={completedSteps.includes(1)}
                isCurrent={currentStep === 1}
              />
              <ArrowRight className="w-4 h-4 text-slate-400 mx-4" />
              <StepIndicator 
                step={2} 
                title="Driver Details" 
                icon={User} 
                isCompleted={completedSteps.includes(2)}
                isCurrent={currentStep === 2}
              />
              <ArrowRight className="w-4 h-4 text-slate-400 mx-4" />
              <StepIndicator 
                step={3} 
                title="Contact Persons" 
                icon={Phone} 
                isCompleted={completedSteps.includes(3)}
                isCurrent={currentStep === 3}
              />
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {currentStep === 3 ? (
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!completedSteps.includes(currentStep)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Individual Modals */}
      <VehicleFormModal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        onCreateVehicle={handleVehicleCreated}
        currentTheme={currentTheme}
      />

      <DriverFormModal
        isOpen={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        onCreateDriver={handleDriverCreation}
        currentTheme={currentTheme}
      />

      {showContactModal && createdVehicle && (
        <ContactManagementModal
          vehicle={{
            ...createdVehicle,
            vehicleNumber: createdVehicle.custrecord_vehicle_number
          }}
          onClose={() => setShowContactModal(false)}
          onContactUpdate={handleContactUpdate}
        />
      )}
    </>
  )
}

export default UnifiedVehicleDriverModal
