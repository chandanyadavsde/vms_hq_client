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
  AlertCircle
} from 'lucide-react'
import VehicleService from '../../../../services/VehicleService.js'
import useDateValidation from '../../../../hooks/useDateValidation.js'
import { getModalAnimation } from '../../../../utils/modalAnimations.js'

const VehicleFormModal = ({
  isOpen,
  onClose,
  vehicle = null,
  onCreateVehicle,
  onUpdateVehicle,
  currentTheme = 'teal'
}) => {
  // Date validation hook
  const {
    dateValidation,
    updateStartDate,
    updateEndDate,
    getMinEndDate,
    isAllValid,
    getAllErrors,
    resetAllValidations
  } = useDateValidation()

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

  const [formData, setFormData] = useState({
    // Basic Information
    custrecord_vehicle_number: '',
    custrecord_vehicle_type_ag: '',
    custrecord_vehicle_name_ag: '',
    currentPlant: 'daman',
    
    // Operational Status System
    operationalStatus: 'available',
    statusMeta: {
      plant: 'daman',
      eta: '',
      ata: '',
      notes: ''
    },
    
    // Owner Information
    custrecord_owner_name_ag: '',
    custrecord_owner_no_ag: '',
    
    // Technical Details
    custrecord_chassis_number: '',
    custrecord_engine_number_ag: '',
    custrecord_vehicle_master_gps_available: false,
    
    // RC Document
    custrecord_rc_no: '',
    custrecord_rc_start_date: '',
    custrecord_rc_end_date: '',
    custrecord_rc_doc_attach: [],
    
    // Insurance
    custrecord_insurance_company_name_ag: '',
    custrecord_insurance_number_ag: '',
    custrecord_insurance_start_date_ag: '',
    custrecord_insurance_end_date_ag: '',
    custrecord_insurance_attachment_ag: [],
    
    // Permit
    custrecord_permit_number_ag: '',
    custrecord_permit_start_date: '',
    custrecord_permit_end_date: '',
    custrecord_permit_attachment_ag: [],
    
    // PUC
    custrecord_puc_number: '',
    custrecord_puc_start_date_ag: '',
    custrecord_puc_end_date_ag: '',
    custrecord_puc_attachment_ag: [],
    
    // Fitness Certificate
    custrecord_tms_vehicle_fit_cert_vld_upto: '',
    custrecord_vehicle_fit_cert_attachment_ag: [],
    
    // Additional fields
    custrecord_create_by: getUserEmail(),
    approved_by_hq: 'pending'
  })

  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const isEditing = !!vehicle

  // Initialize form data when vehicle is provided
  useEffect(() => {
    if (vehicle) {
      // Ensure all file fields are arrays
      const vehicleData = {
        ...vehicle,
        custrecord_rc_doc_attach: Array.isArray(vehicle.custrecord_rc_doc_attach) ? vehicle.custrecord_rc_doc_attach : [],
        custrecord_insurance_attachment_ag: Array.isArray(vehicle.custrecord_insurance_attachment_ag) ? vehicle.custrecord_insurance_attachment_ag : [],
        custrecord_permit_attachment_ag: Array.isArray(vehicle.custrecord_permit_attachment_ag) ? vehicle.custrecord_permit_attachment_ag : [],
        custrecord_puc_attachment_ag: Array.isArray(vehicle.custrecord_puc_attachment_ag) ? vehicle.custrecord_puc_attachment_ag : [],
        custrecord_vehicle_fit_cert_attachment_ag: Array.isArray(vehicle.custrecord_vehicle_fit_cert_attachment_ag) ? vehicle.custrecord_vehicle_fit_cert_attachment_ag : []
      }
      setFormData(vehicleData)
    } else {
      // Reset form for new vehicle
      setFormData({
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
        custrecord_create_by: getUserEmail(),
        approved_by_hq: 'pending'
      })
    }
    // Clear any errors and success when modal opens
    setError(null)
    setSuccess(false)
  }, [vehicle, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle date changes with validation
  const handleDateChange = (field, value, documentType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Update validation based on field type
    if (field.includes('_start_date')) {
      updateStartDate(documentType, value)
    } else if (field.includes('_end_date')) {
      updateEndDate(documentType, value)
    }
  }

  const handleFileUpload = (field, file) => {
    const existingFiles = Array.isArray(formData[field]) ? formData[field] : []
    const newFiles = [...existingFiles, file]
    
    setFormData(prev => ({
      ...prev,
      [field]: newFiles
    }))
  }

  const handleFileRemove = (field, fileIndex) => {
    const existingFiles = Array.isArray(formData[field]) ? formData[field] : []
    const newFiles = existingFiles.filter((_, index) => index !== fileIndex)
    
    setFormData(prev => ({
      ...prev,
      [field]: newFiles
    }))
  }

  const handleDrag = (e, field) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(field)
    } else if (e.type === "dragleave") {
      setDragActive('')
    }
  }

  const handleDrop = (e, field) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive('')
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(field, e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(field, e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    // Check date validations before submission
    if (!isAllValid()) {
      const errors = getAllErrors()
      setError(`Please fix date validation errors: ${errors.map(e => e.error).join(', ')}`)
      setLoading(false)
      return
    }
    
    try {
      console.log('📝 Submitting vehicle form data:', formData)
      
      if (isEditing) {
        await onUpdateVehicle(vehicle.id, formData)
      } else {
      const response = await VehicleService.createVehicle(formData)
        // Call the parent's create callback if provided
      if (onCreateVehicle) {
          onCreateVehicle(response)
        }
      }
      
      // Show success message
      setSuccess(true)
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Error saving vehicle:', error)
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  // Handle close with animation delay
  const handleClose = () => {
    setIsAnimating(true)
    // Add a delay to allow exit animation to complete
    setTimeout(() => {
      onClose()
    }, 300) // Match the animation duration
  }

  // Enhanced error handling function
  const handleApiError = (error) => {
    console.error('API Error Details:', error)
    
    const response = error.response
    const status = response?.status
    const data = response?.data
    
    // Clear previous field errors
    setFieldErrors({})
    
    let errorMessage = 'An unexpected error occurred. Please try again.'
    let newFieldErrors = {}
    
    if (status === 409) {
      // Conflict - Duplicate data
      errorMessage = 'Duplicate data found. Please check the following:'
      
      if (data?.details) {
        if (data.details.includes('vehicle number') || data.details.includes('Vehicle number')) {
          newFieldErrors.vehicleNumber = 'This vehicle number already exists. Please use a different number.'
          errorMessage += ' Vehicle number already exists.'
        }
      } else {
        errorMessage = 'Duplicate data found. Please check vehicle number.'
      }
    } else if (status === 400) {
      // Bad Request - Validation errors
      errorMessage = 'Please check the following fields:'
      
      if (data?.details) {
        const details = data.details.toLowerCase()
        
        if (details.includes('vehicle number')) {
          newFieldErrors.vehicleNumber = 'Invalid vehicle number format.'
        }
        if (details.includes('date')) {
          newFieldErrors.dateField = 'Invalid date format or date in the past.'
        }
      } else {
        errorMessage = 'Please check all required fields and try again.'
      }
    } else if (status === 422) {
      // Unprocessable Entity - Validation errors
      errorMessage = 'Validation failed. Please check the following:'
      
      if (data?.details) {
        const details = data.details.toLowerCase()
        
        if (details.includes('required')) {
          errorMessage = 'Please fill in all required fields.'
        }
        if (details.includes('format')) {
          errorMessage = 'Please check the format of your input fields.'
        }
      }
    } else if (status === 500) {
      // Internal Server Error
      errorMessage = 'Server error occurred. Please try again later.'
    } else if (status === 404) {
      // Not Found
      errorMessage = 'API endpoint not found. Please contact support.'
    } else if (status === 403) {
      // Forbidden
      errorMessage = 'You do not have permission to perform this action.'
    } else if (status === 401) {
      // Unauthorized
      errorMessage = 'Please log in again to continue.'
    } else {
      // Other errors
      if (data?.error) {
        errorMessage = data.error
      } else if (data?.details) {
        errorMessage = data.details
      } else if (error.message) {
        errorMessage = error.message
      }
    }
    
    setError(errorMessage)
    setFieldErrors(newFieldErrors)
    
    // Log detailed error for debugging
    console.error('Error handled:', {
      status,
      message: errorMessage,
      fieldErrors: newFieldErrors,
      originalError: error
    })
  }

  // Fill test data for testing purposes
  const fillTestData = () => {
    const testData = {
      custrecord_vehicle_number: 'TEST-002',
      custrecord_vehicle_type_ag: 'ODC',
      custrecord_vehicle_name_ag: 'Test Vehicle 2',
      currentPlant: 'daman',
      operationalStatus: 'inbound',
      statusMeta: {
        plant: 'daman',
        eta: '2024-12-31T10:00',
        ata: '',
        notes: 'Test vehicle for inbound status'
      },
      custrecord_owner_name_ag: 'Test Owner 2',
      custrecord_owner_no_ag: '9876543211',
      custrecord_chassis_number: 'CHASSIS789012',
      custrecord_engine_number_ag: 'ENGINE789012',
      custrecord_vehicle_master_gps_available: true,
      custrecord_rc_no: 'RC789012345',
      custrecord_rc_start_date: '2023-01-01',
      custrecord_rc_end_date: '2033-01-01',
      custrecord_insurance_company_name_ag: 'Test Insurance Co 2',
      custrecord_insurance_number_ag: 'INS789012345',
      custrecord_insurance_start_date_ag: '2024-01-01',
      custrecord_insurance_end_date_ag: '2025-01-01',
      custrecord_permit_number_ag: 'PERMIT789012',
      custrecord_permit_start_date: '2024-01-01',
      custrecord_permit_end_date: '2025-01-01',
      custrecord_puc_number: 'PUC789012345',
      custrecord_puc_start_date_ag: '2024-01-01',
      custrecord_puc_end_date_ag: '2025-01-01',
      custrecord_tms_vehicle_fit_cert_vld_upto: '2025-01-01',
      custrecord_create_by: getUserEmail(),
      approved_by_hq: 'pending'
    }

    setFormData(prev => ({ ...prev, ...testData }))
    resetAllValidations()
    setFieldErrors({})
    setError(null)
    console.log('🧪 Test data filled successfully!')
  }

  // Vehicle types and plants
  const vehicleTypes = [
    { value: 'ODC', label: 'ODC (Over Dimensional Cargo)' },
    { value: 'Lattice Tower', label: 'Lattice Tower' }
  ]

  const plants = [
    { value: 'daman', label: 'Daman' }
  ]

  // Document sections configuration
  const documentSections = [
    {
      id: 'rc',
      title: 'Registration Certificate (RC)',
      icon: <FileText className="w-5 h-5" />,
      color: 'blue',
      required: true,
      fields: {
        number: 'custrecord_rc_no',
        startDate: 'custrecord_rc_start_date',
        endDate: 'custrecord_rc_end_date',
        attachment: 'custrecord_rc_doc_attach'
      }
    },
    {
      id: 'insurance',
      title: 'Insurance',
      icon: <Shield className="w-5 h-5" />,
      color: 'green',
      required: true,
      fields: {
        company: 'custrecord_insurance_company_name_ag',
        number: 'custrecord_insurance_number_ag',
        startDate: 'custrecord_insurance_start_date_ag',
        endDate: 'custrecord_insurance_end_date_ag',
        attachment: 'custrecord_insurance_attachment_ag'
      }
    },
    {
      id: 'permit',
      title: 'Permit',
      icon: <FileCheck className="w-5 h-5" />,
      color: 'purple',
      required: false,
      fields: {
        number: 'custrecord_permit_number_ag',
        startDate: 'custrecord_permit_start_date',
        endDate: 'custrecord_permit_end_date',
        attachment: 'custrecord_permit_attachment_ag'
      }
    },
    {
      id: 'puc',
      title: 'Pollution Under Control (PUC)',
      icon: <FileCheck className="w-5 h-5" />,
      color: 'orange',
      required: true,
      fields: {
        number: 'custrecord_puc_number',
        startDate: 'custrecord_puc_start_date_ag',
        endDate: 'custrecord_puc_end_date_ag',
        attachment: 'custrecord_puc_attachment_ag'
      }
    },
    {
      id: 'fitness',
      title: 'Fitness Certificate',
      icon: <Truck className="w-5 h-5" />,
      color: 'indigo',
      required: false,
      fields: {
        validUpto: 'custrecord_tms_vehicle_fit_cert_vld_upto',
        attachment: 'custrecord_vehicle_fit_cert_attachment_ag'
      }
    }
  ]

  if (!isOpen) return null

  const animationConfig = getModalAnimation('fullScreen')

  return (
    <AnimatePresence onExitComplete={() => setIsAnimating(false)}>
      <motion.div
        className={animationConfig.container.className}
        initial={animationConfig.container.initial}
        animate={animationConfig.container.animate}
        exit={animationConfig.container.exit}
        transition={animationConfig.container.transition}
      >
        <motion.div
          className={animationConfig.backdrop.className}
          onClick={handleClose}
        />

        <motion.div
          className={`relative bg-white ${animationConfig.modalClass}`}
          initial={animationConfig.modal.initial}
          animate={animationConfig.modal.animate}
          exit={animationConfig.modal.exit}
          transition={animationConfig.modal.transition}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Car className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </h2>
                  <p className="text-sm text-slate-600">Enter vehicle information and documents</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fillTestData}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                  title="Fill test data for testing"
                >
                  <Hash className="w-3 h-3" />
                  Fill Test Data
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                <p className="text-red-800 font-medium">Error</p>
                </div>
              <p className="text-red-700 mt-1">{error}</p>
                </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                    </div>
                <p className="text-green-800 font-medium">Success!</p>
                  </div>
              <p className="text-green-700 mt-1">Vehicle {isEditing ? 'updated' : 'created'} successfully. Closing modal...</p>
                </div>
            )}

          {/* Form Content */}
          <div className="p-4">
            <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-orange-500" />
                Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vehicle Number *
                    </label>
                    <input
                      type="text"
                      value={formData.custrecord_vehicle_number}
                      onChange={(e) => {
                        handleInputChange('custrecord_vehicle_number', e.target.value.toUpperCase())
                        // Clear field error when user starts typing
                        if (fieldErrors.vehicleNumber) {
                          setFieldErrors(prev => ({ ...prev, vehicleNumber: null }))
                        }
                      }}
                      placeholder="e.g., MH12AB1234"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono ${
                        fieldErrors.vehicleNumber 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-300'
                      }`}
                      required
                    />
                    {fieldErrors.vehicleNumber && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{fieldErrors.vehicleNumber}</span>
                      </div>
                    )}
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      value={formData.custrecord_vehicle_type_ag}
                      onChange={(e) => handleInputChange('custrecord_vehicle_type_ag', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    >
                    <option value="">Select Vehicle Type</option>
                      {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                      ))}
                    </select>
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vehicle Name / Model
                    </label>
                    <input
                      type="text"
                      value={formData.custrecord_vehicle_name_ag}
                      onChange={(e) => handleInputChange('custrecord_vehicle_name_ag', e.target.value)}
                    placeholder="e.g., Tata 407, Mahindra Bolero"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Plant
                    </label>
                    <select
                      value={formData.currentPlant}
                      onChange={(e) => {
                        handleInputChange('currentPlant', e.target.value)
                        handleInputChange('statusMeta', { ...formData.statusMeta, plant: e.target.value })
                      }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    >
                      {plants.map(plant => (
                      <option key={plant.value} value={plant.value}>
                        {plant.label}
                      </option>
                      ))}
                    </select>
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Operational Status
                    </label>
                    <select
                      value={formData.operationalStatus}
                      onChange={(e) => handleInputChange('operationalStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                      onChange={(e) => handleInputChange('statusMeta', { ...formData.statusMeta, eta: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    />
                    {formData.statusMeta.eta && new Date(formData.statusMeta.eta) <= new Date() && (
                      <p className="text-red-500 text-xs mt-1">ETA must be in the future</p>
                    )}
                    </div>
                  )}
                </div>
              </div>

            {/* Owner Information */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                Owner Information
                </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={formData.custrecord_owner_name_ag}
                      onChange={(e) => handleInputChange('custrecord_owner_name_ag', e.target.value)}
                    placeholder="Owner's full name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Owner Phone Number
                    </label>
                    <input
                    type="tel"
                      value={formData.custrecord_owner_no_ag}
                      onChange={(e) => handleInputChange('custrecord_owner_no_ag', e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

            {/* Technical Details */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                Technical Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Chassis Number
                    </label>
                    <input
                      type="text"
                    value={formData.custrecord_chassis_number}
                    onChange={(e) => handleInputChange('custrecord_chassis_number', e.target.value.toUpperCase())}
                    placeholder="Vehicle chassis number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Engine Number
                    </label>
                    <input
                      type="text"
                    value={formData.custrecord_engine_number_ag}
                    onChange={(e) => handleInputChange('custrecord_engine_number_ag', e.target.value.toUpperCase())}
                    placeholder="Vehicle engine number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    GPS Availability
                    </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                    <input
                        type="radio"
                        name="gps"
                        checked={formData.custrecord_vehicle_master_gps_available === true}
                        onChange={() => handleInputChange('custrecord_vehicle_master_gps_available', true)}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">GPS Available</span>
                    </label>
                    <label className="flex items-center">
                    <input
                        type="radio"
                        name="gps"
                        checked={formData.custrecord_vehicle_master_gps_available === false}
                        onChange={() => handleInputChange('custrecord_vehicle_master_gps_available', false)}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-slate-700">No GPS</span>
                    </label>
                  </div>
                  </div>
                </div>
              </div>

            {/* Documents Section */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                Vehicle Documents
                </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {documentSections.map((section) => (
                  <div key={section.id} className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`text-${section.color}-500`}>
                        {section.icon}
                      </div>
                      <h4 className="font-semibold text-slate-800">
                        {section.title}
                        {section.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                    </div>
                    
                    {/* Document Number */}
                    {section.fields.number && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {section.title} Number
                    </label>
                    <input
                      type="text"
                          value={formData[section.fields.number] || ''}
                          onChange={(e) => handleInputChange(section.fields.number, e.target.value)}
                          placeholder={`Enter ${section.title.toLowerCase()} number`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                    />
                  </div>
                    )}
                    
                    {/* Company Name (for insurance) */}
                    {section.fields.company && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Insurance Company
                    </label>
                    <input
                          type="text"
                          value={formData[section.fields.company] || ''}
                          onChange={(e) => handleInputChange(section.fields.company, e.target.value)}
                          placeholder="Enter insurance company name"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                    />
          </div>
                    )}
                    
                    {/* Date Fields */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {section.fields.startDate && (
                  <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Start Date
                    </label>
                    <input
                      type="date"
                            value={formData[section.fields.startDate] || ''}
                            onChange={(e) => handleDateChange(section.fields.startDate, e.target.value, section.id)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                    />
                  </div>
                      )}
                      {section.fields.endDate && (
                  <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            End Date
                    </label>
                    <input
                      type="date"
                            value={formData[section.fields.endDate] || ''}
                            onChange={(e) => handleDateChange(section.fields.endDate, e.target.value, section.id)}
                            min={getMinEndDate(section.id) || ''}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm ${
                              dateValidation[section.id]?.isValid === false 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-slate-300'
                            }`}
                          />
                          {/* Date validation error */}
                          {dateValidation[section.id]?.isValid === false && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                              <AlertCircle className="w-3 h-3" />
                              <span>{dateValidation[section.id].error}</span>
                  </div>
                          )}
                  </div>
                      )}
                      {section.fields.validUpto && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Valid Upto
                    </label>
                    <input
                            type="date"
                            value={formData[section.fields.validUpto] || ''}
                            onChange={(e) => handleInputChange(section.fields.validUpto, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                          />
                      </div>
                    )}
        </div>

                    {/* File Upload */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                        dragActive === section.fields.attachment
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-300 hover:border-orange-400'
                      }`}
                      onDragEnter={(e) => handleDrag(e, section.fields.attachment)}
                      onDragLeave={(e) => handleDrag(e, section.fields.attachment)}
                      onDragOver={(e) => handleDrag(e, section.fields.attachment)}
                      onDrop={(e) => handleDrop(e, section.fields.attachment)}
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 text-sm mb-1">
                        Drop files here or{' '}
                        <label className="text-orange-600 cursor-pointer hover:underline">
                          browse
                    <input
                      type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileInput(e, section.fields.attachment)}
                            className="hidden"
                      multiple
                          />
                        </label>
                      </p>
                      <p className="text-xs text-slate-500">JPG, PNG, PDF</p>
                  </div>

                    {/* Uploaded Files */}
                    {Array.isArray(formData[section.fields.attachment]) && formData[section.fields.attachment].length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData[section.fields.attachment].map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-slate-50 p-2 rounded border text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-orange-500" />
                              <span className="text-slate-700">
                                {file.name || `File ${index + 1}`}
                              </span>
                          </div>
                            <button
                              type="button"
                              onClick={() => handleFileRemove(section.fields.attachment, index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                          </div>
                        ))}
        </div>
      </div>

            </form>
          </div>

          {/* Sticky Action Buttons - Bottom */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 z-10">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="vehicle-form"
                disabled={loading}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Vehicle' : 'Create Vehicle'}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VehicleFormModal