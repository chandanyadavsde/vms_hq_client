import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown } from 'lucide-react'
import Select from 'react-select'

const EnterpriseFilters = ({ onFilterChange, onClearFilters, activeFilters, preLrData }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    preLrStatus: [],
    site: [],
    district: [],
    state: [],
    consignor: [],
    consignee: [],
    lrStatus: [],
    vehicleAssigned: 'all',
    driverAssigned: 'all',
    punchlistStatus: [],
    lineStatus: [],
    wtgNumber: [],
    dateRange: { from: '', to: '' },
    remainingQty: { min: '', max: '' }
  })

  // Extract unique values from preLrData for dynamic filter options
  const getUniqueOptions = (field, nestedPath = null) => {
    if (!preLrData || preLrData.length === 0) return []

    const uniqueValues = new Set()
    preLrData.forEach(preLr => {
      let value
      if (nestedPath) {
        value = nestedPath.split('.').reduce((obj, key) => obj?.[key], preLr)
      } else {
        value = preLr[field]
      }

      if (value && value !== 'N/A') {
        uniqueValues.add(value)
      }
    })

    return Array.from(uniqueValues).sort().map(val => ({
      value: val,
      label: val
    }))
  }

  // Dynamic filter options based on actual data
  const siteOptions = getUniqueOptions('site')
  const districtOptions = getUniqueOptions('district')
  const stateOptions = getUniqueOptions('state')
  const consignorOptions = getUniqueOptions('consignor')
  const consigneeOptions = getUniqueOptions('consignee')

  // Extract WTG numbers from preLrData
  const wtgNumberOptions = getUniqueOptions('wtgNumber')

  // Static filter options
  const preLrStatusOptions = [
    { value: 'active', label: 'Active (Open)', color: '#10b981' },
    { value: 'completed', label: 'Completed (Close)', color: '#3b82f6' },
    { value: 'processing', label: 'Processing', color: '#eab308' },
    { value: 'pending', label: 'Pending', color: '#6b7280' }
  ]

  const lrStatusOptions = [
    { value: 'completed', label: 'Delivered', color: '#10b981' },
    { value: 'processing', label: 'In Transit', color: '#3b82f6' },
    { value: 'pending', label: 'Pending', color: '#eab308' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
  ]

  const punchlistStatusOptions = [
    { value: 'pending', label: 'Pending', color: '#6b7280' },
    { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
    { value: 'completed', label: 'Completed', color: '#10b981' },
    { value: 'approved', label: 'Approved', color: '#059669' }
  ]

  const lineStatusOptions = [
    { value: 'pending', label: 'Pending', color: '#6b7280' },
    { value: 'partial_lr', label: 'Partial LR', color: '#eab308' },
    { value: 'full_lr', label: 'Full LR', color: '#3b82f6' },
    { value: 'completed', label: 'Completed', color: '#10b981' }
  ]

  const assignmentOptions = [
    { value: 'all', label: 'All' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'unassigned', label: 'Unassigned' }
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
      fontSize: '0.875rem',
      '&:hover': {
        backgroundColor: state.isSelected ? '#f97316' : '#fed7aa'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999
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
      preLrStatus: [],
      site: [],
      district: [],
      state: [],
      consignor: [],
      consignee: [],
      lrStatus: [],
      vehicleAssigned: 'all',
      driverAssigned: 'all',
      punchlistStatus: [],
      lineStatus: [],
      wtgNumber: [],
      dateRange: { from: '', to: '' },
      remainingQty: { min: '', max: '' }
    }
    setFilters(emptyFilters)
    onClearFilters()
    setIsOpen(false)
  }

  // Calculate active filter count
  const activeFilterCount = [
    filters.preLrStatus.length,
    filters.site.length,
    filters.district.length,
    filters.state.length,
    filters.consignor.length,
    filters.consignee.length,
    filters.lrStatus.length,
    filters.vehicleAssigned !== 'all' ? 1 : 0,
    filters.driverAssigned !== 'all' ? 1 : 0,
    filters.punchlistStatus.length,
    filters.lineStatus.length,
    filters.wtgNumber.length,
    (filters.dateRange.from || filters.dateRange.to) ? 1 : 0,
    (filters.remainingQty.min || filters.remainingQty.max) ? 1 : 0
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

            {/* Filter Panel - Scrollable with max height */}
            <motion.div
              className="fixed top-1/2 left-1/2 w-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-slate-800">Advanced Filters</h3>
                  {activeFilterCount > 0 && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Filter Content - Scrollable */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* PRE-LR Filters Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide border-b border-orange-200 pb-1">
                    PRE-LR Filters
                  </h4>

                  {/* PRE-LR Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      PRE-LR Status
                    </label>
                    <Select
                      isMulti
                      options={preLrStatusOptions}
                      value={filters.preLrStatus}
                      onChange={(value) => handleFilterChange('preLrStatus', value || [])}
                      styles={customSelectStyles}
                      placeholder="Select PRE-LR status..."
                      className="text-sm"
                    />
                  </div>

                  {/* Two-column layout for location filters */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Site */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Site
                      </label>
                      <Select
                        isMulti
                        options={siteOptions}
                        value={filters.site}
                        onChange={(value) => handleFilterChange('site', value || [])}
                        styles={customSelectStyles}
                        placeholder="Select sites..."
                        className="text-sm"
                      />
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        District
                      </label>
                      <Select
                        isMulti
                        options={districtOptions}
                        value={filters.district}
                        onChange={(value) => handleFilterChange('district', value || [])}
                        styles={customSelectStyles}
                        placeholder="Select districts..."
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      State
                    </label>
                    <Select
                      isMulti
                      options={stateOptions}
                      value={filters.state}
                      onChange={(value) => handleFilterChange('state', value || [])}
                      styles={customSelectStyles}
                      placeholder="Select states..."
                      className="text-sm"
                    />
                  </div>

                  {/* Two-column layout for consignor/consignee */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Consignor */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Consignor
                      </label>
                      <Select
                        isMulti
                        options={consignorOptions}
                        value={filters.consignor}
                        onChange={(value) => handleFilterChange('consignor', value || [])}
                        styles={customSelectStyles}
                        placeholder="Select consignor..."
                        className="text-sm"
                      />
                    </div>

                    {/* Consignee */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Consignee
                      </label>
                      <Select
                        isMulti
                        options={consigneeOptions}
                        value={filters.consignee}
                        onChange={(value) => handleFilterChange('consignee', value || [])}
                        styles={customSelectStyles}
                        placeholder="Select consignee..."
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* WTG Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      WTG Number
                    </label>
                    <Select
                      isMulti
                      options={wtgNumberOptions}
                      value={filters.wtgNumber}
                      onChange={(value) => handleFilterChange('wtgNumber', value || [])}
                      styles={customSelectStyles}
                      placeholder="Select WTG numbers..."
                      className="text-sm"
                    />
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Created Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={filters.dateRange.from}
                        onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="From"
                      />
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

                {/* LR Filters Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide border-b border-blue-200 pb-1">
                    LR Filters
                  </h4>

                  {/* LR Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      LR Status
                    </label>
                    <Select
                      isMulti
                      options={lrStatusOptions}
                      value={filters.lrStatus}
                      onChange={(value) => handleFilterChange('lrStatus', value || [])}
                      styles={customSelectStyles}
                      placeholder="Select LR status..."
                      className="text-sm"
                    />
                  </div>

                  {/* Assignment Filters - Two columns */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Vehicle Assignment */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Vehicle Assignment
                      </label>
                      <div className="flex gap-1">
                        {assignmentOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleFilterChange('vehicleAssigned', option.value)}
                            className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              filters.vehicleAssigned === option.value
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Driver Assignment */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Driver Assignment
                      </label>
                      <div className="flex gap-1">
                        {assignmentOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleFilterChange('driverAssigned', option.value)}
                            className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              filters.driverAssigned === option.value
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Punchlist Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Punchlist Status
                    </label>
                    <Select
                      isMulti
                      options={punchlistStatusOptions}
                      value={filters.punchlistStatus}
                      onChange={(value) => handleFilterChange('punchlistStatus', value || [])}
                      styles={customSelectStyles}
                      placeholder="Select punchlist status..."
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Line Filters Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wide border-b border-purple-200 pb-1">
                    Line Item Filters
                  </h4>

                  {/* Line Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Line Status
                    </label>
                    <Select
                      isMulti
                      options={lineStatusOptions}
                      value={filters.lineStatus}
                      onChange={(value) => handleFilterChange('lineStatus', value || [])}
                      styles={customSelectStyles}
                      placeholder="Select line status..."
                      className="text-sm"
                    />
                  </div>

                  {/* Remaining Quantity Range */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Remaining Quantity Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={filters.remainingQty.min}
                        onChange={(e) => handleFilterChange('remainingQty', { ...filters.remainingQty, min: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="Min"
                        min="0"
                      />
                      <input
                        type="number"
                        value={filters.remainingQty.max}
                        onChange={(e) => handleFilterChange('remainingQty', { ...filters.remainingQty, max: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="Max"
                        min="0"
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
                  Apply Filters ({activeFilterCount})
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
