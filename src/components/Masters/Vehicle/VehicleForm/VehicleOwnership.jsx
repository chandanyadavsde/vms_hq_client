import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Building2, MapPin, Users, Activity } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const VehicleOwnership = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)

  const handleInputChange = (field, value) => {
    setFormData({
      [field]: value
    })
  }

  const handleVendorChange = (field, value) => {
    const currentVendor = formData.custrecord_vendor_name_ag || {}
    let vendorData
    
    if (typeof currentVendor === 'string') {
      try {
        vendorData = JSON.parse(currentVendor)
      } catch (e) {
        vendorData = { id: '', name: '', isInactive: false }
      }
    } else {
      vendorData = currentVendor
    }

    const updatedVendor = {
      ...vendorData,
      [field]: value
    }

    handleInputChange('custrecord_vendor_name_ag', JSON.stringify(updatedVendor))
  }

  const getVendorField = (field) => {
    const vendor = formData.custrecord_vendor_name_ag || {}
    let vendorData
    
    if (typeof vendor === 'string') {
      try {
        vendorData = JSON.parse(vendor)
      } catch (e) {
        vendorData = { id: '', name: '', isInactive: false }
      }
    } else {
      vendorData = vendor
    }

    return vendorData[field] || ''
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
          <Users className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ownership & Vendor Details</h3>
        <p className="text-gray-600">Enter owner information and vendor details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Owner Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-500" />
            Owner Information
          </h4>
          
          <div className="space-y-4">
            {/* Owner Name - API: custrecord_owner_name_ag */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <User className="w-4 h-4 text-emerald-500" />
                Owner Name
              </label>
              <input
                type="text"
                value={formData.custrecord_owner_name_ag || ''}
                onChange={(e) => handleInputChange('custrecord_owner_name_ag', e.target.value)}
                placeholder="e.g., Vehicle Owner Name"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Owner Phone - API: custrecord_owner_no_ag */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <Phone className="w-4 h-4 text-emerald-500" />
                Owner Phone Number
              </label>
              <input
                type="tel"
                value={formData.custrecord_owner_no_ag || ''}
                onChange={(e) => handleInputChange('custrecord_owner_no_ag', e.target.value)}
                placeholder="e.g., +91-9876543210"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            Vendor Information
          </h4>
          
          <div className="space-y-4">
            {/* Vendor ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Vendor ID
              </label>
              <input
                type="text"
                value={getVendorField('id')}
                onChange={(e) => handleVendorChange('id', e.target.value)}
                placeholder="e.g., vendor1, vendor2"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Vendor Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <Building2 className="w-4 h-4 text-emerald-500" />
                Vendor Name
              </label>
              <input
                type="text"
                value={getVendorField('name')}
                onChange={(e) => handleVendorChange('name', e.target.value)}
                placeholder="e.g., Vendor Company Name"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Vendor Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium">
                <Activity className="w-4 h-4 text-emerald-500" />
                Vendor Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vendor_status"
                    value="false"
                    checked={getVendorField('isInactive') === false}
                    onChange={(e) => handleVendorChange('isInactive', false)}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 focus:ring-2"
                  />
                  <span className="text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="vendor_status"
                    value="true"
                    checked={getVendorField('isInactive') === true}
                    onChange={(e) => handleVendorChange('isInactive', true)}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 focus:ring-2"
                  />
                  <span className="text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FCM Token - API: fcm_token */}
          <div className="space-y-2">
            <label className="text-gray-600 text-sm">FCM Token (Optional)</label>
            <input
              type="text"
              value={formData.fcm_token || ''}
              onChange={(e) => handleInputChange('fcm_token', e.target.value)}
              placeholder="Firebase token for notifications"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-gray-600 text-sm">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about ownership or vendor"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Information Note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Users className="w-3 h-3 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-emerald-800 font-medium mb-1">Ownership Information</h4>
            <p className="text-emerald-700 text-sm">
              Owner and vendor information helps in better vehicle management and communication. 
              All fields are optional but recommended for complete records.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VehicleOwnership
