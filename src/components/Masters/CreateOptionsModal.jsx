import React from 'react'
import { motion } from 'framer-motion'
import { X, Car, User, Plus } from 'lucide-react'

const CreateOptionsModal = ({ onClose, onOptionSelect }) => {
  const handleOptionClick = (option) => {
    console.log(`Selected option: ${option}`)
    if (onOptionSelect) {
      onOptionSelect(option)
    }
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        className="relative bg-white rounded-lg p-8 max-w-2xl w-full border border-slate-200 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Create New</h2>
            <p className="text-slate-600">Choose what you want to create</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicle Only */}
          <motion.button
            onClick={() => handleOptionClick('vehicle')}
            className="group bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-lg p-6 transition-all duration-300 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                <Car className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Vehicle Only</h3>
              <p className="text-slate-600 text-sm">Create a new vehicle without driver assignment</p>
            </div>
          </motion.button>

          {/* Driver Only */}
          <motion.button
            onClick={() => handleOptionClick('driver')}
            className="group bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-lg p-6 transition-all duration-300 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                <User className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Driver Only</h3>
              <p className="text-slate-600 text-sm">Create a new driver without vehicle assignment</p>
            </div>
          </motion.button>

          {/* Vehicle + Driver */}
          <motion.button
            onClick={() => handleOptionClick('both')}
            className="group bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-lg p-6 transition-all duration-300 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                <Plus className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Vehicle + Driver</h3>
              <p className="text-slate-600 text-sm">Create both vehicle and driver with assignment</p>
            </div>
          </motion.button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Plus className="w-3 h-3 text-orange-600" />
            </div>
            <div>
              <h4 className="text-slate-800 font-medium mb-1">Quick Start</h4>
              <p className="text-slate-600 text-sm">
                Choose the option that best fits your needs. You can always assign drivers to vehicles later or create additional records as needed.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CreateOptionsModal
