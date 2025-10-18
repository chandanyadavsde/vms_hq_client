import React from 'react'
import { motion } from 'framer-motion'
import { Car, Users, Link } from 'lucide-react'
import { getThemeColors } from '../../utils/theme.js'

const MastersTabs = ({
  activeTab,
  onTabChange,
  vehicleCount = 0,
  driverCount = 0,
  currentTheme = 'teal'
}) => {
  const themeColors = getThemeColors(currentTheme)

  const tabs = [
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: Car,
      count: vehicleCount,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'drivers',
      label: 'Drivers',
      icon: Users,
      count: driverCount,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: Link,
      count: 0,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="flex justify-center mb-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-orange-200/50 shadow-md">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MastersTabs
