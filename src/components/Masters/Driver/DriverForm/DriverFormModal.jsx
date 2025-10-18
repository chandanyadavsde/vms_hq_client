import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, CreditCard, Calendar, Upload, FileText, Save, AlertCircle, Camera, Image } from 'lucide-react'
import { getModalAnimation } from '../../../../utils/modalAnimations.js'

const DriverFormModal = ({
  isOpen,
  onClose,
  driver = null,
  onCreateDriver,
  onUpdateDriver,
  currentTheme = 'teal'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: {
      phone: ''
    },
    identification: {
      licenseNumber: '',
      licenseType: 'Light Motor Vehicle',
      licenseStartDate: '',
      licenseExpiry: '',
      licenseTestStatus: 'passed'
    },
    documents: [],
    photo: null
  })

  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [photoDragActive, setPhotoDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const isEditing = !!driver

  // Date validation state
  const [dateValidation, setDateValidation] = useState({
    licenseExpiry: {
      isValid: true,
      error: ''
    }
  })

  // Date validation functions
  const validateLicenseExpiry = (expiryDate, startDate) => {
    if (!expiryDate || !startDate) {
      return { isValid: true, error: '' }
    }

    const start = new Date(startDate)
    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison

    if (expiry < start) {
      return { 
        isValid: false, 
        error: 'License expiry date must be after start date' 
      }
    }

    if (expiry < today) {
      return { 
        isValid: false, 
        error: 'License expiry date cannot be in the past' 
      }
    }

    return { isValid: true, error: '' }
  }

  const isAllValid = () => {
    return dateValidation.licenseExpiry.isValid
  }

  const getAllErrors = () => {
    const errors = []
    if (!dateValidation.licenseExpiry.isValid) {
      errors.push({ field: 'licenseExpiry', error: dateValidation.licenseExpiry.error })
    }
    return errors
  }

  // Initialize form data when driver is provided
  useEffect(() => {
    if (driver) {
      setFormData({
        ...driver,
        photo: driver.photo ? {
          url: driver.photo,
          fileName: 'Current Photo',
          file: null // No file object for existing photos
        } : null
      })
    } else {
      // Reset form for new driver
      setFormData({
        name: '',
        contact: {
          phone: ''
        },
        identification: {
          licenseNumber: '',
          licenseType: 'Light Motor Vehicle',
          licenseStartDate: '',
          licenseExpiry: '',
          licenseTestStatus: 'passed'
        },
        documents: [],
        photo: null
      })
    }
    // Clear any errors and success when modal opens
    setError(null)
    setSuccess(false)
    // Reset date validation
    setDateValidation({
      licenseExpiry: {
        isValid: true,
        error: ''
      }
    })
  }, [driver, isOpen])

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

    // Validate date fields
    if (field === 'identification.licenseExpiry') {
      const validation = validateLicenseExpiry(value, formData.identification.licenseStartDate)
      setDateValidation(prev => ({
        ...prev,
        licenseExpiry: validation
      }))
    } else if (field === 'identification.licenseStartDate') {
      // Re-validate expiry date when start date changes
      const validation = validateLicenseExpiry(formData.identification.licenseExpiry, value)
      setDateValidation(prev => ({
        ...prev,
        licenseExpiry: validation
      }))
    }
  }

  const handleFileUpload = (file) => {
    const newDocument = {
      id: Date.now().toString(),
      fileName: file.name,
      file: file,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Uploaded'
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument]
    }))
  }

  const handlePhotoUpload = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size must be less than 5MB')
      return
    }

    const photoData = {
      file: file,
      url: URL.createObjectURL(file),
      fileName: file.name
    }

    setFormData(prev => ({
      ...prev,
      photo: photoData
    }))
  }

  const handlePhotoRemove = () => {
    setFormData(prev => ({
      ...prev,
      photo: null
    }))
  }

  const handleFileRemove = (documentId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handlePhotoDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setPhotoDragActive(true)
    } else if (e.type === "dragleave") {
      setPhotoDragActive(false)
    }
  }

  const handlePhotoDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setPhotoDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0])
    }
  }

  const handlePhotoInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoUpload(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null) // Clear any previous errors
    setSuccess(false) // Clear any previous success
    
    // Check date validations before submission
    if (!isAllValid()) {
      const errors = getAllErrors()
      setError(`Please fix date validation errors: ${errors.map(e => e.error).join(', ')}`)
      setLoading(false)
      return
    }
    
    try {
      // Clean the form data to only include required fields
      const cleanFormData = {
        name: formData.name,
        contact: {
          phone: formData.contact.phone
        },
        identification: {
          licenseNumber: formData.identification.licenseNumber,
          licenseType: formData.identification.licenseType,
          licenseStartDate: formData.identification.licenseStartDate,
          licenseExpiry: formData.identification.licenseExpiry,
          licenseTestStatus: formData.identification.licenseTestStatus
        },
        documents: formData.documents,
        photo: formData.photo
      }
      
      console.log('📝 Clean form data being sent:', cleanFormData)
      
      if (isEditing) {
        await onUpdateDriver(driver.id, cleanFormData)
      } else {
        await onCreateDriver(cleanFormData)
      }
      
      // Show success message
      setSuccess(true)
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Error saving driver:', error)
      // Extract error message from API response
      const errorMessage = error.message || 'Failed to create driver. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsAnimating(true)
    onClose()
  }

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
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {isEditing ? 'Edit Driver' : 'Add New Driver'}
                  </h2>
                  <p className="text-sm text-slate-600">Enter driver information and documents</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
              <p className="text-green-700 mt-1">Driver {isEditing ? 'updated' : 'created'} successfully. Closing modal...</p>
            </div>
          )}

          {/* Form Content */}
          <div className="p-3">
            <form id="driver-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="bg-slate-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  Driver Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Driver Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter driver's full name"
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                      placeholder="Enter mobile number"
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Driver Documents */}
              <div className="bg-slate-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Driver Documents
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Driver Photo */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-green-500" />
                      Driver Photo
                    </h4>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
                        photoDragActive
                          ? 'border-green-500 bg-green-50 scale-105'
                          : 'border-green-300 hover:border-green-400 hover:bg-green-25'
                      }`}
                      onDragEnter={handlePhotoDrag}
                      onDragLeave={handlePhotoDrag}
                      onDragOver={handlePhotoDrag}
                      onDrop={handlePhotoDrop}
                    >
                      {formData.photo ? (
                        <div className="space-y-2">
                          <div className="relative inline-block">
                            <img
                              src={formData.photo.url}
                              alt="Driver preview"
                              className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md"
                            />
                            <button
                              type="button"
                              onClick={handlePhotoRemove}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">{formData.photo.fileName}</p>
                            <p className="text-xs text-slate-500">
                              {formData.photo.file ? 'New photo selected' : 'Current photo'}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoInput}
                            className="hidden"
                            id="driver-photo-upload"
                          />
                          <label
                            htmlFor="driver-photo-upload"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-md cursor-pointer transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            {formData.photo.file ? 'Change' : 'Update'}
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Image className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">
                              Drop photo here or{' '}
                              <label className="text-green-600 cursor-pointer hover:underline">
                                browse
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoInput}
                                  className="hidden"
                                  id="driver-photo-upload"
                                />
                              </label>
                            </p>
                            <p className="text-xs text-slate-500">JPG, PNG</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* License Document */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Driver License Document *
                    </h4>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50 scale-105'
                          : 'border-blue-300 hover:border-blue-400 hover:bg-blue-25'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {formData.documents.length > 0 ? (
                        <div className="space-y-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">{formData.documents[0].fileName}</p>
                            <p className="text-xs text-slate-500">Document uploaded</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(formData.documents[0].id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">
                              Drop license document here or{' '}
                              <label className="text-blue-600 cursor-pointer hover:underline">
                                browse
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={handleFileInput}
                                  className="hidden"
                                />
                              </label>
                            </p>
                            <p className="text-xs text-slate-500">JPG, PNG, PDF</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="bg-slate-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={formData.identification.licenseNumber}
                      onChange={(e) => handleInputChange('identification.licenseNumber', e.target.value)}
                      placeholder="e.g., DL123456789"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      License Type *
                    </label>
                    <select
                      value={formData.identification.licenseType}
                      onChange={(e) => handleInputChange('identification.licenseType', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    >
                      <option value="Light Motor Vehicle">Light Motor Vehicle</option>
                      <option value="Heavy Vehicle">Heavy Vehicle</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Commercial Vehicle">Commercial Vehicle</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      License Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.identification.licenseStartDate}
                      onChange={(e) => handleInputChange('identification.licenseStartDate', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      License Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={formData.identification.licenseExpiry}
                      onChange={(e) => handleInputChange('identification.licenseExpiry', e.target.value)}
                      min={formData.identification.licenseStartDate || new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-lg ${
                        dateValidation.licenseExpiry.isValid === false 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-300'
                      }`}
                      required
                    />
                    {/* Date validation error */}
                    {dateValidation.licenseExpiry.isValid === false && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>{dateValidation.licenseExpiry.error}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      License Test Status *
                    </label>
                    <select
                      value={formData.identification.licenseTestStatus}
                      onChange={(e) => handleInputChange('identification.licenseTestStatus', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    >
                      <option value="passed">Passed</option>
                      <option value="fail">Failed</option>
                    </select>
                  </div>
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
                form="driver-form"
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
                    {isEditing ? 'Update Driver' : 'Create Driver'}
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

export default DriverFormModal