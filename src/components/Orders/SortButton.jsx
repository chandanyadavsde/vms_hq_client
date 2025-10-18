import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, X } from 'lucide-react'

const SortButton = ({ sortConfig, onSort, options }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSortClick = (key) => {
    onSort(key)
    setIsOpen(false)
  }

  const activeSortLabel = options.find(opt => opt.key === sortConfig.key)?.label || 'Sort by...'

  return (
    <div className="relative">
      {/* Sort Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          sortConfig.key
            ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
            : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
        }`}
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>{sortConfig.key ? activeSortLabel : 'Sort'}</span>
        {sortConfig.key && (
          <span className="flex items-center">
            {sortConfig.direction === 'asc' ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Sort Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800">Sort Options</h3>
                </div>
                {sortConfig.key && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSort(null)
                      setIsOpen(false)
                    }}
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                    title="Clear sorting"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>

              {/* Sort Options */}
              <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                {options.map((option) => {
                  const isActive = sortConfig.key === option.key
                  const isAsc = isActive && sortConfig.direction === 'asc'
                  const isDesc = isActive && sortConfig.direction === 'desc'

                  return (
                    <div key={option.key} className="space-y-0.5">
                      {/* Ascending */}
                      <button
                        onClick={() => handleSortClick(option.key)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isAsc
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ArrowUp className={`w-3.5 h-3.5 ${isAsc ? 'text-blue-600' : 'text-slate-400'}`} />
                          {option.label} (A-Z)
                        </span>
                        {isAsc && (
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        )}
                      </button>

                      {/* Descending */}
                      <button
                        onClick={() => {
                          // If already ascending, toggle to descending
                          if (isAsc) {
                            onSort(option.key) // This will toggle direction
                          } else {
                            // First set ascending, then descending
                            onSort(option.key)
                            setTimeout(() => onSort(option.key), 0)
                          }
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isDesc
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ArrowDown className={`w-3.5 h-3.5 ${isDesc ? 'text-blue-600' : 'text-slate-400'}`} />
                          {option.label} (Z-A)
                        </span>
                        {isDesc && (
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              {sortConfig.key && (
                <div className="p-2 border-t border-slate-200 bg-slate-50">
                  <button
                    onClick={() => {
                      onSort(null)
                      setIsOpen(false)
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
                  >
                    Clear Sort
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SortButton
