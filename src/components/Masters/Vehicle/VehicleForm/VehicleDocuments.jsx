import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, X, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const VehicleDocuments = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)
  const [dragActive, setDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState({})

  const handleInputChange = (field, value) => {
    console.log('VehicleDocuments: handleInputChange called with:', field, value)
    setFormData({
      [field]: value
    })
  }

  const handleFileUpload = (documentType, files) => {
    const fileList = Array.from(files)
    const fieldName = `${documentType}_files`
    
    // Update the form data with the new files
    const existingFiles = formData[fieldName] || []
    const newFiles = [...existingFiles, ...fileList]
    
    handleInputChange(fieldName, newFiles)
    
    // Set uploading state
    setUploadingFiles(prev => ({
      ...prev,
      [documentType]: true
    }))
    
    // Simulate upload completion
    setTimeout(() => {
      setUploadingFiles(prev => ({
        ...prev,
        [documentType]: false
      }))
    }, 1000)
  }

  const handleFileRemove = (documentType, fileIndex) => {
    const fieldName = `${documentType}_files`
    const currentFiles = formData[fieldName] || []
    const updatedFiles = currentFiles.filter((_, index) => index !== fileIndex)
    handleInputChange(fieldName, updatedFiles)
  }

  const handleDrop = (e, documentType) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(documentType, e.dataTransfer.files)
    }
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

  const FileUploadSection = ({ documentType, title, icon: Icon, fields }) => {
    const files = formData[`${documentType}_files`] || []
    const isUploading = uploadingFiles[documentType]

    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-500" />
          <h4 className="font-medium text-gray-800">{title}</h4>
        </div>

        {/* Document Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                {field.type === 'date' && <Calendar className="w-3.5 h-3.5 text-blue-500" />}
                {field.type === 'text' && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                {field.label} {field.required && '*'}
              </label>
              <input
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required={field.required}
              />
            </div>
          ))}
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, documentType)}
        >
          <input
            type="file"
            id={`${documentType}-upload`}
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => handleFileUpload(documentType, e.target.files)}
          />
          
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <label
                htmlFor={`${documentType}-upload`}
                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Click to upload
              </label>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-sm text-gray-400">PDF, DOC, JPG, PNG up to 10MB each</p>
          </div>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Uploaded Files:</h5>
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileRemove(documentType, index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Uploading files...</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Vehicle Documents</h3>
        <p className="text-sm text-gray-600">Upload required legal documents for the vehicle</p>
      </div>

      <div className="space-y-6">
        {/* RC (Registration Certificate) */}
        <FileUploadSection
          documentType="rc"
          title="Registration Certificate (RC)"
          icon={FileText}
          fields={[
            {
              name: 'custrecord_rc_no',
              label: 'RC Number',
              type: 'text',
              placeholder: 'e.g., RC123456789',
              required: true
            },
            {
              name: 'custrecord_rc_start_date',
              label: 'RC Start Date',
              type: 'date',
              required: true
            },
            {
              name: 'custrecord_rc_end_date',
              label: 'RC End Date',
              type: 'date',
              required: true
            }
          ]}
        />

        {/* Insurance */}
        <FileUploadSection
          documentType="insurance"
          title="Insurance Certificate"
          icon={FileText}
          fields={[
            {
              name: 'custrecord_insurance_company_name_ag',
              label: 'Insurance Company',
              type: 'text',
              placeholder: 'e.g., Insurance Company Name',
              required: true
            },
            {
              name: 'custrecord_insurance_number_ag',
              label: 'Insurance Number',
              type: 'text',
              placeholder: 'e.g., INS123456',
              required: true
            },
            {
              name: 'custrecord_insurance_start_date_ag',
              label: 'Insurance Start Date',
              type: 'date',
              required: true
            },
            {
              name: 'custrecord_insurance_end_date_ag',
              label: 'Insurance End Date',
              type: 'date',
              required: true
            }
          ]}
        />

        {/* Permit */}
        <FileUploadSection
          documentType="permit"
          title="Permit Certificate"
          icon={FileText}
          fields={[
            {
              name: 'custrecord_permit_number_ag',
              label: 'Permit Number',
              type: 'text',
              placeholder: 'e.g., PERMIT123456',
              required: true
            },
            {
              name: 'custrecord_permit_start_date',
              label: 'Permit Start Date',
              type: 'date',
              required: true
            },
            {
              name: 'custrecord_permit_end_date',
              label: 'Permit End Date',
              type: 'date',
              required: true
            }
          ]}
        />

        {/* PUC */}
        <FileUploadSection
          documentType="puc"
          title="PUC Certificate"
          icon={FileText}
          fields={[
            {
              name: 'custrecord_puc_number',
              label: 'PUC Number',
              type: 'text',
              placeholder: 'e.g., PUC123456',
              required: true
            },
            {
              name: 'custrecord_puc_start_date_ag',
              label: 'PUC Start Date',
              type: 'date',
              required: true
            },
            {
              name: 'custrecord_puc_end_date_ag',
              label: 'PUC End Date',
              type: 'date',
              required: true
            }
          ]}
        />

        {/* Fitness Certificate */}
        <FileUploadSection
          documentType="fitness"
          title="Fitness Certificate"
          icon={FileText}
          fields={[
            {
              name: 'custrecord_tms_vehicle_fit_cert_vld_upto',
              label: 'Fitness Valid Up To',
              type: 'date',
              required: true
            }
          ]}
        />
      </div>
    </motion.div>
  )
}

export default VehicleDocuments