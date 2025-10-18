import React from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Car, Building2, Activity, X, Link, User } from 'lucide-react'
import { getThemeColors } from '../../utils/theme.js'

const MastersHeader = ({
  searchQuery,
  onSearchChange,
  selectedPlant,
  onPlantChange,
  selectedStatus,
  onStatusChange,
  availablePlants,
  availableStatuses,
  onAddNew,
  onAddVehicleDriver,
  activeTab = 'vehicles',
  currentTheme = 'teal'
}) => {
  const themeColors = getThemeColors(currentTheme)

  const handleClearSearch = () => {
    onSearchChange('')
  }

  const handleClearFilters = () => {
    onPlantChange('all')
    onStatusChange('all')
  }

  const hasActiveFilters = selectedPlant !== 'all' || selectedStatus !== 'all'

  return (
    <div className="flex justify-center mb-4">
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 border border-orange-200/50 shadow-md max-w-6xl w-full">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Master Management</h1>
            <p className="text-gray-600 text-sm">
              Manage vehicles, drivers, and their relationships
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onAddNew}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all hover:scale-105 hover:shadow-md flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Car className="w-4 h-4" />
              {activeTab === 'drivers' ? 'Create Driver' : '+ Vehicle'}
            </motion.button>
            
            {activeTab === 'vehicles' && (
              <motion.button
                onClick={onAddVehicleDriver}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all hover:scale-105 hover:shadow-md flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link className="w-4 h-4" />
                + Vehicle + Driver
              </motion.button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-2 mb-3">
          {/* Search Icon */}
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
            <Search className="w-4 h-4 text-white" />
          </div>
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search vehicles, drivers, or plants..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Actions */}
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md hover:scale-105 transform">
              Search
            </button>
          </div>
        </div>

        {/* Plant Filter and Stats Row */}
        <div className="pt-2 border-t border-orange-200/30">
          <div className="flex items-center justify-between">
            {/* Plant Filter - Left Side */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-700">Plant:</span>
              <div className="flex items-center space-x-1">
                {availablePlants.map((plant) => (
                  <button
                    key={plant}
                    onClick={() => onPlantChange(plant)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
                      selectedPlant === plant
                        ? 'text-orange-600 bg-orange-50 border border-orange-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {plant === 'all' ? 'All Plants' : plant}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter - Right Side */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-700">Status:</span>
              <div className="flex items-center space-x-1">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
                      selectedStatus === status
                        ? 'text-orange-600 bg-orange-50 border border-orange-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {status === 'all' ? 'All Status' : status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <motion.div
            className="mt-3 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Filter className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">Active Filters:</span>
            {selectedPlant !== 'all' && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200">
                Plant: {selectedPlant}
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200">
                Status: {selectedStatus}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="ml-2 text-xs text-gray-500 hover:text-orange-600 transition-colors underline"
            >
              Clear All
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MastersHeader
