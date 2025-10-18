import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Activity, Tag, FileText, User, Phone } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const VehicleBasicInfo = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)

  // API Contract Vehicle Types
  const vehicleTypes = [
    'ODC',
    'Lattice Tower'
  ]

  const vehicleStatuses = [
    'Active',
    'Inactive',
    'Maintenance',
    'Retired'
  ]

  // API Contract Plants
  const plants = [
    'pune',
    'solapur', 
    'surat',
    'free'
  ]

  const handleInputChange = (field, value) => {
    console.log('VehicleBasicInfo: handleInputChange called with:', field, value)
    setFormData({
      [field]: value
    })
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Basic Vehicle Information</h3>
        <p className="text-sm text-gray-600">Enter the essential details for the vehicle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Number - API: custrecord_vehicle_number */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            Vehicle Number *
          </label>
          <input
            type="text"
            value={formData.custrecord_vehicle_number || ''}
            onChange={(e) => handleInputChange('custrecord_vehicle_number', e.target.value)}
            placeholder="e.g., MH-12-AB-1234"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        {/* Vehicle Name - API: custrecord_vehicle_name_ag */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <FileText className="w-3.5 h-3.5 text-orange-500" />
            Vehicle Name *
          </label>
          <input
            type="text"
            value={formData.custrecord_vehicle_name_ag || ''}
            onChange={(e) => handleInputChange('custrecord_vehicle_name_ag', e.target.value)}
            placeholder="e.g., Blade Transport Vehicle"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        {/* Vehicle Type - API: custrecord_vehicle_type_ag */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            Vehicle Type *
          </label>
          <select
            value={formData.custrecord_vehicle_type_ag || ''}
            onChange={(e) => handleInputChange('custrecord_vehicle_type_ag', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none cursor-pointer"
            required
          >
            <option value="" className="bg-white text-gray-900">Select Vehicle Type</option>
            {vehicleTypes.map(type => (
              <option key={type} value={type} className="bg-white text-gray-900">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Current Plant - API: currentPlant */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Building2 className="w-3.5 h-3.5 text-orange-500" />
            Current Plant *
          </label>
          <select
            value={formData.currentPlant || ''}
            onChange={(e) => handleInputChange('currentPlant', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none cursor-pointer"
            required
          >
            <option value="" className="bg-white text-gray-900">Select Plant</option>
            {plants.map(plant => (
              <option key={plant} value={plant} className="bg-white text-gray-900">
                {plant.charAt(0).toUpperCase() + plant.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Owner Name - API: custrecord_owner_name_ag */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <User className="w-3.5 h-3.5 text-orange-500" />
            Owner Name *
          </label>
          <input
            type="text"
            value={formData.custrecord_owner_name_ag || ''}
            onChange={(e) => handleInputChange('custrecord_owner_name_ag', e.target.value)}
            placeholder="e.g., ABC Transport Company"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        {/* Owner Phone - API: custrecord_owner_no_ag */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Phone className="w-3.5 h-3.5 text-orange-500" />
            Owner Phone *
          </label>
          <input
            type="tel"
            value={formData.custrecord_owner_no_ag || ''}
            onChange={(e) => handleInputChange('custrecord_owner_no_ag', e.target.value)}
            placeholder="e.g., +91-9876543210"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        {/* Chassis Number - API: custrecord_chassis_number */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            Chassis Number *
          </label>
          <input
            type="text"
            value={formData.custrecord_chassis_number || ''}
            onChange={(e) => handleInputChange('custrecord_chassis_number', e.target.value)}
            placeholder="e.g., CHASSIS123456"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>


        {/* Engine Number - API: custrecord_engine_number_ag */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            Engine Number *
          </label>
          <input
            type="text"
            value={formData.custrecord_engine_number_ag || ''}
            onChange={(e) => handleInputChange('custrecord_engine_number_ag', e.target.value)}
            placeholder="e.g., ENGINE123456"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        {/* Age of Vehicle - API: custrecord_age_of_vehicle */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            Age of Vehicle
          </label>
          <input
            type="text"
            value={formData.custrecord_age_of_vehicle || ''}
            onChange={(e) => handleInputChange('custrecord_age_of_vehicle', e.target.value)}
            placeholder="e.g., 5 years"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>

        {/* GPS Available - API: custrecord_vehicle_master_gps_available */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            GPS Available *
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gps_available"
                value="true"
                checked={formData.custrecord_vehicle_master_gps_available === true}
                onChange={() => handleInputChange('custrecord_vehicle_master_gps_available', true)}
                className="w-3.5 h-3.5 text-orange-500 focus:ring-orange-500 focus:ring-2"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gps_available"
                value="false"
                checked={formData.custrecord_vehicle_master_gps_available === false}
                onChange={() => handleInputChange('custrecord_vehicle_master_gps_available', false)}
                className="w-3.5 h-3.5 text-orange-500 focus:ring-orange-500 focus:ring-2"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        </div>

        {/* Vendor Name - API: custrecord_vendor_name_ag */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Building2 className="w-3.5 h-3.5 text-orange-500" />
            Vendor Name *
          </label>
          <input
            type="text"
            value={(() => {
              try {
                const vendor = JSON.parse(formData.custrecord_vendor_name_ag || '{}')
                return vendor.name || ''
              } catch (e) {
                return formData.custrecord_vendor_name_ag || ''
              }
            })()}
            onChange={(e) => {
              try {
                const currentVendor = JSON.parse(formData.custrecord_vendor_name_ag || '{}')
                const updatedVendor = { ...currentVendor, name: e.target.value }
                handleInputChange('custrecord_vendor_name_ag', JSON.stringify(updatedVendor))
              } catch (error) {
                // If parsing fails, create new vendor object
                handleInputChange('custrecord_vendor_name_ag', JSON.stringify({
                  name: e.target.value,
                  contact: '',
                  isInactive: false
                }))
              }
            }}
            placeholder="e.g., ABC Logistics"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        {/* Created By - API: custrecord_create_by */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <User className="w-3.5 h-3.5 text-orange-500" />
            Created By *
          </label>
          <input
            type="text"
            value={formData.custrecord_create_by || ''}
            onChange={(e) => handleInputChange('custrecord_create_by', e.target.value)}
            placeholder="e.g., admin"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            required
          />
        </div>

        {/* FCM Token - API: fcm_token */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Phone className="w-3.5 h-3.5 text-orange-500" />
            FCM Token
          </label>
          <input
            type="text"
            value={formData.fcm_token || ''}
            onChange={(e) => handleInputChange('fcm_token', e.target.value)}
            placeholder="Firebase token (optional)"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

    </motion.div>
  )
}

export default VehicleBasicInfo
