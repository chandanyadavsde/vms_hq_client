/**
 * Vehicle Flow Selection Modal
 * Shows two options: Add Vehicle Only or Add Vehicle + Driver
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Car, 
  Link, 
  Clock,
  CheckCircle
} from 'lucide-react'

const VehicleFlowModal = ({ isOpen, onClose, onFlowSelect, currentTheme = 'teal' }) => {
  const [showComingSoon, setShowComingSoon] = useState(false)

  const flows = [
    {
      id: 'vehicle',
      title: 'Add Vehicle Only',
      description: 'Add a new vehicle with optional driver assignment',
      icon: <Car className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Vehicle details', 'Document upload', 'Optional assignment'],
      available: true
    },
    {
      id: 'vehicle-driver',
      title: 'Add Vehicle + Driver',
      description: 'Create both vehicle and driver in one flow',
      icon: <Link className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: ['Complete workflow', 'Automatic assignment', 'One-click creation'],
      available: false,
      comingSoon: true
    }
  ]

  const handleFlowClick = (flow) => {
    if (flow.available) {
      onFlowSelect(flow.id)
    } else {
      setShowComingSoon(true)
    }
  }

  const handleClose = () => {
    setShowComingSoon(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-200">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Choose Vehicle Creation Method
                  </h2>
                  <p className="text-gray-600">
                    Select how you want to add your vehicle
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Flow Cards */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {flows.map((flow) => (
                    <motion.div
                      key={flow.id}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                        flow.available 
                          ? 'hover:shadow-lg hover:scale-105' 
                          : 'opacity-75 cursor-not-allowed'
                      } ${flow.bgColor} ${flow.borderColor}`}
                      onClick={() => handleFlowClick(flow)}
                      whileHover={flow.available ? { scale: 1.02 } : {}}
                      whileTap={flow.available ? { scale: 0.98 } : {}}
                    >
                      {/* Coming Soon Badge */}
                      {flow.comingSoon && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Coming Soon
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${flow.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                        {flow.icon}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {flow.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {flow.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {flow.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <motion.button
                          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            flow.available
                              ? `bg-gradient-to-r ${flow.color} text-white hover:shadow-lg`
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!flow.available}
                        >
                          {flow.available ? 'Start Now' : 'Coming Soon'}
                        </motion.button>

                        {flow.comingSoon && (
                          <div className="flex items-center gap-1 text-orange-600 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>In Development</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coming Soon Modal */}
          <ComingSoonModal 
            isOpen={showComingSoon} 
            onClose={() => setShowComingSoon(false)} 
          />
        </>
      )}
    </AnimatePresence>
  )
}

// Coming Soon Modal Component
const ComingSoonModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Coming Soon!
              </h3>
              
              <p className="text-gray-600 mb-6">
                The "Add Vehicle + Driver" feature is currently in development. 
                You can use "Add Vehicle Only" for now and assign drivers later.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Got it
                </button>
                <button
                  onClick={() => {
                    onClose()
                    // This would trigger the vehicle-only flow
                    // We'll handle this in the parent component
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Add Vehicle Only
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default VehicleFlowModal
