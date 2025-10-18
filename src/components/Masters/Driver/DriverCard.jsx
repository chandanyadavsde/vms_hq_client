import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Mail, MapPin, Car, Calendar, Edit, Trash2, MoreVertical, CreditCard } from 'lucide-react'
import { getThemeColors } from '../../../utils/theme.js'
import { StatusBadge } from '../../common'

const DriverCard = ({
  driver,
  onEdit,
  onDelete,
  currentTheme = 'teal'
}) => {
  const themeColors = getThemeColors(currentTheme)
  const [showActions, setShowActions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/20'
      case 'inactive':
        return 'text-gray-400 bg-gray-500/20'
      case 'suspended':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-cyan-400 bg-cyan-500/20'
    }
  }

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 rounded-3xl p-6 cursor-pointer overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
      style={{ 
        background: 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)'
      }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        y: -5
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => setShowActions(!showActions)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
            {driver.photo ? (
              <img
                src={driver.photo}
                alt={driver.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${driver.photo ? 'hidden' : 'flex'}`}>
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{driver.name}</h3>
            <p className="text-sm text-white/70">Driver ID: {driver.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <StatusBadge
            status={driver.status.toLowerCase()}
            text={driver.status}
            size="sm"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 text-white/80">
          <Phone className="w-4 h-4 text-teal-400" />
          <span className="text-sm">{driver.contact.phone}</span>
        </div>
        
        <div className="flex items-center gap-3 text-white/80">
          <Mail className="w-4 h-4 text-teal-400" />
          <span className="text-sm truncate">{driver.contact.email}</span>
        </div>
        
        <div className="flex items-center gap-3 text-white/80">
          <MapPin className="w-4 h-4 text-teal-400" />
          <span className="text-sm">{driver.contact.address}</span>
        </div>
      </div>

      {/* License Information */}
      <div className="bg-white/5 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-white">License Info</span>
        </div>
        <div className="grid grid-cols-1 gap-1 text-xs text-white/70">
          <div>
            <span className="text-white/50">Number:</span> {driver.identification.licenseNumber}
          </div>
          <div>
            <span className="text-white/50">Type:</span> {driver.identification.licenseType}
          </div>
          <div>
            <span className="text-white/50">Expiry:</span> {formatDate(driver.identification.licenseExpiry)}
          </div>
        </div>
      </div>

      {/* Vehicle Assignments */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3 text-white/80">
          <Car className="w-4 h-4 text-teal-400" />
          <span className="text-sm">
            {driver.assignedVehicles.length} Vehicle{driver.assignedVehicles.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {driver.assignedVehicles.length > 0 && (
          <div className="ml-7 space-y-1">
            {driver.assignedVehicles.slice(0, 2).map((vehicle, index) => (
              <div key={index} className="text-xs text-white/60">
                • {vehicle.vehicleNumber} ({vehicle.type})
              </div>
            ))}
            {driver.assignedVehicles.length > 2 && (
              <div className="text-xs text-white/50">
                +{driver.assignedVehicles.length - 2} more...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-3 text-white/60 mb-4">
        <Calendar className="w-4 h-4" />
        <span className="text-xs">Updated: {formatDate(driver.updatedAt)}</span>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={onEdit}
                className="flex flex-col items-center gap-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-blue-300">Edit</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex flex-col items-center gap-2 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <span className="text-xs text-red-300">Delete</span>
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
              className="relative bg-slate-900/95 rounded-3xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Driver</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete <strong>{driver.name}</strong>? 
                  This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
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

export default DriverCard
