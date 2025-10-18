import React from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Wrench, Building2 } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const VehicleAssignment = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)

  const handleDriverAdd = () => {
    const newDriver = {
      id: `temp_${Date.now()}`,
      driverId: '',
      driverName: '',
      type: 'Primary',
      status: 'Active',
      assignedDate: new Date().toISOString().split('T')[0]
    }

    setFormData(prev => ({
      ...prev,
      drivers: [...prev.drivers, newDriver]
    }))
  }

  const handleDriverRemove = (driverId) => {
    setFormData(prev => ({
      ...prev,
      drivers: prev.drivers.filter(driver => driver.id !== driverId)
    }))
  }

  const handleDriverChange = (driverId, field, value) => {
    setFormData(prev => ({
      ...prev,
      drivers: prev.drivers.map(driver =>
        driver.id === driverId ? { ...driver, [field]: value } : driver
      )
    }))
  }

  const handlePersonnelAdd = () => {
    const newPersonnel = {
      id: `temp_${Date.now()}`,
      personId: '',
      personName: '',
      role: 'Mechanic',
      status: 'Active',
      assignedDate: new Date().toISOString().split('T')[0]
    }

    setFormData(prev => ({
      ...prev,
      otherPersonnel: [...prev.otherPersonnel, newPersonnel]
    }))
  }

  const handlePersonnelRemove = (personId) => {
    setFormData(prev => ({
      ...prev,
      otherPersonnel: prev.otherPersonnel.filter(person => person.id !== personId)
    }))
  }

  const handlePersonnelChange = (personId, field, value) => {
    setFormData(prev => ({
      ...prev,
      otherPersonnel: prev.otherPersonnel.map(person =>
        person.id === personId ? { ...person, [field]: value } : person
      )
    }))
  }

  const driverTypes = ['Primary', 'Secondary', 'Backup', 'Temporary']
  const personnelRoles = ['Mechanic', 'Supervisor', 'Inspector', 'Other']
  const statuses = ['Active', 'Inactive', 'Suspended']

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
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Assignments</h3>
        <p className="text-gray-600">Assign drivers and other personnel to this vehicle</p>
      </div>

      {/* Driver Assignments */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-500" />
            Driver Assignments
          </h4>
          <motion.button
            onClick={handleDriverAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus className="w-4 h-4" />
            Add Driver
          </motion.button>
        </div>

        {formData.drivers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No drivers assigned yet</p>
            <p className="text-gray-500 text-sm">Click "Add Driver" to assign drivers to this vehicle</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.drivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-600 text-sm">Driver Name</label>
                    <input
                      type="text"
                      value={driver.driverName}
                      onChange={(e) => handleDriverChange(driver.id, 'driverName', e.target.value)}
                      placeholder="Enter driver name"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-gray-600 text-sm">Type</label>
                    <select
                      value={driver.type}
                      onChange={(e) => handleDriverChange(driver.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {driverTypes.map(type => (
                        <option key={type} value={type} className="bg-white text-gray-900">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-gray-600 text-sm">Status</label>
                    <select
                      value={driver.status}
                      onChange={(e) => handleDriverChange(driver.id, 'status', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status} className="bg-white text-gray-900">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => handleDriverRemove(driver.id)}
                      className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Other Personnel */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            Other Personnel
          </h4>
          <motion.button
            onClick={handlePersonnelAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Wrench className="w-4 h-4" />
            Add Personnel
          </motion.button>
        </div>

        {formData.otherPersonnel.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No other personnel assigned yet</p>
            <p className="text-gray-500 text-sm">Click "Add Personnel" to assign mechanics, supervisors, etc.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.otherPersonnel.map((person, index) => (
              <motion.div
                key={person.id}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-600 text-sm">Person Name</label>
                    <input
                      type="text"
                      value={person.personName}
                      onChange={(e) => handlePersonnelChange(person.id, 'personName', e.target.value)}
                      placeholder="Enter person name"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-gray-600 text-sm">Role</label>
                    <select
                      value={person.role}
                      onChange={(e) => handlePersonnelChange(person.id, 'role', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {personnelRoles.map(role => (
                        <option key={role} value={role} className="bg-white text-gray-900">
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-gray-600 text-sm">Status</label>
                    <select
                      value={person.status}
                      onChange={(e) => handlePersonnelChange(person.id, 'status', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status} className="bg-white text-gray-900">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => handlePersonnelRemove(person.id)}
                      className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Assignment Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-white/80">
            <Users className="w-5 h-5 text-green-400" />
            <span>{formData.drivers.length} Driver{formData.drivers.length !== 1 ? 's' : ''} assigned</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <Wrench className="w-5 h-5 text-blue-400" />
            <span>{formData.otherPersonnel.length} Other personnel assigned</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VehicleAssignment
