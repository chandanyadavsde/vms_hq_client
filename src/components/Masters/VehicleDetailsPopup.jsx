import React, { useState, useEffect } from 'react'
import { VehicleJourneyStepper, DocumentStatusDashboard, DriverAssignmentSection, ComplianceScoreCard, SystemInfoSection } from './VehicleDetail'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../../hooks/useToast'
import { 
  X, Car, User, Phone, MapPin, Building2, Calendar, FileText, Settings, 
  Edit, Trash2, UserPlus, UserCheck, Shield, Clock, CheckCircle, 
  AlertTriangle, ExternalLink, Image as ImageIcon, Download, Eye, Save, RotateCcw, Loader2, Plus
} from 'lucide-react'
import useDateValidation from '../../hooks/useDateValidation.js'
import { getModalAnimation } from '../../utils/modalAnimations.js'

const VehicleDetailsPopup = ({ vehicle, onClose, onVehicleUpdate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('rc')
  const [selectedImage, setSelectedImage] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Toast notification hook
  const toast = useToast()

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

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [updateSummary, setUpdateSummary] = useState({
    plant: false,
    dates: false,
    images: false
  })
  const [editData, setEditData] = useState({
    currentPlant: '',
    // RC fields
    rcStartDate: '',
    rcEndDate: '',
    // Insurance fields - ALL EDITABLE
    insuranceCompanyName: '',
    insurancePolicyNumber: '',
    insuranceStartDate: '',
    insuranceEndDate: '',
    // Permit fields
    permitStartDate: '',
    permitEndDate: '',
    // PUC fields
    pucStartDate: '',
    pucEndDate: '',
    // Fitness fields
    fitnessEndDate: '',

    // Image management
    imageOperations: {
      rc: {
        toDelete: [],           // Image IDs marked for deletion
        toUpload: [],          // New File objects to upload
        previews: [],          // Preview URLs for new files
        hasChanges: false
      },
      insurance: { toDelete: [], toUpload: [], previews: [], hasChanges: false },
      permit: { toDelete: [], toUpload: [], previews: [], hasChanges: false },
      puc: { toDelete: [], toUpload: [], previews: [], hasChanges: false }
    }
  })

  // Initialize edit data when vehicle changes
  useEffect(() => {
    if (vehicle) {
      console.log('🔄 VehicleDetailsPopup: Vehicle data updated, refreshing edit data:', vehicle)
      setEditData({
        currentPlant: vehicle.currentPlant || '',
        // RC fields
        rcStartDate: vehicle.rawData?.custrecord_rc_start_date || '',
        rcEndDate: vehicle.rawData?.custrecord_rc_end_date || '',
        // Insurance fields - ALL EDITABLE
        insuranceCompanyName: vehicle.rawData?.custrecord_insurance_company_name_ag || '',
        insurancePolicyNumber: vehicle.rawData?.custrecord_insurance_number_ag || '',
        insuranceStartDate: vehicle.rawData?.custrecord_insurance_start_date_ag || '',
        insuranceEndDate: vehicle.rawData?.custrecord_insurance_end_date_ag || '',
        // Permit fields
        permitStartDate: vehicle.rawData?.custrecord_permit_start_date || '',
        permitEndDate: vehicle.rawData?.custrecord_permit_end_date || '',
        // PUC fields
        pucStartDate: vehicle.rawData?.custrecord_puc_start_date_ag || '',
        pucEndDate: vehicle.rawData?.custrecord_puc_end_date_ag || '',
        // Fitness fields
        fitnessEndDate: vehicle.rawData?.custrecord_fitness_end_date || '',

        // Reset image operations
        imageOperations: {
          rc: { toDelete: [], toUpload: [], previews: [], hasChanges: false },
          insurance: { toDelete: [], toUpload: [], previews: [], hasChanges: false },
          permit: { toDelete: [], toUpload: [], previews: [], hasChanges: false },
          puc: { toDelete: [], toUpload: [], previews: [], hasChanges: false }
        }
      })

      // Clear any previous error/success states when vehicle data updates
      setError(null)
      setSuccess(false)
    }
  }, [vehicle])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup all preview URLs to prevent memory leaks
      Object.values(editData.imageOperations).forEach(operations => {
        operations.previews.forEach(preview => {
          if (preview.url && preview.url.startsWith('blob:')) {
            URL.revokeObjectURL(preview.url)
          }
        })
      })
    }
  }, [editData.imageOperations])

  if (!vehicle) return null

  // Animation configuration
  const animationConfig = getModalAnimation('fullScreen')

  // Handle close with animation
  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onClose()
    }, 300) // Match animation duration
  }

  // Edit mode handlers
  const handleEditMode = () => {
    setIsEditMode(true)
    setError(null)
    setSuccess(false)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setError(null)
    setSuccess(false)
    // Reset edit data to original values
    setEditData({
      currentPlant: vehicle.currentPlant || '',
      // RC fields
      rcStartDate: vehicle.rawData?.custrecord_rc_start_date || '',
      rcEndDate: vehicle.rawData?.custrecord_rc_end_date || '',
      // Insurance fields - ALL EDITABLE
      insuranceCompanyName: vehicle.rawData?.custrecord_insurance_company_name_ag || '',
      insurancePolicyNumber: vehicle.rawData?.custrecord_insurance_number_ag || '',
      insuranceStartDate: vehicle.rawData?.custrecord_insurance_start_date_ag || '',
      insuranceEndDate: vehicle.rawData?.custrecord_insurance_end_date_ag || '',
      // Permit fields
      permitStartDate: vehicle.rawData?.custrecord_permit_start_date || '',
      permitEndDate: vehicle.rawData?.custrecord_permit_end_date || '',
      // PUC fields
      pucStartDate: vehicle.rawData?.custrecord_puc_start_date_ag || '',
      pucEndDate: vehicle.rawData?.custrecord_puc_end_date_ag || '',
      // Fitness fields
      fitnessEndDate: vehicle.rawData?.custrecord_fitness_end_date || '',

      // Reset image operations and cleanup preview URLs
      imageOperations: {
        rc: { toDelete: [], toUpload: [], previews: [], hasChanges: false },
        insurance: { toDelete: [], toUpload: [], previews: [], hasChanges: false },
        permit: { toDelete: [], toUpload: [], previews: [], hasChanges: false },
        puc: { toDelete: [], toUpload: [], previews: [], hasChanges: false }
      }
    })
    
    // Cleanup any existing preview URLs to prevent memory leaks
    Object.values(editData.imageOperations).forEach(operations => {
      operations.previews.forEach(preview => {
        if (preview.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url)
        }
      })
    })
  }

  // Handle refresh button click
  const handleRefreshClick = async () => {
    if (!onRefresh) return

    setIsRefreshing(true)
    setError(null)

    try {
      console.log('🔄 Refreshing vehicle data from modal...')
      await onRefresh()
      console.log('✅ Vehicle data refreshed successfully')
    } catch (err) {
      console.error('❌ Error refreshing vehicle:', err)
      setError('Failed to refresh vehicle data')
    } finally {
      setIsRefreshing(false)
    }
  }

  // File validation constants
  const FILE_CONSTRAINTS = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ]
  }

  // Validate individual file
  const validateFile = (file) => {
    const errors = []
    
    if (file.size > FILE_CONSTRAINTS.maxSize) {
      errors.push(`File "${file.name}" is too large (max 5MB)`)
    }
    
    if (!FILE_CONSTRAINTS.allowedTypes.includes(file.type)) {
      errors.push(`File "${file.name}" has invalid type (only images and PDFs allowed)`)
    }
    
    return errors
  }

  // Toggle image for deletion
  const toggleImageForDeletion = (docType, imageId) => {
    setEditData(prev => {
      const currentDeletes = prev.imageOperations[docType].toDelete
      const isMarked = currentDeletes.includes(imageId)
      
      return {
        ...prev,
        imageOperations: {
          ...prev.imageOperations,
          [docType]: {
            ...prev.imageOperations[docType],
            toDelete: isMarked 
              ? currentDeletes.filter(id => id !== imageId)
              : [...currentDeletes, imageId],
            hasChanges: true
          }
        }
      }
    })
  }

  // Check if image is marked for deletion
  const isImageMarkedForDeletion = (docType, imageId) => {
    return editData.imageOperations[docType]?.toDelete.includes(imageId) || false
  }

  // Handle new image uploads
  const handleImageUpload = async (docType, files) => {
    const validFiles = []
    const errors = []
    
    for (let file of Array.from(files)) {
      const fileErrors = validateFile(file)
      if (fileErrors.length > 0) {
        errors.push(...fileErrors)
        continue
      }
      validFiles.push(file)
    }
    
    // Show errors if any
    if (errors.length > 0) {
      setError(errors.join(', '))
      setTimeout(() => setError(null), 5000)
    }
    
    // Create previews for valid files
    const newPreviews = await Promise.all(
      validFiles.map(async file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.type === 'application/pdf' 
          ? '/pdf-icon.png' 
          : URL.createObjectURL(file)
      }))
    )
    
    setEditData(prev => ({
      ...prev,
      imageOperations: {
        ...prev.imageOperations,
        [docType]: {
          ...prev.imageOperations[docType],
          toUpload: [...prev.imageOperations[docType].toUpload, ...validFiles],
          previews: [...prev.imageOperations[docType].previews, ...newPreviews],
          hasChanges: true
        }
      }
    }))
  }

  // Remove new image from upload queue
  const removeNewImage = (docType, index) => {
    setEditData(prev => {
      const newToUpload = [...prev.imageOperations[docType].toUpload]
      const newPreviews = [...prev.imageOperations[docType].previews]
      
      // Revoke object URL to prevent memory leaks
      if (newPreviews[index]?.url.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews[index].url)
      }
      
      newToUpload.splice(index, 1)
      newPreviews.splice(index, 1)
      
      return {
        ...prev,
        imageOperations: {
          ...prev.imageOperations,
          [docType]: {
            ...prev.imageOperations[docType],
            toUpload: newToUpload,
            previews: newPreviews,
            hasChanges: newToUpload.length > 0 || prev.imageOperations[docType].toDelete.length > 0
          }
        }
      }
    })
  }

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check date validations before submission
      if (!isAllValid()) {
        const errors = getAllErrors()
        setError(`Please fix date validation errors: ${errors.map(e => e.error).join(', ')}`)
        setIsLoading(false)
        return
      }

      // Build comprehensive patch data and track changes
      const formData = new FormData()
      let hasChanges = false
      const changesSummary = {
        plant: false,
        dates: false,
        images: false
      }
      
      // 1. Plant changes
      if (editData.currentPlant !== vehicle.currentPlant) {
        formData.append('currentPlant', editData.currentPlant)
        hasChanges = true
        changesSummary.plant = true
      }
      
      // 2. Date changes (start and end dates for all documents)
      const dateFields = {
        rcStartDate: 'custrecord_rc_start_date',
        rcEndDate: 'custrecord_rc_end_date',
        insuranceStartDate: 'custrecord_insurance_start_date_ag',
        insuranceEndDate: 'custrecord_insurance_end_date_ag',
        permitStartDate: 'custrecord_permit_start_date',
        permitEndDate: 'custrecord_permit_end_date',
        pucStartDate: 'custrecord_puc_start_date_ag',
        pucEndDate: 'custrecord_puc_end_date_ag',
        fitnessEndDate: 'custrecord_fitness_end_date'
      }

      Object.keys(dateFields).forEach(editField => {
        const apiField = dateFields[editField]
        const currentValue = vehicle.rawData?.[apiField]
        if (editData[editField] !== currentValue) {
          formData.append(apiField, editData[editField])
          hasChanges = true
          changesSummary.dates = true
        }
      })

      // 3. Insurance text fields (company name, policy number)
      const insuranceTextFields = {
        insuranceCompanyName: 'custrecord_insurance_company_name_ag',
        insurancePolicyNumber: 'custrecord_insurance_number_ag'
      }

      Object.keys(insuranceTextFields).forEach(editField => {
        const apiField = insuranceTextFields[editField]
        const currentValue = vehicle.rawData?.[apiField]
        if (editData[editField] !== currentValue) {
          formData.append(apiField, editData[editField])
          hasChanges = true
          changesSummary.dates = true // Group with dates for summary
        }
      })

      // 4. Image operations
      const imageFieldMap = {
        rc: 'custrecord_rc_doc_attach',
        insurance: 'custrecord_insurance_attachment_ag', 
        permit: 'custrecord_permit_attachment_ag',
        puc: 'custrecord_puc_attachment_ag'
      }
      
      Object.keys(editData.imageOperations).forEach(docType => {
        const operations = editData.imageOperations[docType]
        
        if (operations.hasChanges) {
          hasChanges = true
          changesSummary.images = true
          
          // Images to delete
          if (operations.toDelete.length > 0) {
            formData.append(`delete_${docType}_images`, JSON.stringify(operations.toDelete))
          }
          
          // Images to upload
          operations.toUpload.forEach((file, index) => {
            formData.append(imageFieldMap[docType], file)
          })
        }
      })

      // Skip API call if nothing changed
      if (!hasChanges) {
        toast.warning('No changes to save', 'No Changes')
        return
      }

      console.log('🔄 Saving vehicle changes with FormData')
      console.log('📊 FormData contents:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }

      // Call the update function passed from parent
      if (onVehicleUpdate) {
        await onVehicleUpdate(vehicle.vehicleNumber || vehicle.custrecord_vehicle_number, formData)
      }

      setUpdateSummary(changesSummary)
      toast.success('Vehicle details updated successfully!')
      setIsEditMode(false)

      // Play a subtle success sound (browser's system bell)
      try {
        // Create a short, pleasant audio notification
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (e) {
        // Fallback - browser notification sound might not work in all environments
        console.log('🔔 Success! (Audio notification not supported)')
      }

    } catch (err) {
      toast.error(err.message || 'Failed to update vehicle')
      console.error('❌ Error saving vehicle:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle date changes with validation
  const handleDateChange = (field, value, documentType) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))

    // Update validation based on field type
    if (field.includes('EndDate')) {
      // Get the corresponding start date from vehicle data
      const startDateField = field.replace('EndDate', 'StartDate')
      const startDate = vehicle.rawData?.[startDateField] || ''
      updateEndDate(documentType, value)
    }
  }

  // Helper function to calculate document status
  const getDocumentStatus = (endDate) => {
    if (!endDate) return { status: 'unknown', color: 'gray', text: 'Unknown' }

    const today = new Date()
    const expiry = new Date(endDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'red', text: 'Expired' }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'orange', text: 'Expiring Soon' }
    } else {
      return { status: 'valid', color: 'green', text: 'Valid' }
    }
  }

  // Helper function to get tab status for badge
  const getTabStatus = (tabId) => {
    let endDate
    switch(tabId) {
      case 'rc':
        endDate = vehicle.rawData?.custrecord_rc_end_date
        break
      case 'insurance':
        endDate = vehicle.rawData?.custrecord_insurance_end_date_ag
        break
      case 'permit':
        endDate = vehicle.rawData?.custrecord_permit_end_date
        break
      case 'puc':
        endDate = vehicle.rawData?.custrecord_puc_end_date_ag
        break
      default:
        return null
    }
    return getDocumentStatus(endDate)
  }

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      return 'N/A'
    }
  }

  // Get approval status styling
  const getApprovalStatus = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'green', text: 'Approved', icon: CheckCircle }
      case 'pending':
        return { color: 'orange', text: 'Pending', icon: Clock }
      case 'rejected':
        return { color: 'red', text: 'Rejected', icon: AlertTriangle }
      default:
        return { color: 'gray', text: 'Unknown', icon: Clock }
    }
  }

  const approvalStatus = getApprovalStatus(vehicle.rawData?.approved_by_hq)
  const driverApprovalStatus = getApprovalStatus(vehicle.rawData?.assignedDriver?.approved_by_hq)

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
                    {vehicle.vehicleNumber}
                    {isEditMode && (
                      <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        Editing...
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {isEditMode ? 'Edit Vehicle Information' : 'Vehicle Details'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <button
                    onClick={handleEditMode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Modify
                  </button>
                )}
                {/* TODO: Uncomment when refresh functionality is needed */}
                {/* {!isEditMode && onRefresh && (
                  <button
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh vehicle data"
                  >
                    <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                )} */}
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4">
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
                <p className="text-green-700 mt-1">Vehicle updated successfully!</p>
              </div>
            )}

        {/* Vehicle Journey Stepper - Full Width */}
        <div className="mb-6">
          <VehicleJourneyStepper vehicle={vehicle.rawData || vehicle} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - VEHICLE FOCUSED */}
          <div className="lg:col-span-2 space-y-6">

            {/* Vehicle Specifications */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                Vehicle Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white rounded p-3 shadow-sm">
                  <label className="text-sm text-slate-600 font-medium">Vehicle Age</label>
                  <p className="text-base font-bold text-slate-800 mt-1">{vehicle.rawData?.custrecord_age_of_vehicle || 'N/A'}</p>
                </div>
                <div className="bg-white rounded p-3 shadow-sm">
                  <label className="text-sm text-slate-600 font-medium">Chassis Number</label>
                  <p className="text-base font-bold text-slate-800 mt-1 font-mono">{vehicle.rawData?.custrecord_chassis_number || 'N/A'}</p>
                </div>
                <div className="bg-white rounded p-3 shadow-sm">
                  <label className="text-sm text-slate-600 font-medium">Engine Number</label>
                  <p className="text-base font-bold text-slate-800 mt-1 font-mono">{vehicle.rawData?.custrecord_engine_number_ag || 'N/A'}</p>
                </div>
                <div className="bg-white rounded p-3 shadow-sm">
                  <label className="text-sm text-slate-600 font-medium">GPS Tracking</label>
                  <p className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    {vehicle.rawData?.custrecord_vehicle_master_gps_available ? (
                      <><CheckCircle className="w-4 h-4 text-green-600" /> Available</>
                    ) : (
                      <><AlertTriangle className="w-4 h-4 text-amber-600" /> Not Available</>
                    )}
                  </p>
                </div>
                <div className="bg-white rounded p-3 shadow-sm">
                  <label className="text-sm text-slate-600 font-medium">Current Plant</label>
                  {isEditMode ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 className="w-4 h-4 text-orange-600" />
                      <select
                        value={editData.currentPlant}
                        onChange={(e) => handleInputChange('currentPlant', e.target.value)}
                        className="px-2 py-1 rounded text-sm font-medium bg-white border border-orange-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-slate-800"
                      >
                        <option value="pune">Pune</option>
                        <option value="solapur">Solapur</option>
                        <option value="surat">Surat</option>
                        <option value="daman">Daman</option>
                        <option value="free">Free (Not Assigned)</option>
                      </select>
                    </div>
                  ) : (
                  <p className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-orange-600" />
                    {vehicle.currentPlant}
                  </p>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Documents Tabs */}
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Legal Documents
                </h3>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-0.5 mb-3 bg-slate-200 rounded p-0.5">
                {[
                  { id: 'rc', label: 'RC', icon: FileText },
                  { id: 'insurance', label: 'Insurance', icon: Shield },
                  { id: 'permit', label: 'Permit', icon: Calendar },
                  { id: 'puc', label: 'PUC', icon: CheckCircle }
                ].map((tab) => {
                  const tabStatus = getTabStatus(tab.id)
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {/* Status Badge */}
                      {tabStatus && (
                        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          tabStatus.color === 'green' ? 'bg-green-500' :
                          tabStatus.color === 'orange' ? 'bg-orange-500 animate-pulse' :
                          tabStatus.color === 'red' ? 'bg-red-500 animate-pulse' :
                          'bg-gray-400'
                        }`} title={tabStatus.text} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="space-y-3">
                {activeTab === 'rc' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-600">RC Number</label>
                      <p className="text-base font-semibold text-slate-800">{vehicle.rawData?.custrecord_rc_no || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Start Date {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            value={editData.rcStartDate ? editData.rcStartDate.split('T')[0] : ''}
                            onChange={(e) => handleInputChange('rcStartDate', e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm font-medium"
                          />
                        </div>
                      ) : (
                        <p className="text-base font-semibold text-slate-800">{formatDate(vehicle.rawData?.custrecord_rc_start_date)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">End Date {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <input
                              type="date"
                              value={editData.rcEndDate ? editData.rcEndDate.split('T')[0] : ''}
                              onChange={(e) => handleDateChange('rcEndDate', e.target.value, 'rc')}
                              min={getMinEndDate('rc') || ''}
                              className={`px-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm font-medium ${
                                dateValidation.rc?.isValid === false
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {/* Date validation error */}
                          {dateValidation.rc?.isValid === false && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{dateValidation.rc.error}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-base font-semibold text-slate-800">{formatDate(vehicle.rawData?.custrecord_rc_end_date)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Status</label>
                      <p className="text-base font-semibold text-slate-800">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          getDocumentStatus(vehicle.rawData?.custrecord_rc_end_date).color === 'green' ? 'bg-green-100 text-green-700' :
                          getDocumentStatus(vehicle.rawData?.custrecord_rc_end_date).color === 'orange' ? 'bg-amber-100 text-amber-700' :
                          getDocumentStatus(vehicle.rawData?.custrecord_rc_end_date).color === 'red' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {getDocumentStatus(vehicle.rawData?.custrecord_rc_end_date).text}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'insurance' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Company {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editData.insuranceCompanyName}
                          onChange={(e) => handleInputChange('insuranceCompanyName', e.target.value)}
                          placeholder="Enter company name"
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm font-semibold"
                        />
                      ) : (
                        <p className="text-base font-semibold text-slate-800">{vehicle.rawData?.custrecord_insurance_company_name_ag || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Policy Number {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editData.insurancePolicyNumber}
                          onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                          placeholder="Enter policy number"
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm font-semibold"
                        />
                      ) : (
                        <p className="text-base font-semibold text-slate-800">{vehicle.rawData?.custrecord_insurance_number_ag || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Start Date {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            value={editData.insuranceStartDate ? editData.insuranceStartDate.split('T')[0] : ''}
                            onChange={(e) => handleInputChange('insuranceStartDate', e.target.value)}
                            className="px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm font-semibold"
                          />
                        </div>
                      ) : (
                        <p className="text-base font-semibold text-slate-800">{formatDate(vehicle.rawData?.custrecord_insurance_start_date_ag)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">End Date {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <input
                              type="date"
                              value={editData.insuranceEndDate ? editData.insuranceEndDate.split('T')[0] : ''}
                              onChange={(e) => handleDateChange('insuranceEndDate', e.target.value, 'insurance')}
                              min={getMinEndDate('insurance') || ''}
                              className={`px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm font-semibold ${
                                dateValidation.insurance?.isValid === false
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {/* Date validation error */}
                          {dateValidation.insurance?.isValid === false && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{dateValidation.insurance.error}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                      <p className="text-base font-semibold text-slate-800">{formatDate(vehicle.rawData?.custrecord_insurance_end_date_ag)}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-600">Status</label>
                      <p className="text-base font-semibold text-slate-800">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          getDocumentStatus(vehicle.rawData?.custrecord_insurance_end_date_ag).color === 'green' ? 'bg-green-100 text-green-800' :
                          getDocumentStatus(vehicle.rawData?.custrecord_insurance_end_date_ag).color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          getDocumentStatus(vehicle.rawData?.custrecord_insurance_end_date_ag).color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getDocumentStatus(vehicle.rawData?.custrecord_insurance_end_date_ag).text}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'permit' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Permit Number</label>
                      <p className="text-base font-semibold text-slate-800">{vehicle.rawData?.custrecord_permit_number_ag || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Start Date {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            value={editData.permitStartDate ? editData.permitStartDate.split('T')[0] : ''}
                            onChange={(e) => handleInputChange('permitStartDate', e.target.value)}
                            className="px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm font-semibold"
                          />
                        </div>
                      ) : (
                        <p className="text-base font-semibold text-slate-800">{formatDate(vehicle.rawData?.custrecord_permit_start_date)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">End Date {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <input
                              type="date"
                              value={editData.permitEndDate ? editData.permitEndDate.split('T')[0] : ''}
                              onChange={(e) => handleDateChange('permitEndDate', e.target.value, 'permit')}
                              min={getMinEndDate('permit') || ''}
                              className={`px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm font-semibold ${
                                dateValidation.permit?.isValid === false
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {/* Date validation error */}
                          {dateValidation.permit?.isValid === false && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{dateValidation.permit.error}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                      <p className="text-base font-semibold text-slate-800">{formatDate(vehicle.rawData?.custrecord_permit_end_date)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Status</label>
                      <p className="text-base font-semibold text-slate-800">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          getDocumentStatus(vehicle.rawData?.custrecord_permit_end_date).color === 'green' ? 'bg-green-100 text-green-800' :
                          getDocumentStatus(vehicle.rawData?.custrecord_permit_end_date).color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          getDocumentStatus(vehicle.rawData?.custrecord_permit_end_date).color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getDocumentStatus(vehicle.rawData?.custrecord_permit_end_date).text}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'puc' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">PUC Number</label>
                      <p className="text-base font-semibold text-slate-800">{vehicle.rawData?.custrecord_puc_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Start Date {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            value={editData.pucStartDate ? editData.pucStartDate.split('T')[0] : ''}
                            onChange={(e) => handleInputChange('pucStartDate', e.target.value)}
                            className="px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm font-semibold"
                          />
                        </div>
                      ) : (
                        <p className="text-base font-semibold text-slate-800">{formatDate(vehicle.rawData?.custrecord_puc_start_date_ag)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">End Date {isEditMode && <span className="text-slate-500 font-normal">(Editable)</span>}</label>
                      {isEditMode ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <input
                              type="date"
                              value={editData.pucEndDate ? editData.pucEndDate.split('T')[0] : ''}
                              onChange={(e) => handleDateChange('pucEndDate', e.target.value, 'puc')}
                              min={getMinEndDate('puc') || ''}
                              className={`px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm font-semibold ${
                                dateValidation.puc?.isValid === false
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {/* Date validation error */}
                          {dateValidation.puc?.isValid === false && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{dateValidation.puc.error}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                      <p className="text-base font-semibold text-slate-800">{formatDate(vehicle.rawData?.custrecord_puc_end_date_ag)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Status</label>
                      <p className="text-base font-semibold text-slate-800">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          getDocumentStatus(vehicle.rawData?.custrecord_puc_end_date_ag).color === 'green' ? 'bg-green-100 text-green-800' :
                          getDocumentStatus(vehicle.rawData?.custrecord_puc_end_date_ag).color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          getDocumentStatus(vehicle.rawData?.custrecord_puc_end_date_ag).color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getDocumentStatus(vehicle.rawData?.custrecord_puc_end_date_ag).text}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Attachments Gallery - Tab Specific */}
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-orange-600" />
                Document Attachments - {activeTab === 'rc' ? 'RC Document' : activeTab === 'insurance' ? 'Insurance' : activeTab === 'permit' ? 'Permit' : 'PUC'}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Show only images for the active tab */}
                {activeTab === 'rc' && vehicle.rawData?.custrecord_rc_doc_attach?.map((doc, index) => {
                  const isMarkedForDeletion = isImageMarkedForDeletion('rc', doc.id || doc.url)
                  return (
                    <div key={index} className="relative group">
                      <div 
                        className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                          isMarkedForDeletion 
                            ? 'border-red-300 opacity-50' 
                            : 'border-slate-200 hover:shadow-lg'
                        }`}
                        onClick={() => !isEditMode && setSelectedImage(doc)}
                      >
                        <img 
                          src={doc.url} 
                          alt={doc.fileName}
                          className={`w-full h-full object-cover transition-transform ${
                            !isEditMode ? 'group-hover:scale-105' : ''
                          }`}
                        />
                        
                        {/* Delete overlay */}
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 bg-red-500/30 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">WILL DELETE</span>
                          </div>
                        )}
                      </div>
                      
                      {/* X Icon (Edit Mode Only) */}
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleImageForDeletion('rc', doc.id || doc.url)
                          }}
                          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all z-10 ${
                            isMarkedForDeletion
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <X className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                      
                      <p className="text-xs text-slate-600 mt-1 truncate">{doc.fileName}</p>
                    </div>
                  )
                })}

                {activeTab === 'insurance' && vehicle.rawData?.custrecord_insurance_attachment_ag?.map((doc, index) => {
                  const isMarkedForDeletion = isImageMarkedForDeletion('insurance', doc.id || doc.url)
                  return (
                    <div key={`insurance-${index}`} className="relative group">
                      <div 
                        className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                          isMarkedForDeletion 
                            ? 'border-red-300 opacity-50' 
                            : 'border-slate-200 hover:shadow-lg'
                        }`}
                        onClick={() => !isEditMode && setSelectedImage(doc)}
                      >
                        <img 
                          src={doc.url} 
                          alt={doc.fileName}
                          className={`w-full h-full object-cover transition-transform ${
                            !isEditMode ? 'group-hover:scale-105' : ''
                          }`}
                        />
                        
                        {/* Delete overlay */}
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 bg-red-500/30 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">WILL DELETE</span>
                          </div>
                        )}
                      </div>
                      
                      {/* X Icon (Edit Mode Only) */}
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleImageForDeletion('insurance', doc.id || doc.url)
                          }}
                          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all z-10 ${
                            isMarkedForDeletion
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <X className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                      
                      <p className="text-xs text-slate-600 mt-1 truncate">{doc.fileName}</p>
                    </div>
                  )
                })}

                {activeTab === 'permit' && vehicle.rawData?.custrecord_permit_attachment_ag?.map((doc, index) => {
                  const isMarkedForDeletion = isImageMarkedForDeletion('permit', doc.id || doc.url)
                  return (
                    <div key={`permit-${index}`} className="relative group">
                      <div 
                        className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                          isMarkedForDeletion 
                            ? 'border-red-300 opacity-50' 
                            : 'border-slate-200 hover:shadow-lg'
                        }`}
                        onClick={() => !isEditMode && setSelectedImage(doc)}
                      >
                        <img 
                          src={doc.url} 
                          alt={doc.fileName}
                          className={`w-full h-full object-cover transition-transform ${
                            !isEditMode ? 'group-hover:scale-105' : ''
                          }`}
                        />
                        
                        {/* Delete overlay */}
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 bg-red-500/30 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">WILL DELETE</span>
                          </div>
                        )}
                      </div>
                      
                      {/* X Icon (Edit Mode Only) */}
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleImageForDeletion('permit', doc.id || doc.url)
                          }}
                          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all z-10 ${
                            isMarkedForDeletion
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <X className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                      
                      <p className="text-xs text-slate-600 mt-1 truncate">{doc.fileName}</p>
                    </div>
                  )
                })}

                {activeTab === 'puc' && vehicle.rawData?.custrecord_puc_attachment_ag?.map((doc, index) => {
                  const isMarkedForDeletion = isImageMarkedForDeletion('puc', doc.id || doc.url)
                  return (
                    <div key={`puc-${index}`} className="relative group">
                      <div 
                        className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                          isMarkedForDeletion 
                            ? 'border-red-300 opacity-50' 
                            : 'border-slate-200 hover:shadow-lg'
                        }`}
                        onClick={() => !isEditMode && setSelectedImage(doc)}
                      >
                        <img 
                          src={doc.url} 
                          alt={doc.fileName}
                          className={`w-full h-full object-cover transition-transform ${
                            !isEditMode ? 'group-hover:scale-105' : ''
                          }`}
                        />
                        
                        {/* Delete overlay */}
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 bg-red-500/30 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">WILL DELETE</span>
                          </div>
                        )}
                      </div>
                      
                      {/* X Icon (Edit Mode Only) */}
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleImageForDeletion('puc', doc.id || doc.url)
                          }}
                          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all z-10 ${
                            isMarkedForDeletion
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <X className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                      
                      <p className="text-xs text-slate-600 mt-1 truncate">{doc.fileName}</p>
                    </div>
                  )
                })}

                {/* New Image Previews (Edit Mode Only) */}
                {isEditMode && editData.imageOperations[activeTab]?.previews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="aspect-square bg-white rounded-lg border-2 border-blue-300 overflow-hidden">
                      {preview.type === 'application/pdf' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
                          <FileText className="w-8 h-8 text-red-600 mb-2" />
                          <span className="text-xs text-red-600 font-medium">PDF</span>
                        </div>
                      ) : (
                        <img 
                          src={preview.url} 
                          alt={preview.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
                      NEW
                    </div>
                    
                    <button
                      onClick={() => removeNewImage(activeTab, index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full border-2 border-white shadow-lg hover:bg-blue-600 transition-all z-10"
                    >
                      <X className="w-3 h-3 mx-auto" />
                    </button>
                    
                    <p className="text-xs text-slate-600 mt-1 truncate" title={preview.name}>
                      {preview.name}
                    </p>
                  </div>
                ))}

                {/* Upload Button (Edit Mode Only) */}
                {isEditMode && (
                  <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => handleImageUpload(activeTab, e.target.files)}
                      className="hidden"
                      id={`upload-${activeTab}`}
                    />
                    <label 
                      htmlFor={`upload-${activeTab}`}
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-slate-600 p-4"
                    >
                      <Plus className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium text-center">Add Images</span>
                      <span className="text-xs text-center">Up to 5MB each</span>
                      <span className="text-xs text-center mt-1">Images & PDFs</span>
                    </label>
                  </div>
                )}

                {/* Show empty state if no documents for active tab */}
                {((activeTab === 'rc' && (!vehicle.rawData?.custrecord_rc_doc_attach || vehicle.rawData.custrecord_rc_doc_attach.length === 0)) ||
                  (activeTab === 'insurance' && (!vehicle.rawData?.custrecord_insurance_attachment_ag || vehicle.rawData.custrecord_insurance_attachment_ag.length === 0)) ||
                  (activeTab === 'permit' && (!vehicle.rawData?.custrecord_permit_attachment_ag || vehicle.rawData.custrecord_permit_attachment_ag.length === 0)) ||
                  (activeTab === 'puc' && (!vehicle.rawData?.custrecord_puc_attachment_ag || vehicle.rawData.custrecord_puc_attachment_ag.length === 0))) && (
                  <div className="col-span-full text-center py-8">
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No documents uploaded</p>
                    <p className="text-slate-500 text-sm">Documents will appear here when uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Assignment Section - Enhanced */}
            <DriverAssignmentSection
              vehicle={vehicle}
              onViewDriver={(driver) => {
                // TODO: Implement driver details modal
                console.log('View driver:', driver);
              }}
              onChangeDriver={() => {
                // TODO: Implement driver assignment modal
                console.log('Change driver for vehicle:', vehicle.vehicleNumber);
              }}
              onAddContact={() => {
                // TODO: Implement add contact modal
                console.log('Add contact for vehicle:', vehicle.vehicleNumber);
              }}
            />

            {/* System Information */}
            <SystemInfoSection vehicle={vehicle} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Document Status Dashboard */}
            <DocumentStatusDashboard vehicle={vehicle} />

            {/* Compliance Score Card */}
            <ComplianceScoreCard vehicle={vehicle} />

            {/* Ownership & Vendor */}
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                Ownership & Vendor
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Owner Name</label>
                  <p className="text-base font-semibold text-slate-800">{vehicle.rawData?.custrecord_owner_name_ag || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Owner Contact</label>
                  <p className="text-base font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {vehicle.rawData?.custrecord_owner_no_ag || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Vendor</label>
                  <p className="text-base font-semibold text-slate-800">{vehicle.vendorName}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Vendor Status</label>
                  <p className="text-base font-semibold text-slate-800 flex items-center gap-1.5">
                    {vehicle.rawData?.custrecord_vendor_name_ag?.isInactive ? (
                      <><AlertTriangle className="w-4 h-4 text-red-600" /> Inactive</>
                    ) : (
                      <><CheckCircle className="w-4 h-4 text-green-600" /> Active</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>

          {/* Sticky Action Buttons - Bottom */}
          {isEditMode && (
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 z-10">
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Image Lightbox Modal */}
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">{selectedImage.fileName}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-4">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.fileName}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              </div>
              <div className="flex items-center justify-between p-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Uploaded: {formatDate(selectedImage.uploadedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  )
}

export default VehicleDetailsPopup