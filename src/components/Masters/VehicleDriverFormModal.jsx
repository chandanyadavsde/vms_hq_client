import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Car, 
  User, 
  Settings, 
  FileText, 
  Upload, 
  Shield, 
  FileCheck, 
  Truck,
  Hash,
  Building,
  Save,
  Eye,
  Download,
  AlertCircle,
  Link,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Phone,
  Trash2
} from 'lucide-react'
import VehicleDriverService from '../../services/VehicleDriverService.js'
import useDateValidation from '../../hooks/useDateValidation.js'
import { getModalAnimation } from '../../utils/modalAnimations.js'

const VehicleDriverFormModal = ({
  isOpen,
  onClose,
  onCreateVehicle,
  onCreateDriver,
  currentTheme = 'teal'
}) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  // Date validation hook for vehicle documents
  const {
    dateValidation,
    updateStartDate,
    updateEndDate,
    getMinEndDate,
    isAllValid,
    getAllErrors,
    resetAllValidations
  } = useDateValidation()

  // Driver date validation state
  const [driverDateValidation, setDriverDateValidation] = useState({
    licenseExpiry: {
      isValid: true,
      error: ''
    }
  })

  // Form data state
  const [formData, setFormData] = useState({
    // Vehicle Information
    vehicle: {
      custrecord_vehicle_number: '',
      custrecord_vehicle_type_ag: '',
      custrecord_vehicle_name_ag: '',
      currentPlant: 'daman',
      operationalStatus: 'available',
      statusMeta: {
        plant: 'daman',
        eta: '',
        ata: '',
        notes: ''
      },
      custrecord_owner_name_ag: '',
      custrecord_owner_no_ag: '',
      custrecord_chassis_number: '',
      custrecord_engine_number_ag: '',
      custrecord_vehicle_master_gps_available: false,
      custrecord_rc_no: '',
      custrecord_rc_start_date: '',
      custrecord_rc_end_date: '',
      custrecord_rc_doc_attach: [],
      custrecord_insurance_company_name_ag: '',
      custrecord_insurance_number_ag: '',
      custrecord_insurance_start_date_ag: '',
      custrecord_insurance_end_date_ag: '',
      custrecord_insurance_attachment_ag: [],
      custrecord_permit_number_ag: '',
      custrecord_permit_start_date: '',
      custrecord_permit_end_date: '',
      custrecord_permit_attachment_ag: [],
      custrecord_puc_number: '',
      custrecord_puc_start_date_ag: '',
      custrecord_puc_end_date_ag: '',
      custrecord_puc_attachment_ag: [],
      custrecord_tms_vehicle_fit_cert_vld_upto: '',
      custrecord_vehicle_fit_cert_attachment_ag: [],
      custrecord_create_by: 'admin',
      approved_by_hq: 'pending'
    },
    // Driver Information
    driver: {
      custrecord_driver_name: '',
      custrecord_driving_license_no: '',
      custrecord_driving_license_s_date: '',
      custrecord_driver_license_e_date: '',
      custrecord_license_category_ag: 'Light Motor Vehicle',
      custrecord_driver_mobile_no: '',
      custrecord_driving_lca_test: 'passed',
      custrecord_create_by_driver_master: 'admin',
      custrecord_driving_license_attachment: [],
      custrecord_driver_photo_ag: ''
    },
    // Contact Persons
    contactPersons: []
  })

  // File upload state
  const [files, setFiles] = useState({
    vehicle: {},
    driver: {}
  })

  // Get user email from localStorage
  const getUserEmail = () => {
    try {
      const storedUser = localStorage.getItem('vms_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        return userData.email || 'admin'
      }
    } catch (error) {
      console.error('Error parsing vms_user from localStorage:', error)
    }
    return 'admin'
  }

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      const userEmail = getUserEmail()
      setFormData(prev => ({
        ...prev,
        vehicle: {
          ...prev.vehicle,
          custrecord_create_by: userEmail
        },
        driver: {
          ...prev.driver,
          custrecord_create_by_driver_master: userEmail
        }
      }))
    }
  }, [isOpen])

  // Step validation functions
  const validateVehicleStep = () => {
    const vehicle = formData.vehicle
    const errors = {}

    if (!vehicle.custrecord_vehicle_number) errors.vehicleNumber = 'Vehicle number is required'
    if (!vehicle.custrecord_vehicle_type_ag) errors.vehicleType = 'Vehicle type is required'
    if (!vehicle.custrecord_vehicle_name_ag) errors.vehicleName = 'Vehicle name is required'
    if (!vehicle.custrecord_chassis_number) errors.chassisNumber = 'Chassis number is required'
    if (!vehicle.custrecord_engine_number_ag) errors.engineNumber = 'Engine number is required'
    if (!vehicle.custrecord_owner_name_ag) errors.ownerName = 'Owner name is required'
    if (!vehicle.custrecord_owner_no_ag) errors.ownerNumber = 'Owner number is required'

    // ETA validation for inbound status
    if (vehicle.operationalStatus === 'inbound') {
      if (!vehicle.statusMeta.eta) {
        errors.eta = 'ETA is required for inbound status'
      } else if (new Date(vehicle.statusMeta.eta) <= new Date()) {
        errors.eta = 'ETA must be in the future'
      }
    }

    setErrors(prev => ({ ...prev, vehicle: errors }))
    return Object.keys(errors).length === 0
  }

  const validateDriverStep = () => {
    const driver = formData.driver
    const errors = {}

    if (!driver.custrecord_driver_name) errors.driverName = 'Driver name is required'
    if (!driver.custrecord_driving_license_no) errors.licenseNumber = 'License number is required'
    if (!driver.custrecord_driving_license_s_date) errors.licenseStartDate = 'License start date is required'
    if (!driver.custrecord_driver_license_e_date) errors.licenseEndDate = 'License end date is required'
    if (!driver.custrecord_driver_mobile_no) errors.mobileNumber = 'Mobile number is required'

    setErrors(prev => ({ ...prev, driver: errors }))
    return Object.keys(errors).length === 0
  }

  // Step navigation
  const nextStep = () => {
    if (currentStep === 1) {
      if (validateVehicleStep()) {
        setCompletedSteps(prev => [...prev, 1])
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateDriverStep()) {
        setCompletedSteps(prev => [...prev, 2])
        setCurrentStep(3)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Contact person management
  const addContactPerson = (contact) => {
    setFormData(prev => ({
      ...prev,
      contactPersons: [...prev.contactPersons, {
        ...contact,
        id: Date.now() + Math.random(),
        addedDate: new Date().toISOString()
      }]
    }))
  }

  const removeContactPerson = (contactId) => {
    setFormData(prev => ({
      ...prev,
      contactPersons: prev.contactPersons.filter(contact => contact.id !== contactId)
    }))
  }

  // Form submission
  const handleSubmit = async () => {
    setLoading(true)
    setErrors({})
    setSuccess('')

    try {
      // Prepare the data for the API
      const submitData = {
        ...formData.vehicle,
        driver: formData.driver,
        contactPersons: formData.contactPersons
      }

      console.log('🚀 Submitting vehicle + driver + contacts:', submitData)

      const result = await VehicleDriverService.createVehicleWithDriver(submitData, files)
      
      setSuccess('Vehicle, driver, and contacts created successfully!')
      
      // Notify parent components
      if (onCreateVehicle) onCreateVehicle(result.vehicle)
      if (onCreateDriver) onCreateDriver(result.driver)

      // Close modal after success
      setTimeout(() => {
        handleClose()
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error creating vehicle + driver:', error)
      setErrors({ submit: error.message || 'Failed to create vehicle and driver' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setCompletedSteps([])
    setErrors({})
    setSuccess('')
    setFormData({
      vehicle: {
        custrecord_vehicle_number: '',
        custrecord_vehicle_type_ag: '',
        custrecord_vehicle_name_ag: '',
        currentPlant: 'daman',
        operationalStatus: 'available',
        statusMeta: { plant: 'daman', eta: '', ata: '', notes: '' },
        custrecord_owner_name_ag: '',
        custrecord_owner_no_ag: '',
        custrecord_chassis_number: '',
        custrecord_engine_number_ag: '',
        custrecord_vehicle_master_gps_available: false,
        custrecord_rc_no: '',
        custrecord_rc_start_date: '',
        custrecord_rc_end_date: '',
        custrecord_rc_doc_attach: [],
        custrecord_insurance_company_name_ag: '',
        custrecord_insurance_number_ag: '',
        custrecord_insurance_start_date_ag: '',
        custrecord_insurance_end_date_ag: '',
        custrecord_insurance_attachment_ag: [],
        custrecord_permit_number_ag: '',
        custrecord_permit_start_date: '',
        custrecord_permit_end_date: '',
        custrecord_permit_attachment_ag: [],
        custrecord_puc_number: '',
        custrecord_puc_start_date_ag: '',
        custrecord_puc_end_date_ag: '',
        custrecord_puc_attachment_ag: [],
        custrecord_tms_vehicle_fit_cert_vld_upto: '',
        custrecord_vehicle_fit_cert_attachment_ag: [],
        custrecord_create_by: getUserEmail(),
        approved_by_hq: 'pending'
      },
        driver: {
        custrecord_driver_name: '',
        custrecord_driving_license_no: '',
        custrecord_driving_license_s_date: '',
        custrecord_driver_license_e_date: '',
        custrecord_license_category_ag: 'Light Motor Vehicle',
        custrecord_driver_mobile_no: '',
        custrecord_driving_lca_test: 'passed',
        custrecord_create_by_driver_master: getUserEmail(),
          custrecord_driving_license_attachment: [],
        custrecord_driver_photo_ag: ''
      },
      contactPersons: []
    })
    setFiles({ vehicle: {}, driver: {} })
    onClose()
  }

  // Step indicator component
  const StepIndicator = ({ step, title, icon: Icon }) => {
    const isCompleted = completedSteps.includes(step)
    const isCurrent = currentStep === step
    const isAccessible = step <= currentStep || completedSteps.includes(step - 1)

    return (
      <div className={`flex items-center ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
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
              <Truck className="w-5 h-5 text-orange-600" />
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
            <StepIndicator step={1} title="Vehicle Details" icon={Car} />
            <ArrowRight className="w-4 h-4 text-slate-400 mx-4" />
            <StepIndicator step={2} title="Driver Details" icon={User} />
            <ArrowRight className="w-4 h-4 text-slate-400 mx-4" />
            <StepIndicator step={3} title="Contact Persons" icon={Phone} />
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
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
              <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 text-sm">{errors.submit}</p>
                </div>
          </motion.div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VehicleStep 
                  formData={formData.vehicle}
                  setFormData={(data) => setFormData(prev => ({ ...prev, vehicle: data }))}
                  errors={errors.vehicle || {}}
                  files={files.vehicle}
                  setFiles={(data) => setFiles(prev => ({ ...prev, vehicle: data }))}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DriverStep 
                  formData={formData.driver}
                  setFormData={(data) => setFormData(prev => ({ ...prev, driver: data }))}
                  errors={errors.driver || {}}
                  files={files.driver}
                  setFiles={(data) => setFiles(prev => ({ ...prev, driver: data }))}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ContactStep 
                  contactPersons={formData.contactPersons}
                  addContactPerson={addContactPerson}
                  removeContactPerson={removeContactPerson}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create All
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Vehicle Step Component
const VehicleStep = ({ formData, setFormData, errors, files, setFiles }) => {
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <Car className="w-4 h-4 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Vehicle Information</h3>
          <p className="text-slate-600 text-sm">Enter vehicle details and specifications</p>
        </div>
      </div>

      {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vehicle Number *
                      </label>
                      <input
                        type="text"
            value={formData.custrecord_vehicle_number}
            onChange={(e) => handleInputChange('custrecord_vehicle_number', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.vehicleNumber ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter vehicle number"
          />
          {errors.vehicleNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vehicle Type *
                      </label>
                      <select
            value={formData.custrecord_vehicle_type_ag}
            onChange={(e) => handleInputChange('custrecord_vehicle_type_ag', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.vehicleType ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            <option value="">Select vehicle type</option>
            <option value="Truck">Truck</option>
            <option value="Trailer">Trailer</option>
            <option value="ODC">ODC</option>
            <option value="Container">Container</option>
                      </select>
          {errors.vehicleType && (
            <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>
          )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
            Vehicle Name *
                      </label>
                      <input
                        type="text"
            value={formData.custrecord_vehicle_name_ag}
            onChange={(e) => handleInputChange('custrecord_vehicle_name_ag', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.vehicleName ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter vehicle name"
          />
          {errors.vehicleName && (
            <p className="text-red-500 text-xs mt-1">{errors.vehicleName}</p>
          )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
            Plant
                      </label>
                      <select
            value={formData.currentPlant}
            onChange={(e) => handleInputChange('currentPlant', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="daman">Daman</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
            Operational Status
                      </label>
          <select
            value={formData.operationalStatus}
            onChange={(e) => handleInputChange('operationalStatus', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="available">Available</option>
            <option value="inbound">Inbound</option>
            <option value="at gate">At Gate</option>
            <option value="inspection">Inspection</option>
          </select>
                    </div>

        {formData.operationalStatus === 'inbound' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
              ETA (Expected Time of Arrival) *
                      </label>
                      <input
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={formData.statusMeta.eta}
              onChange={(e) => handleInputChange('statusMeta.eta', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.eta || (formData.statusMeta.eta && new Date(formData.statusMeta.eta) <= new Date()) ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.eta && (
              <p className="text-red-500 text-xs mt-1">{errors.eta}</p>
            )}
            {formData.statusMeta.eta && new Date(formData.statusMeta.eta) <= new Date() && !errors.eta && (
              <p className="text-red-500 text-xs mt-1">ETA must be in the future</p>
            )}
                    </div>
        )}
                    </div>

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
            Chassis Number *
                      </label>
                      <input
                        type="text"
            value={formData.custrecord_chassis_number}
            onChange={(e) => handleInputChange('custrecord_chassis_number', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.chassisNumber ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter chassis number"
          />
          {errors.chassisNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.chassisNumber}</p>
          )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
            Engine Number *
                      </label>
                      <input
                        type="text"
            value={formData.custrecord_engine_number_ag}
            onChange={(e) => handleInputChange('custrecord_engine_number_ag', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.engineNumber ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter engine number"
          />
          {errors.engineNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.engineNumber}</p>
          )}
                    </div>
      </div>

      {/* Owner Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
            Owner Name *
                            </label>
                            <input
                              type="text"
            value={formData.custrecord_owner_name_ag}
            onChange={(e) => handleInputChange('custrecord_owner_name_ag', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.ownerName ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter owner name"
          />
          {errors.ownerName && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>
          )}
                          </div>
                        
                            <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Owner Number *
                              </label>
                              <input
            type="tel"
            value={formData.custrecord_owner_no_ag}
            onChange={(e) => handleInputChange('custrecord_owner_no_ag', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.ownerNumber ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter owner number"
          />
          {errors.ownerNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerNumber}</p>
                              )}
                            </div>
                            </div>
                        </div>
  )
}

// Driver Step Component
const DriverStep = ({ formData, setFormData, errors, files, setFiles }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
                                </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Driver Information</h3>
          <p className="text-slate-600 text-sm">Enter driver details and license information</p>
                              </div>
                          </div>

      {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Driver Name *
                      </label>
                      <input
                        type="text"
            value={formData.custrecord_driver_name}
            onChange={(e) => handleInputChange('custrecord_driver_name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.driverName ? 'border-red-500' : 'border-slate-300'
            }`}
                        placeholder="Enter driver name"
                      />
          {errors.driverName && (
            <p className="text-red-500 text-xs mt-1">{errors.driverName}</p>
          )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
            value={formData.custrecord_driver_mobile_no}
            onChange={(e) => handleInputChange('custrecord_driver_mobile_no', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.mobileNumber ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter mobile number"
          />
          {errors.mobileNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        License Number *
                      </label>
                      <input
                        type="text"
            value={formData.custrecord_driving_license_no}
            onChange={(e) => handleInputChange('custrecord_driving_license_no', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.licenseNumber ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter license number"
          />
          {errors.licenseNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
            License Category
                      </label>
                      <select
            value={formData.custrecord_license_category_ag}
            onChange={(e) => handleInputChange('custrecord_license_category_ag', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Light Motor Vehicle">Light Motor Vehicle</option>
            <option value="Medium Passenger Vehicle">Medium Passenger Vehicle</option>
            <option value="Medium Goods Vehicle">Medium Goods Vehicle</option>
            <option value="Heavy Passenger Vehicle">Heavy Passenger Vehicle</option>
            <option value="Heavy Goods Vehicle">Heavy Goods Vehicle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        License Start Date *
                      </label>
                      <input
                        type="date"
            value={formData.custrecord_driving_license_s_date}
            onChange={(e) => handleInputChange('custrecord_driving_license_s_date', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.licenseStartDate ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.licenseStartDate && (
            <p className="text-red-500 text-xs mt-1">{errors.licenseStartDate}</p>
          )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
            License End Date *
                      </label>
                      <input
                        type="date"
            value={formData.custrecord_driver_license_e_date}
            onChange={(e) => handleInputChange('custrecord_driver_license_e_date', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.licenseEndDate ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.licenseEndDate && (
            <p className="text-red-500 text-xs mt-1">{errors.licenseEndDate}</p>
                      )}
                    </div>
                  </div>
                </div>
  )
}

// Contact Step Component
const ContactStep = ({ contactPersons, addContactPerson, removeContactPerson }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({
    type: 'other',
    name: '',
    phone: '',
    licenceNumber: ''
  })

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert('Name and phone are required')
      return
    }

    if (newContact.type === 'secondary_driver' && !newContact.licenceNumber) {
      alert('Licence number is required for secondary drivers')
      return
    }

    addContactPerson(newContact)
    setNewContact({ type: 'other', name: '', phone: '', licenceNumber: '' })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
          <Phone className="w-4 h-4 text-green-600" />
                              </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Contact Persons</h3>
          <p className="text-slate-600 text-sm">Add secondary drivers and emergency contacts (Optional)</p>
                            </div>
                    </div>

      {/* Current Contacts */}
      {contactPersons.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-slate-400" />
                        </div>
          <p className="text-slate-600 font-medium">No contacts added</p>
          <p className="text-slate-500 text-sm">Add secondary drivers and emergency contacts</p>
                      </div>
      ) : (
        <div className="space-y-3">
          {contactPersons.map((contact) => (
            <div key={contact.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    contact.type === 'secondary_driver' 
                      ? 'bg-blue-100' 
                      : 'bg-orange-100'
                  }`}>
                    {contact.type === 'secondary_driver' ? (
                      <Car className="w-4 h-4 text-blue-600" />
                    ) : (
                      <User className="w-4 h-4 text-orange-600" />
                    )}
                      </div>
                  <div>
                            <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{contact.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contact.type === 'secondary_driver'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {contact.type === 'secondary_driver' ? 'Driver' : 'Contact'}
                              </span>
                            </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                          </div>
                    {contact.type === 'secondary_driver' && contact.licenceNumber && (
                      <div className="text-sm text-slate-600">
                        Licence: {contact.licenceNumber}
                        </div>
                      )}
                    </div>
                  </div>
                <button
                  onClick={() => removeContactPerson(contact.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="Remove Contact"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Contact Form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 p-3 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-700">Add Contact Person</span>
        </button>
      ) : (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-3">Add New Contact</h4>
          <div className="space-y-3">
            {/* Contact Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Type</label>
              <div className="flex gap-2">
                  <button
                    type="button"
                  onClick={() => setNewContact({ ...newContact, type: 'other', licenceNumber: '' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newContact.type === 'other'
                      ? 'bg-orange-100 text-orange-700 border border-orange-300'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Other Contact
                  </button>
                <button
                  type="button"
                  onClick={() => setNewContact({ ...newContact, type: 'secondary_driver', licenceNumber: '' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newContact.type === 'secondary_driver'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  Secondary Driver
                </button>
              </div>
              </div>
              
            <input
              type="text"
              placeholder="Contact Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
            
            {/* Licence Number - Only for Secondary Drivers */}
            {newContact.type === 'secondary_driver' && (
              <input
                type="text"
                placeholder="Driving Licence Number *"
                value={newContact.licenceNumber}
                onChange={(e) => setNewContact({ ...newContact, licenceNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            )}

            <div className="flex items-center gap-2">
                  <button
                onClick={handleAddContact}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                <Plus className="w-4 h-4" />
                Add Contact
                  </button>
                  <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewContact({ type: 'other', name: '', phone: '', licenceNumber: '' })
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-medium transition-colors"
              >
                Cancel
                  </button>
              </div>
            </div>
          </div>
      )}
    </div>
  )
}

export default VehicleDriverFormModal
