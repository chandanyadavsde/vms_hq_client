import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, MapPin, Users, Wrench, Calendar, Eye, Edit, UserPlus, Trash2, MoreVertical } from 'lucide-react'
import { getThemeColors } from '../../../utils/theme.js'
import { StatusBadge } from '../../common'

const VehicleCard = ({
  vehicle,
  onEdit,
  onDelete,
  onAssignDriver,
  currentTheme = 'teal'
}) => {
  const themeColors = getThemeColors(currentTheme)
  const [showActions, setShowActions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/20'
      case 'maintenance':
        return 'text-amber-400 bg-amber-500/20'
      case 'inactive':
        return 'text-gray-400 bg-gray-500/20'
      case 'retired':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-cyan-400 bg-cyan-500/20'
    }
  }

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  return (
    <motion.div
      className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 cursor-pointer overflow-hidden border border-orange-200/30 shadow-lg hover:shadow-xl transition-all duration-300"
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
        y: -5
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => setShowActions(!showActions)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{vehicle.vehicleNumber}</h3>
            <p className="text-sm text-gray-600">{vehicle.type}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <StatusBadge
            status={vehicle.status.toLowerCase()}
            text={vehicle.status}
            size="sm"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="text-sm">{vehicle.plant}</span>
        </div>
        
        <div className="flex items-center gap-3 text-gray-600">
          <Users className="w-4 h-4 text-orange-500" />
          <span className="text-sm">
            {vehicle.drivers?.length || 0} Driver{(vehicle.drivers?.length || 0) !== 1 ? 's' : ''}
            {vehicle.drivers && vehicle.drivers.length > 0 && (
              <span className="text-gray-500 ml-1">
                ({vehicle.drivers.map(d => d.driverName || d.name).join(', ')})
              </span>
            )}
            {vehicle.driverName && vehicle.driverName !== 'No Driver Assigned' && (
              <span className="text-gray-500 ml-1">
                ({vehicle.driverName})
              </span>
            )}
          </span>
        </div>
        
        {vehicle.otherPersonnel && vehicle.otherPersonnel.length > 0 && (
          <div className="flex items-center gap-3 text-gray-600">
            <Wrench className="w-4 h-4 text-orange-500" />
            <span className="text-sm">
              {vehicle.otherPersonnel.length} Other
              {vehicle.otherPersonnel.length > 0 && (
                <span className="text-gray-500 ml-1">
                  ({vehicle.otherPersonnel.map(p => p.personName).join(', ')})
                </span>
              )}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-3 text-gray-600">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="text-sm">Updated: {vehicle.updatedAt}</span>
        </div>
      </div>

      {/* Specifications Preview */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="text-gray-500">Make:</span> {vehicle.specifications.make}
          </div>
          <div>
            <span className="text-gray-500">Model:</span> {vehicle.specifications.model}
          </div>
          <div>
            <span className="text-gray-500">Year:</span> {vehicle.specifications.year}
          </div>
          <div>
            <span className="text-gray-500">Color:</span> {vehicle.specifications.color}
          </div>
        </div>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-orange-200/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={onEdit}
                className="flex flex-col items-center gap-2 p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-700">Edit</span>
              </motion.button>
              
              <motion.button
                onClick={onAssignDriver}
                className="flex flex-col items-center gap-2 p-3 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span className="text-xs text-emerald-700">Assign</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex flex-col items-center gap-2 p-3 bg-red-100 hover:bg-red-200 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-5 h-5 text-red-600" />
                <span className="text-xs text-red-700">Delete</span>
              </motion.button>
              
              <motion.button
                className="flex flex-col items-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-700">View</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 max-w-md w-full border border-red-200/50 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Vehicle</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{vehicle.vehicleNumber}</strong>? 
                  This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default VehicleCard
