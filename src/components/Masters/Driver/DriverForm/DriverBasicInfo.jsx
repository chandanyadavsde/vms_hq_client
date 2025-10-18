import React from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, MapPin, Activity } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const DriverBasicInfo = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)

  const driverStatuses = [
    'Active',
    'Inactive',
    'Suspended'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
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
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Driver Basic Information</h3>
        <p className="text-gray-600">Enter the essential details for the driver</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <User className="w-4 h-4 text-emerald-500" />
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter driver's full name"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <Activity className="w-4 h-4 text-green-400" />
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            required
          >
            {driverStatuses.map(status => (
              <option key={status} value={status} className="bg-white text-gray-700">
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <Phone className="w-4 h-4 text-green-400" />
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.contact.phone}
            onChange={(e) => handleContactChange('phone', e.target.value)}
            placeholder="e.g., +91 98765 43210"
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <Mail className="w-4 h-4 text-green-400" />
            Email Address *
          </label>
          <input
            type="email"
            value={formData.contact.email}
            onChange={(e) => handleContactChange('email', e.target.value)}
            placeholder="e.g., driver@example.com"
            className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-emerald-500 transition-all"
            required
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-gray-700 font-medium">
          <MapPin className="w-4 h-4 text-green-400" />
          Address *
        </label>
        <textarea
          value={formData.contact.address}
          onChange={(e) => handleContactChange('address', e.target.value)}
          placeholder="Enter complete address"
          rows={3}
          className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-emerald-500 transition-all resize-none"
          required
        />
      </div>

      {/* Additional Information */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-gray-700/80 text-sm">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-gray-700/80 text-sm">Emergency Contact</label>
            <input
              type="tel"
              value={formData.emergencyContact || ''}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Emergency contact number"
              className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {!formData.name && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-300 text-sm">Driver name is required</p>
        </motion.div>
      )}

      {!formData.contact.phone && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-300 text-sm">Phone number is required</p>
        </motion.div>
      )}

      {!formData.contact.email && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-300 text-sm">Email address is required</p>
        </motion.div>
      )}

      {!formData.contact.address && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-300 text-sm">Address is required</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DriverBasicInfo
