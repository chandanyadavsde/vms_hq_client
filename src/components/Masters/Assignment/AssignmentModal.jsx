import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Car, Users, Save } from 'lucide-react'
import { BaseModal } from '../../common'

const AssignmentModal = ({
  isOpen,
  onClose,
  vehicle,
  drivers,
  onAssignDriver,
  currentTheme = 'teal'
}) => {
  const [selectedDriver, setSelectedDriver] = useState('')
  const [driverType, setDriverType] = useState('Primary')
  const [assignmentStatus, setAssignmentStatus] = useState('Active')
  const [notes, setNotes] = useState('')

  const driverTypes = ['Primary', 'Secondary', 'Backup', 'Temporary']
  const assignmentStatuses = ['Active', 'Inactive', 'Pending', 'Suspended']

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedDriver('')
      setDriverType('Primary')
      setAssignmentStatus('Active')
      setNotes('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!selectedDriver || !vehicle) return

    try {
      console.log('🚀 Submitting driver assignment:', { vehicle, selectedDriver })
      
      await onAssignDriver(vehicle.id, selectedDriver, {
        type: driverType,
        status: assignmentStatus,
        notes,
        assignedDate: new Date().toISOString().split('T')[0]
      })
      
      console.log('✅ Driver assignment completed successfully')
      onClose()
    } catch (error) {
      console.error('❌ Error assigning driver:', error)
      // The error will be handled by the parent component
    }
  }

  // Filter out drivers already assigned to this vehicle
  const availableDrivers = (drivers || []).filter(driver => 
    !vehicle?.drivers?.some(assignedDriver => assignedDriver.driverId === driver.id)
  )

  if (!isOpen || !vehicle) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Driver to ${vehicle?.vehicleNumber}`}
      maxWidth="max-w-2xl"
      height="h-auto"
    >
      <div className="space-y-6">
        {/* Vehicle Information */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Car className="w-5 h-5 text-teal-400" />
            Vehicle Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-white/70 text-sm">Vehicle Number:</span>
              <p className="text-white font-medium">{vehicle?.vehicleNumber}</p>
            </div>
            <div>
              <span className="text-white/70 text-sm">Plant:</span>
              <p className="text-white font-medium">{vehicle?.plant}</p>
            </div>
            <div>
              <span className="text-white/70 text-sm">Type:</span>
              <p className="text-white font-medium">{vehicle?.type}</p>
            </div>
            <div>
              <span className="text-white/70 text-sm">Current Drivers:</span>
              <p className="text-white font-medium">{vehicle?.drivers.length}</p>
            </div>
          </div>
        </div>

        {/* Current Drivers */}
        {vehicle?.drivers.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Current Drivers
            </h4>
            <div className="space-y-2">
              {vehicle.drivers.map((driver, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{driver.driverName}</p>
                    <p className="text-white/60 text-sm">{driver.type} • {driver.status}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    driver.status === 'Active' 
                      ? 'text-emerald-400 bg-emerald-500/20'
                      : 'text-gray-400 bg-gray-500/20'
                  }`}>
                    {driver.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignment Form */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-400" />
            Assign New Driver
          </h4>

          {/* Driver Selection */}
          <div className="space-y-2">
            <label className="text-white font-medium">Select Driver *</label>
            {availableDrivers.length === 0 ? (
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-300 text-sm">
                  All available drivers are already assigned to this vehicle.
                </p>
              </div>
            ) : (
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                required
              >
                <option value="" className="bg-gray-800 text-white">Choose a driver</option>
                {availableDrivers.map(driver => (
                  <option key={driver.id} value={driver.id} className="bg-gray-800 text-white">
                    {driver.name} - {driver.identification?.licenseNumber || 'No License'} - {driver.contact?.phone || 'No Phone'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Driver Type */}
          <div className="space-y-2">
            <label className="text-white font-medium">Driver Type</label>
            <select
              value={driverType}
              onChange={(e) => setDriverType(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              {driverTypes.map(type => (
                <option key={type} value={type} className="bg-gray-800 text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Status */}
          <div className="space-y-2">
            <label className="text-white font-medium">Assignment Status</label>
            <select
              value={assignmentStatus}
              onChange={(e) => setAssignmentStatus(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              {assignmentStatuses.map(status => (
                <option key={status} value={status} className="bg-gray-800 text-white">
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-white font-medium">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this assignment..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
          <motion.button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          
          <motion.button
            onClick={handleSubmit}
            disabled={!selectedDriver || availableDrivers.length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${
              selectedDriver && availableDrivers.length > 0
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            whileHover={selectedDriver && availableDrivers.length > 0 ? { scale: 1.02 } : {}}
            whileTap={selectedDriver && availableDrivers.length > 0 ? { scale: 0.98 } : {}}
          >
            <Save className="w-4 h-4" />
            Assign Driver
          </motion.button>
        </div>
      </div>
    </BaseModal>
  )
}

export default AssignmentModal
