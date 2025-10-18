import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Calendar, Palette, Hash, Wrench } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const VehicleTechnical = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)

  const handleInputChange = (field, value) => {
    setFormData({
      [field]: value
    })
  }

  const handleSpecificationChange = (field, value) => {
    setFormData({
      specifications: {
        ...formData.specifications,
        [field]: value
      }
    })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i)

  const colors = [
    'White',
    'Black',
    'Silver',
    'Gray',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Orange',
    'Brown',
    'Other'
  ]

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Settings className="w-6 h-6 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Technical Specifications</h3>
        <p className="text-sm text-gray-600">Enter the technical details and specifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Age of Vehicle - API: custrecord_age_of_vehicle */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Calendar className="w-4 h-4 text-blue-500" />
            Age of Vehicle
          </label>
          <input
            type="text"
            value={formData.custrecord_age_of_vehicle || ''}
            onChange={(e) => handleInputChange('custrecord_age_of_vehicle', e.target.value)}
            placeholder="e.g., 5 years, 2 years"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Chassis Number - API: custrecord_chassis_number */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Hash className="w-4 h-4 text-blue-500" />
            Chassis Number
          </label>
          <input
            type="text"
            value={formData.custrecord_chassis_number || ''}
            onChange={(e) => handleInputChange('custrecord_chassis_number', e.target.value)}
            placeholder="e.g., CHASSIS123456"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Engine Number - API: custrecord_engine_number_ag */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Wrench className="w-4 h-4 text-blue-500" />
            Engine Number
          </label>
          <input
            type="text"
            value={formData.custrecord_engine_number_ag || ''}
            onChange={(e) => handleInputChange('custrecord_engine_number_ag', e.target.value)}
            placeholder="e.g., ENGINE123456"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Keep existing specifications for additional data */}
        {/* Make */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Wrench className="w-4 h-4 text-blue-400" />
            Make
          </label>
          <input
            type="text"
            value={formData.specifications?.make || ''}
            onChange={(e) => handleSpecificationChange('make', e.target.value)}
            placeholder="e.g., Tata, Mahindra, Ashok Leyland"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Model */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Settings className="w-4 h-4 text-blue-400" />
            Model
          </label>
          <input
            type="text"
            value={formData.specifications?.model || ''}
            onChange={(e) => handleSpecificationChange('model', e.target.value)}
            placeholder="e.g., Ace, Bolero, 407"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Manufacturing Year */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Calendar className="w-4 h-4 text-blue-400" />
            Manufacturing Year
          </label>
          <select
            value={formData.specifications?.year || currentYear}
            onChange={(e) => handleSpecificationChange('year', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            {years.map(year => (
              <option key={year} value={year} className="bg-white text-gray-900">
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Technical Details */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Additional Technical Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-gray-700/80 text-sm">Fuel Type</label>
            <select
              value={formData.specifications.fuelType || ''}
              onChange={(e) => handleSpecificationChange('fuelType', e.target.value)}
              className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-white text-gray-700">Select Fuel Type</option>
              <option value="Diesel" className="bg-white text-gray-700">Diesel</option>
              <option value="Petrol" className="bg-white text-gray-700">Petrol</option>
              <option value="CNG" className="bg-white text-gray-700">CNG</option>
              <option value="Electric" className="bg-white text-gray-700">Electric</option>
              <option value="Hybrid" className="bg-white text-gray-700">Hybrid</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-gray-700/80 text-sm">Engine Capacity (CC)</label>
            <input
              type="number"
              value={formData.specifications.engineCapacity || ''}
              onChange={(e) => handleSpecificationChange('engineCapacity', e.target.value)}
              placeholder="e.g., 1500"
              className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-gray-700/80 text-sm">Mileage (km/l)</label>
            <input
              type="number"
              step="0.1"
              value={formData.specifications.mileage || ''}
              onChange={(e) => handleSpecificationChange('mileage', e.target.value)}
              placeholder="e.g., 15.5"
              className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-gray-700/80 text-sm">Seating Capacity</label>
            <input
              type="number"
              value={formData.specifications.seatingCapacity || ''}
              onChange={(e) => handleSpecificationChange('seatingCapacity', e.target.value)}
              placeholder="e.g., 2, 4, 8"
              className="w-full px-4 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {!formData.specifications.make && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-300 text-sm">Vehicle make is required</p>
        </motion.div>
      )}

      {!formData.specifications.model && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-300 text-sm">Vehicle model is required</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default VehicleTechnical
