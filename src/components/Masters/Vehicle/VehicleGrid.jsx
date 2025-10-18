import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, AlertCircle, Loader2 } from 'lucide-react'
import { getThemeColors } from '../../../utils/theme.js'
import VehicleCard from './VehicleCard.jsx'

const VehicleGrid = ({
  vehicles,
  onEditVehicle,
  onDeleteVehicle,
  onAssignDriver,
  currentTheme = 'teal'
}) => {
  const themeColors = getThemeColors(currentTheme)

  if (vehicles.length === 0) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Car className="w-12 h-12 text-white/60" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">No Vehicles Found</h3>
        <p className={`text-lg mb-8 ${themeColors.accentText}`}>
          No vehicles match your current search criteria
        </p>
        <div className="text-white/60">
          <p>Try adjusting your search or filters</p>
          <p>Or add a new vehicle to get started</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <AnimatePresence>
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            layout
          >
            <VehicleCard
              vehicle={vehicle}
              onEdit={() => onEditVehicle(vehicle)}
              onDelete={() => onDeleteVehicle(vehicle.id)}
              onAssignDriver={() => onAssignDriver(vehicle)}
              currentTheme={currentTheme}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default VehicleGrid
