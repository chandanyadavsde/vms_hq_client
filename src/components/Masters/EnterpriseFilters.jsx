import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, Calendar as CalendarIcon } from 'lucide-react'
import Select from 'react-select'
import { format } from 'date-fns'

const EnterpriseFilters = ({ onFilterChange, onClearFilters, activeFilters }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: [],
    plant: [],
    operationalStatus: [],
    approvalStatus: [],
    hasDriver: 'all',
    dateRange: { from: '', to: '' }
  })

  // Filter options
  const statusOptions = [
    { value: 'assigned', label: 'Assigned', color: '#10b981' },
    { value: 'unassigned', label: 'Unassigned', color: '#6b7280' }
  ]

  const plantOptions = [
    { value: 'pune', label: 'Pune', color: '#3b82f6' },
    { value: 'daman', label: 'Daman', color: '#8b5cf6' },
    { value: 'solapur', label: 'Solapur', color: '#ec4899' },
    { value: 'surat', label: 'Surat', color: '#f59e0b' },
    { value: 'free', label: 'Free', color: '#6b7280' }
  ]

  const operationalStatusOptions = [
    { value: 'inbound', label: 'Inbound', color: '#3b82f6' },
    { value: 'at gate', label: 'At Gate', color: '#eab308' },
    { value: 'inspection', label: 'Inspection', color: '#a855f7' },
    { value: 'available', label: 'Available', color: '#10b981' },
    { value: 'loaded', label: 'Loaded', color: '#6366f1' }
  ]

  const approvalStatusOptions = [
    { value: 'approved', label: 'Approved', color: '#10b981' },
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'rejected', label: 'Rejected', color: '#ef4444' }
  ]

  const driverOptions = [
    { value: 'all', label: 'All' },
    { value: 'assigned', label: 'Has Driver' },
    { value: 'unassigned', label: 'No Driver' }
  ]

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#f97316' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 1px #f97316' : 'none',
      '&:hover': {
        borderColor: '#f97316'
      },
      minHeight: '38px',
      fontSize: '0.875rem'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#fed7aa',
      borderRadius: '6px'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#ea580c',
      fontWeight: '500'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#ea580c',
      '&:hover': {
        backgroundColor: '#fdba74',
        color: '#c2410c'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#fed7aa' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      '&:hover': {
        backgroundColor: state.isSelected ? '#f97316' : '#fed7aa'
      }
    })
  }

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    onFilterChange(filters)
    setIsOpen(false)
  }

  const clearAllFilters = () => {
    const emptyFilters = {
      status: [],
      plant: [],
      operationalStatus: [],
      approvalStatus: [],
      hasDriver: 'all',
      dateRange: { from: '', to: '' }
    }
    setFilters(emptyFilters)
    onClearFilters()
    setIsOpen(false)
  }

  const activeFilterCount = [
    filters.status.length,
    filters.plant.length,
    filters.operationalStatus.length,
    filters.approvalStatus.length,
    filters.hasDriver !== 'all' ? 1 : 0,
    (filters.dateRange.from || filters.dateRange.to) ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          activeFilterCount > 0
            ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
            : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-white text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
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

            {/* Filter Panel */}
            <motion.div
              className="fixed top-1/2 left-1/2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[85vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-slate-800">Advanced Filters</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Plant Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Plant Status
                  </label>
                  <Select
                    isMulti
                    options={statusOptions}
                    value={filters.status}
                    onChange={(value) => handleFilterChange('status', value || [])}
                    styles={customSelectStyles}
                    placeholder="Select status..."
                    className="text-sm"
                  />
                </div>

                {/* Plant Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Plant Location
                  </label>
                  <Select
                    isMulti
                    options={plantOptions}
                    value={filters.plant}
                    onChange={(value) => handleFilterChange('plant', value || [])}
                    styles={customSelectStyles}
                    placeholder="Select plants..."
                    className="text-sm"
                  />
                </div>

                {/* Operational Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Operational Status
                  </label>
                  <Select
                    isMulti
                    options={operationalStatusOptions}
                    value={filters.operationalStatus}
                    onChange={(value) => handleFilterChange('operationalStatus', value || [])}
                    styles={customSelectStyles}
                    placeholder="Select operational status..."
                    className="text-sm"
                  />
                </div>

                {/* Approval Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Approval Status
                  </label>
                  <Select
                    isMulti
                    options={approvalStatusOptions}
                    value={filters.approvalStatus}
                    onChange={(value) => handleFilterChange('approvalStatus', value || [])}
                    styles={customSelectStyles}
                    placeholder="Select approval status..."
                    className="text-sm"
                  />
                </div>

                {/* Driver Assignment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Driver Assignment
                  </label>
                  <div className="flex gap-2">
                    {driverOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange('hasDriver', option.value)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          filters.hasDriver === option.value
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Last Updated
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="date"
                        value={filters.dateRange.from}
                        onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="From"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={filters.dateRange.to}
                        onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="To"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex-shrink-0">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnterpriseFilters