import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, MapPin, Trash2, X } from 'lucide-react'

const BulkActionsToolbar = ({ selectedCount, onBulkApprove, onBulkReject, onBulkAssignPlant, onBulkDelete, onClearSelection }) => {
  const [showPlantMenu, setShowPlantMenu] = useState(false)

  const plants = [
    { id: 'pune', name: 'Pune', color: '#3b82f6' },
    { id: 'daman', name: 'Daman', color: '#8b5cf6' },
    { id: 'solapur', name: 'Solapur', color: '#ec4899' },
    { id: 'surat', name: 'Surat', color: '#f59e0b' }
  ]

  if (selectedCount === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            {/* Selection Count */}
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-sm font-bold text-orange-700">
                {selectedCount} selected
              </span>
              <button
                onClick={onClearSelection}
                className="p-1 hover:bg-orange-100 rounded transition-colors"
                title="Clear Selection"
              >
                <X className="w-4 h-4 text-orange-600" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-slate-200" />

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Approve */}
              <motion.button
                onClick={onBulkApprove}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Approve Selected"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </motion.button>

              {/* Reject */}
              <motion.button
                onClick={onBulkReject}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reject Selected"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </motion.button>

              {/* Assign Plant */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowPlantMenu(!showPlantMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Assign to Plant"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Assign Plant</span>
                </motion.button>

                {/* Plant Menu */}
                <AnimatePresence>
                  {showPlantMenu && (
                    <>
                      <motion.div
                        className="fixed inset-0 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPlantMenu(false)}
                      />
                      <motion.div
                        className="absolute bottom-full mb-2 left-0 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-2 space-y-1">
                          {plants.map((plant) => (
                            <button
                              key={plant.id}
                              onClick={() => {
                                onBulkAssignPlant(plant.id)
                                setShowPlantMenu(false)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: plant.color }}
                              />
                              <span className="text-sm font-medium text-slate-700">
                                {plant.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Delete */}
              <motion.button
                onClick={onBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BulkActionsToolbar