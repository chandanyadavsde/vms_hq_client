import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Eye, EyeOff, X } from 'lucide-react'

const ColumnManager = ({ columns, visibleColumns, onColumnToggle, onReset }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Column Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50 transition-all"
        title="Manage Columns"
      >
        <Settings className="w-4 h-4" />
        <span>Columns</span>
      </button>

      {/* Column Manager Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed top-1/2 left-1/2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[85vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-slate-800">Manage Columns</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Column List */}
              <div className="p-4 space-y-2 overflow-y-auto flex-1">
                {columns.map((column) => {
                  const isVisible = visibleColumns.includes(column.id)
                  return (
                    <motion.button
                      key={column.id}
                      onClick={() => onColumnToggle(column.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        isVisible
                          ? 'bg-orange-50 border border-orange-200 hover:bg-orange-100'
                          : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={column.required}
                    >
                      <div className="flex items-center gap-3">
                        {isVisible ? (
                          <Eye className="w-4 h-4 text-orange-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          isVisible ? 'text-slate-800' : 'text-slate-500'
                        }`}>
                          {column.label}
                        </span>
                      </div>
                      {column.required && (
                        <span className="text-xs text-slate-400 italic">Required</span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex-shrink-0">
                <button
                  onClick={() => {
                    onReset()
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ColumnManager