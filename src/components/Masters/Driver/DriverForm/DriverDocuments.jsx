import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, X, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const DriverDocuments = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)
  const [dragActive, setDragActive] = useState(false)

  const documentTypes = [
    'Driving License',
    'Medical Certificate',
    'Background Check',
    'Training Certificate',
    'Identity Proof',
    'Address Proof',
    'Other'
  ]

  const handleDocumentAdd = (type, file) => {
    const newDocument = {
      id: Date.now().toString(),
      type,
      fileName: file.name,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'Uploaded'
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument]
    }))
  }

  const handleDocumentRemove = (documentId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }))
  }

  const handleExpiryDateChange = (documentId, expiryDate) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(doc =>
        doc.id === documentId ? { ...doc, expiryDate } : doc
      )
    }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleDocumentAdd('Other', file)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      handleDocumentAdd('Other', file)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Valid':
        return 'text-emerald-400 bg-emerald-500/20'
      case 'Expired':
        return 'text-red-400 bg-red-500/20'
      case 'Expiring Soon':
        return 'text-amber-400 bg-amber-500/20'
      default:
        return 'text-cyan-400 bg-cyan-500/20'
    }
  }

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Driver Documents</h3>
        <p className="text-white/70">Upload and manage driver-related documents</p>
      </div>

      {/* Document Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-green-400 bg-green-500/10'
            : 'border-white/20 bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-white/60" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Upload Documents</h4>
            <p className="text-white/70 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <input
              type="file"
              onChange={handleFileInput}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              id="driver-document-upload"
            />
            <label
              htmlFor="driver-document-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              Choose Files
            </label>
          </div>
          <p className="text-xs text-white/50">
            Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
          </p>
        </div>
      </div>

      {/* Document List */}
      {formData.documents.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Uploaded Documents</h4>
          <div className="space-y-3">
            {formData.documents.map((document, index) => {
              const status = isExpired(document.expiryDate) 
                ? 'Expired' 
                : isExpiringSoon(document.expiryDate) 
                ? 'Expiring Soon' 
                : 'Valid'

              return (
                <motion.div
                  key={document.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="text-white font-medium">{document.fileName}</h5>
                        <p className="text-white/60 text-sm">{document.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <button
                        onClick={() => handleDocumentRemove(document.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-white/70 text-sm">Upload Date</label>
                      <div className="flex items-center gap-2 text-white/80">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{document.uploadDate}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-white/70 text-sm">Expiry Date</label>
                      <input
                        type="date"
                        value={document.expiryDate}
                        onChange={(e) => handleExpiryDateChange(document.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Document Types Guide */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Required Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documentTypes.map((type) => (
            <div key={type} className="flex items-center gap-2 text-white/80">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Status Summary */}
      {formData.documents.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Document Status Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {formData.documents.filter(doc => !isExpired(doc.expiryDate) && !isExpiringSoon(doc.expiryDate)).length}
              </div>
              <div className="text-sm text-white/70">Valid Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {formData.documents.filter(doc => isExpiringSoon(doc.expiryDate)).length}
              </div>
              <div className="text-sm text-white/70">Expiring Soon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {formData.documents.filter(doc => isExpired(doc.expiryDate)).length}
              </div>
              <div className="text-sm text-white/70">Expired</div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {formData.documents.length === 0 && (
        <motion.div
          className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <p className="text-amber-300 text-sm">No documents uploaded yet. Documents are optional but recommended.</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DriverDocuments
