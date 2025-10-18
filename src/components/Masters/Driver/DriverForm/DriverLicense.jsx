import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, Hash, FileText } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const DriverLicense = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)

  const licenseTypes = [
    'Heavy Vehicle',
    'Light Motor Vehicle',
    'Motorcycle',
    'Commercial Vehicle',
    'Public Service Vehicle',
    'Other'
  ]

  const handleIdentificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      identification: {
        ...prev.identification,
        [field]: value
      }
    }))
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">License & Identification</h3>
        <p className="text-gray-800/70">Enter driver's license and identification details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* License Number */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-800 font-medium">
            <Hash className="w-4 h-4 text-blue-400" />
            License Number *
          </label>
          <input
            type="text"
            value={formData.identification.licenseNumber}
            onChange={(e) => handleIdentificationChange('licenseNumber', e.target.value)}
            placeholder="e.g., DL123456789"
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>

        {/* License Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-800 font-medium">
            <FileText className="w-4 h-4 text-blue-400" />
            License Type *
          </label>
          <select
            value={formData.identification.licenseType}
            onChange={(e) => handleIdentificationChange('licenseType', e.target.value)}
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            required
          >
            {licenseTypes.map(type => (
              <option key={type} value={type} className="bg-white text-gray-800">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* License Expiry */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-800 font-medium">
            <Calendar className="w-4 h-4 text-blue-400" />
            License Expiry Date *
          </label>
          <input
            type="date"
            value={formData.identification.licenseExpiry}
            onChange={(e) => handleIdentificationChange('licenseExpiry', e.target.value)}
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>

        {/* Aadhar Number */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-800 font-medium">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Aadhar Number
          </label>
          <input
            type="text"
            value={formData.identification.aadharNumber}
            onChange={(e) => handleIdentificationChange('aadharNumber', e.target.value)}
            placeholder="e.g., 1234 5678 9012"
            maxLength="14"
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* PAN Number */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-800 font-medium">
            <Hash className="w-4 h-4 text-blue-400" />
            PAN Number
          </label>
          <input
            type="text"
            value={formData.identification.panNumber}
            onChange={(e) => handleIdentificationChange('panNumber', e.target.value)}
            placeholder="e.g., ABCDE1234F"
            maxLength="10"
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* License Start Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-800 font-medium">
            <Calendar className="w-4 h-4 text-blue-400" />
            License Start Date *
          </label>
          <input
            type="date"
            value={formData.identification.licenseStartDate || ''}
            onChange={(e) => handleIdentificationChange('licenseStartDate', e.target.value)}
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>

        {/* License Test Status */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-800 font-medium">
            <FileText className="w-4 h-4 text-blue-400" />
            License Test Status *
          </label>
          <select
            value={formData.identification.licenseTestStatus || 'passed'}
            onChange={(e) => handleIdentificationChange('licenseTestStatus', e.target.value)}
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            required
          >
            <option value="passed" className="bg-white text-gray-800">Passed</option>
            <option value="fail" className="bg-white text-gray-800">Failed</option>
          </select>
        </div>
      </div>

      {/* Additional Identification */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Additional Identification</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-gray-800/80 text-sm">Passport Number</label>
            <input
              type="text"
              value={formData.identification.passportNumber || ''}
              onChange={(e) => handleIdentificationChange('passportNumber', e.target.value)}
              placeholder="Passport number (if available)"
              className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-gray-800/80 text-sm">Voter ID Number</label>
            <input
              type="text"
              value={formData.identification.voterIdNumber || ''}
              onChange={(e) => handleIdentificationChange('voterIdNumber', e.target.value)}
              placeholder="Voter ID number (if available)"
              className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* License Status Check */}
      {formData.identification.licenseExpiry && (
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">License Status</h4>
          <div className="flex items-center gap-3">
            {(() => {
              const expiryDate = new Date(formData.identification.licenseExpiry)
              const today = new Date()
              const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
              
              if (daysUntilExpiry < 0) {
                return (
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-sm">License Expired</span>
                  </div>
                )
              } else if (daysUntilExpiry <= 30) {
                return (
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span className="text-sm">License Expiring Soon ({daysUntilExpiry} days)</span>
                  </div>
                )
              } else {
                return (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm">License Valid ({daysUntilExpiry} days remaining)</span>
                  </div>
                )
              }
            })()}
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {!formData.identification.licenseNumber && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-300 text-sm">License number is required</p>
        </motion.div>
      )}

      {!formData.identification.licenseExpiry && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-300 text-sm">License expiry date is required</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DriverLicense
