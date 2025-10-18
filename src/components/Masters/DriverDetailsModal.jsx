import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, FileText, Calendar, Car, UserCheck, Edit, Eye, Upload, Save, RotateCcw, Loader2, AlertCircle } from 'lucide-react'
import { getModalAnimation } from '../../utils/modalAnimations.js'
import DriverService from '../../services/DriverService'

const DriverDetailsModal = ({ driver, onClose, onDriverUpdate }) => {
  if (!driver) return null

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({
    phone: '',
    licenseExpiry: '',
    newImage: null,
    previewUrl: null
  })
  const [showImageControls, setShowImageControls] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Date validation state
  const [dateValidation, setDateValidation] = useState({
    licenseExpiry: {
      isValid: true,
      error: ''
    }
  })

  // Initialize edit data when driver changes
  useEffect(() => {
    if (driver) {
      setEditData({
        phone: driver.contact?.phone || '',
        licenseExpiry: driver.identification?.licenseExpiry || '',
        newImage: null,
        previewUrl: null
      })
    }
  }, [driver])

  const isLicenseExpired = new Date(driver.identification?.licenseExpiry) < new Date()
  const isLicenseExpiringSoon = new Date(driver.identification?.licenseExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  // Date validation functions
  const validateLicenseExpiry = (dateValue) => {
    if (!dateValue) {
      return { isValid: true, error: '' }
    }

    const selectedDate = new Date(dateValue)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison

    if (selectedDate < today) {
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

  // Edit mode handlers
  const handleEditMode = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditData({
      phone: driver.contact?.phone || '',
      licenseExpiry: driver.identification?.licenseExpiry || '',
      newImage: null,
      previewUrl: null
    })
    // Reset date validation
    setDateValidation({
      licenseExpiry: {
        isValid: true,
        error: ''
      }
    })
  }

  const handleSaveEdit = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    // Check date validations before submission
    if (!isAllValid()) {
      const errors = getAllErrors()
      setError(`Please fix date validation errors: ${errors.map(e => e.error).join(', ')}`)
      setIsLoading(false)
      return
    }
    
    try {
      console.log('💾 Saving driver edit:', editData)
      
      // Prepare update data
      const updateData = {
        phone: editData.phone,
        licenseExpiry: editData.licenseExpiry,
        newImage: editData.newImage
      }
      
      console.log('📝 Update data being sent:', updateData)
      console.log('📝 newImage:', editData.newImage)
      console.log('📝 newImage type:', typeof editData.newImage)
      console.log('📝 newImage instanceof File:', editData.newImage instanceof File)
      
      // Call API to update driver
      const response = await DriverService.updateDriver(driver.id, updateData)
      
      if (response && response.driver) {
        console.log('✅ Driver updated successfully:', response)
        
        // Show success message
        setSuccess(true)
        
        // Update the driver data in parent component
        if (onDriverUpdate) {
          onDriverUpdate(response.driver)
        }
        
        // Close edit mode after a short delay
        setTimeout(() => {
          setIsEditMode(false)
          setSuccess(false)
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Error updating driver:', error)
      setError(error.message || 'Failed to update driver. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))

    // Validate date fields
    if (field === 'licenseExpiry') {
      const validation = validateLicenseExpiry(value)
      setDateValidation(prev => ({
        ...prev,
        licenseExpiry: validation
      }))
    }
  }

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file)
      setEditData(prev => ({
        ...prev,
        newImage: file,
        previewUrl: previewUrl
      }))
    }
  }

  const handleRemoveImage = () => {
    setEditData(prev => ({
      ...prev,
      newImage: null,
      previewUrl: null
    }))
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onClose()
      setIsAnimating(false)
    }, 300)
  }

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
                    {driver.name}
                    {isEditMode && (
                      <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        Editing...
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {isEditMode ? 'Edit Driver Information' : 'Driver Details'}
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
                <p className="text-green-700 mt-1">Driver updated successfully!</p>
              </div>
            )}

            {/* License Status Badge */}
            <div className="mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                isLicenseExpired 
                  ? 'bg-red-100 text-red-800'
                  : isLicenseExpiringSoon
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {isLicenseExpired ? 'License Expired' : isLicenseExpiringSoon ? 'License Expiring Soon' : 'License Valid'}
              </span>
            </div>

            {/* Dashboard Grid Layout - 3 Rows */}
            <div className="space-y-4">
              {/* Row 1: Driver Profile + Assigned Vehicle */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Driver Profile Card */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-600" />
                    Driver Profile
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {driver.photo ? (
                        <img
                          src={driver.photo}
                          alt={driver.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-md">
                          <User className="w-6 h-6 text-orange-600" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        isLicenseExpired ? 'bg-red-500' : isLicenseExpiringSoon ? 'bg-orange-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-800">{driver.name}</h4>
                      <p className="text-slate-600 text-xs">Driver ID: {driver.id || driver._id || 'N/A'}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        isLicenseExpired ? 'bg-red-100 text-red-800' : isLicenseExpiringSoon ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isLicenseExpired ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Vehicle Card */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Car className="w-4 h-4 text-orange-600" />
                    Assigned Vehicle
                  </h3>
                  {driver.assignedVehicles && driver.assignedVehicles.length > 0 ? (
                    <div className="space-y-3">
                      {driver.assignedVehicles.map((vehicle, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Car className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 text-sm">{vehicle.vehicleNumber}</h4>
                            <p className="text-slate-600 text-xs">{vehicle.vehicleType || 'N/A'}</p>
                            <p className="text-slate-500 text-xs">Year: {vehicle.year || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <Car className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No vehicles assigned</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Contact & License Info + Driving History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Contact & License Information Card */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    Contact & License Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-600 text-xs">Phone</span>
                        {isEditMode ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <input
                              type="tel"
                              value={editData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full px-2 py-1 border border-orange-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                              placeholder="Enter phone number"
                            />
                          </div>
                        ) : (
                          <p className="text-slate-800 font-medium flex items-center gap-1 mt-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {driver.contact?.phone || 'N/A'}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-600 text-xs">License Number</span>
                        <p className="text-slate-800 font-medium flex items-center gap-1 mt-1 text-sm">
                          <FileText className="w-3 h-3" />
                          {driver.identification?.licenseNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-600 text-xs">License Type</span>
                        <p className="text-slate-800 font-medium mt-1 text-sm">
                          {driver.identification?.licenseType || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600 text-xs">Start Date</span>
                        <p className="text-slate-800 font-medium flex items-center gap-1 mt-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {driver.identification?.licenseStart || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600 text-xs">Expiration Date</span>
                        {isEditMode ? (
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <input
                                type="date"
                                value={editData.licenseExpiry}
                                onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm ${
                                  dateValidation.licenseExpiry.isValid === false 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-orange-300'
                                }`}
                              />
                            </div>
                            {dateValidation.licenseExpiry.isValid === false && (
                              <div className="flex items-center gap-1 text-red-600 text-xs">
                                <AlertCircle className="w-3 h-3" />
                                <span>{dateValidation.licenseExpiry.error}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className={`font-medium flex items-center gap-1 mt-1 text-sm ${
                            isLicenseExpired ? 'text-red-600' : isLicenseExpiringSoon ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {driver.identification?.licenseExpiry || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driving History Card */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Driving History
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-400">Coming Soon</p>
                      <p className="text-slate-600 text-xs">Start Date</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-400">Coming Soon</p>
                      <p className="text-slate-600 text-xs">Total Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-400">Coming Soon</p>
                      <p className="text-slate-600 text-xs">Accidents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-400">Coming Soon</p>
                      <p className="text-slate-600 text-xs">Violations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Performance Metrics + License Document */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Performance Metrics Card */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-orange-600" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 text-xs">★</span>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Average Rating</p>
                        <p className="text-sm font-bold text-slate-400">Coming Soon</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">On-Time Rate</p>
                        <p className="text-sm font-bold text-slate-400">Coming Soon</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <Car className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">Miles Driven</p>
                        <p className="text-sm font-bold text-slate-400">Coming Soon</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* License Document Card */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-orange-600" />
                    License Document
                    {isEditMode && (
                      <span className="text-xs text-orange-600 font-normal">(Click to edit)</span>
                    )}
                  </h3>
                  <div 
                    className="flex items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-200 relative"
                    onMouseEnter={() => setShowImageControls(true)}
                    onMouseLeave={() => setShowImageControls(false)}
                  >
                    {(editData.previewUrl || (driver.rawData?.custrecord_driving_license_attachment && driver.rawData.custrecord_driving_license_attachment.length > 0)) ? (
                      <div className="text-center relative">
                        <div className="w-40 h-28 mx-auto mb-2 rounded-lg bg-white flex items-center justify-center overflow-hidden relative border shadow-sm">
                          <img 
                            src={editData.previewUrl || driver.rawData.custrecord_driving_license_attachment[0]} 
                            alt="Driving License Document"
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center">
                            <FileText className="w-6 h-6 text-slate-400" />
                          </div>
                          
                          {/* Image Edit Controls */}
                          {isEditMode && (showImageControls || editData.newImage) && (
                            <div className="absolute top-1 right-1 flex gap-1">
                              <button
                                onClick={handleRemoveImage}
                                className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                title="Remove Image"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                              <label className="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer">
                                <Upload className="w-2.5 h-2.5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileInput}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                        <p className="text-slate-600 text-xs">
                          {editData.newImage ? 'New License Document (Preview)' : 'Driving License Document'}
                        </p>
                        {!isEditMode && (
                          <button 
                            onClick={() => window.open(driver.rawData.custrecord_driving_license_attachment[0], '_blank')}
                            className="mt-1 px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md transition-colors text-xs font-medium"
                          >
                            View Full Image
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        {isEditMode ? (
                          <div className="border-2 border-dashed border-orange-300 rounded-lg p-3 hover:border-orange-400 transition-colors">
                            <Upload className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                            <p className="text-slate-600 text-xs mb-2">Upload License Document</p>
                            <label className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md transition-colors text-xs font-medium cursor-pointer">
                              Choose File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-7 mx-auto mb-2 rounded-lg bg-slate-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-slate-600 text-xs">No License Document Available</p>
                          </>
                        )}
                      </div>
                    )}
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
    </AnimatePresence>
  )
}

export default DriverDetailsModal
