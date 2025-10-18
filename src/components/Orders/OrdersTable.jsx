import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Package, Eye, Edit, Trash2, Filter, MoreHorizontal, RefreshCw, ChevronDown, ChevronRight, ExternalLink, FileText, MapPin, Building2, Truck, AlertCircle, X, Calendar, ArrowUp, ArrowDown, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PreLrService from '../../services/PreLrService.js'
import EnterpriseFilters from './EnterpriseFilters.jsx'
import ExportButton from './ExportButton.jsx'
import SortButton from './SortButton.jsx'
import PreLrCard from './PreLrCard.jsx'
import ViewToggle from './ViewToggle.jsx'
import useScrollLock from '../../hooks/useScrollLock.js'

const OrdersTable = ({ currentTheme }) => {
  const navigate = useNavigate()
  const [preLrs, setPreLrs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [selectedPreLr, setSelectedPreLr] = useState(null)
  const [selectedLr, setSelectedLr] = useState(null)
  const [showPreLrModal, setShowPreLrModal] = useState(false)
  const [showLrModal, setShowLrModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Line Items Tab State
  const [lineItemsSearch, setLineItemsSearch] = useState('')
  const [lineItemsFilter, setLineItemsFilter] = useState('all')

  // LR Tracking Tab State
  const [lrTrackingSearch, setLrTrackingSearch] = useState('')
  const [lrTrackingFilter, setLrTrackingFilter] = useState('all')

  // Filter and Sort State
  const [filters, setFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // View Mode State (cards or table)
  const [viewMode, setViewMode] = useState('cards') // Default to card view

  useEffect(() => {
    fetchPreLrs()
  }, [])

  // Prevent body scroll when any modal is open
  useScrollLock(showPreLrModal || showLrModal)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        // Close topmost modal first
        if (showLrModal) {
          handleCloseLrModal()
        } else if (showPreLrModal) {
          handleClosePreLrModal()
        }
      }
    }

    if (showPreLrModal || showLrModal) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [showPreLrModal, showLrModal])

  // Focus modal content when modal opens for better scroll behavior
  useEffect(() => {
    if (showPreLrModal || showLrModal) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        const modalContent = document.querySelector('[role="dialog"] .overflow-y-auto')
        if (modalContent) {
          modalContent.focus()
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [showPreLrModal, showLrModal])

  const fetchPreLrs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await PreLrService.getPreLrs()
      
      if (response.success && response.data) {
        const transformedData = PreLrService.transformPreLrData(response.data)
        setPreLrs(transformedData)
      } else {
        throw new Error('Failed to fetch PRE-LR data')
      }
    } catch (error) {
      console.error('Error fetching PRE-LRs:', error)
      setError('Failed to load PRE-LR data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePreLrClick = (preLr) => {
    setSelectedPreLr(preLr)
    setShowPreLrModal(true)
  }

  const handleLrClick = (lr) => {
    setSelectedLr(lr)
    setShowLrModal(true)
  }

  const handleCloseModal = () => {
    setShowPreLrModal(false)
    setShowLrModal(false)
    setSelectedPreLr(null)
    setSelectedLr(null)
  }

  const handleCloseLrModal = () => {
    // Only close LR modal, keep PreLR modal open
    setShowLrModal(false)
    setSelectedLr(null)
  }

  const handleClosePreLrModal = () => {
    // Close PreLR modal and all nested modals
    setShowPreLrModal(false)
    setShowLrModal(false)
    setSelectedPreLr(null)
    setSelectedLr(null)
  }

  const toggleRowExpansion = (preLrId) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(preLrId)) {
      newExpandedRows.delete(preLrId)
    } else {
      newExpandedRows.add(preLrId)
    }
    setExpandedRows(newExpandedRows)
  }

  const getStatusColor = (status) => {
    return PreLrService.getStatusColor(status)
  }

  const getLrStatusColor = (status) => {
    // Handle undefined or null status
    if (!status) {
      return 'bg-slate-100 text-slate-800 border border-slate-300'
    }
    return PreLrService.getLrStatusColor(status)
  }

  const getLineStatusColor = (status) => {
    return PreLrService.getLineStatusColor(status)
  }

  // Filter Handler
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  // Sort Handler
  const handleSort = (columnKey) => {
    let direction = 'asc'
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key: columnKey, direction })
  }

  // Sort options for SortButton component
  const sortOptions = [
    { key: 'id', label: 'PRE-LR ID' },
    { key: 'consignor', label: 'Consignor' },
    { key: 'lrCount', label: 'LR Count' },
    { key: 'wtgNumber', label: 'WTG Number' },
    { key: 'district', label: 'District' },
    { key: 'site', label: 'Site' },
    { key: 'state', label: 'State' },
    { key: 'status', label: 'Status' },
    { key: 'createdDate', label: 'Created Date' }
  ]

  // Apply search, filters, and sorting to PRE-LRs
  const processedPreLrs = (() => {
    // Step 1: Apply search filter
    let result = preLrs.filter(preLr =>
      (preLr.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (preLr.consignee || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (preLr.consignor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (preLr.wtgNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (preLr.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Step 2: Apply advanced filters
    result = PreLrService.applyFilters(result, filters)

    // Step 3: Apply sorting
    result = PreLrService.sortPreLrs(result, sortConfig)

    return result
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <div className="max-w-7xl mx-auto p-2">

        {/* Ultra-Compact Header Section with Inline Search */}
        <div className="mb-2">
          <div className="bg-white rounded-lg shadow-md border border-orange-100 p-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-sm font-bold text-slate-800">PRE-LR Management</h1>
                {preLrs.length > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {preLrs.length} PRE-LRs
                  </span>
                )}
              </div>
              
              {/* Search Bar, Filters, and Refresh Button */}
              <div className="flex items-center gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <Search className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search PRE-LR by number, consignee, consignor, WTG number, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 bg-white border border-orange-200 rounded-md pl-8 pr-8 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                  />
                  {searchQuery && (
                    <motion.button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </div>

                {/* Enterprise Filters */}
                <EnterpriseFilters
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  activeFilters={filters}
                  preLrData={preLrs}
                />

                {/* Sort Button (only visible in card view) */}
                {viewMode === 'cards' && (
                  <SortButton
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    options={sortOptions}
                  />
                )}

                {/* Export Button */}
                <ExportButton
                  data={processedPreLrs}
                  filename="prelr-export"
                  activeFilters={filters}
                />

                {/* View Toggle */}
                <ViewToggle
                  viewMode={viewMode}
                  onViewChange={setViewMode}
                />

                {/* Refresh Button */}
                <motion.button
                  onClick={fetchPreLrs}
                  className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-all duration-200"
                  title="Refresh"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={fetchPreLrs}
                className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* PRE-LR Data Display (Card or Table View) */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md border border-orange-100 p-8 text-center">
            <div className="inline-flex items-center gap-2 text-orange-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading PRE-LRs...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md border border-orange-100 p-8 text-center">
            <div className="text-red-600">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Failed to load data</p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View - Improved Responsive Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {processedPreLrs.length > 0 ? (
              processedPreLrs.map((preLr) => (
                <PreLrCard
                  key={preLr.id}
                  preLr={preLr}
                  onViewDetails={handlePreLrClick}
                  onLrClick={handleLrClick}
                  expanded={expandedRows.has(preLr.id)}
                  onToggleExpand={toggleRowExpansion}
                />
              ))
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow-md border border-slate-200 p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600 font-medium">No PRE-LRs found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search</p>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-lg shadow-md border border-orange-100 overflow-hidden">
            {processedPreLrs.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600 font-medium">No PRE-LRs found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search</p>
              </div>
            ) : (
            <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('id')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        PRE-LR DETAILS
                        {sortConfig.key === 'id' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('consignor')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        CONSIGNOR
                        {sortConfig.key === 'consignor' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('lrCount')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        LR COUNT
                        {sortConfig.key === 'lrCount' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('wtgNumber')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        WTG NUMBER
                        {sortConfig.key === 'wtgNumber' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left text-slate-600 font-semibold text-xs uppercase tracking-wide">CONTENT</th>
                    <th className="px-3 py-2 text-left text-slate-600 font-semibold text-xs uppercase tracking-wide">FROM LOCATION</th>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('district')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        DISTRICT
                        {sortConfig.key === 'district' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('site')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        SITE
                        {sortConfig.key === 'site' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('state')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        STATE
                        {sortConfig.key === 'state' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        STATUS
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left">
                      <button
                        onClick={() => handleSort('createdDate')}
                        className="flex items-center gap-1 text-slate-600 font-semibold text-xs uppercase tracking-wide hover:text-orange-600 transition-colors"
                      >
                        CREATED DATE
                        {sortConfig.key === 'createdDate' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-100">
                  {processedPreLrs.map((preLr, index) => (
                    <React.Fragment key={preLr.id}>
                      {/* Ultra-Compact Main PRE-LR Row */}
                      <motion.tr 
                        className={`hover:bg-orange-50 transition-all duration-200 group ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}
                        whileHover={{ scale: 1.001 }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.1, delay: index * 0.01 }}
                      >
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <motion.button
                              onClick={() => toggleRowExpansion(preLr.id)}
                              className="p-0.5 hover:bg-orange-100 rounded transition-all duration-200"
                              title={expandedRows.has(preLr.id) ? "Click to collapse LRs" : "Click to expand LRs"}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {expandedRows.has(preLr.id) ? (
                                <ChevronDown className="w-3 h-3 text-orange-600" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-orange-600" />
                              )}
                            </motion.button>
                            <div className="p-1 bg-orange-100 rounded">
                              <FileText className="w-3 h-3 text-orange-600" />
                            </div>
                            <motion.button
                              onClick={() => handlePreLrClick(preLr)}
                              className="font-semibold text-slate-800 text-xs hover:text-orange-600 hover:underline transition-colors"
                              title="Click to view PRE-LR details"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {preLr.id}
                            </motion.button>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="font-medium text-slate-600 text-xs group-hover:text-slate-700">{preLr.consignor}</div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
                            {preLr.lrCount} LRs
                          </div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="font-normal text-slate-600 text-xs group-hover:text-slate-700">{preLr.wtgNumber}</div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="font-normal text-slate-600 text-xs group-hover:text-slate-700 max-w-xs truncate" title={preLr.content}>
                            {preLr.content}
                          </div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="font-normal text-slate-600 text-xs group-hover:text-slate-700">{preLr.fromLocation}</span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="font-normal text-slate-600 text-xs group-hover:text-slate-700">{preLr.district}</div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="font-normal text-slate-600 text-xs group-hover:text-slate-700">{preLr.site}</div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="font-normal text-slate-600 text-xs group-hover:text-slate-700">{preLr.state}</div>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(preLr.status)}`}>
                            {preLr.status.charAt(0).toUpperCase() + preLr.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <div className="font-normal text-slate-600 text-xs group-hover:text-slate-700">{preLr.createdDate}</div>
                        </td>
                      </motion.tr>

                      {/* Ultra-Compact Expanded Associated LRs Row */}
                      {expandedRows.has(preLr.id) && (
                        <tr className="bg-orange-50">
                          <td colSpan={10} className="px-2 py-2">
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-slate-600 font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5">
                                  <Package className="w-3.5 h-3.5" />
                                  Associated LRs ({preLr.associatedLrs.length})
                                </h4>
                                <div className="font-medium text-slate-600 text-xs">
                                  Click any LR to view details
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                                {preLr.associatedLrs.map((lr) => (
                                  <motion.div
                                    key={lr.id}
                                    className="bg-white border border-orange-200 rounded-md p-2 hover:shadow-sm hover:border-orange-300 transition-all duration-200 cursor-pointer group"
                                    onClick={() => handleLrClick(lr)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <h5 className="font-semibold text-slate-800 text-xs group-hover:text-orange-600">{lr.lrName}</h5>
                                      <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${getLrStatusColor(lr.status)}`}>
                                        {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                                      </span>
                                    </div>
                                    <div className="space-y-0.5 text-xs">
                                      <div className="flex items-center gap-1 text-slate-700">
                                        <Truck className="w-3 h-3 text-slate-400" />
                                        <span className="font-medium">{lr.vehicleNo || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-700">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        <span className="font-medium">{lr.lrDate || 'N/A'}</span>
                                      </div>
                                      <div className="pt-0.5 border-t border-slate-200">
                                        <div className="font-medium text-slate-600 text-xs">
                                          Click to view details →
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {/* Enhanced PRE-LR Details Modal with Tabs */}
        <AnimatePresence>
          {showPreLrModal && selectedPreLr && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
              onClick={handleClosePreLrModal}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white shadow-2xl w-full h-full flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                {/* Enhanced Header with Quick Actions */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg shadow-sm">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 id="modal-title" className="text-lg font-bold text-slate-800">PRE-LR Details</h3>
                        <p className="text-slate-600 text-sm">{selectedPreLr.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getStatusColor(selectedPreLr.status)}`}>
                        {selectedPreLr.status.charAt(0).toUpperCase() + selectedPreLr.status.slice(1)}
                      </span>
                      
                      {/* Quick Actions Dropdown */}
                      <div className="relative">
                        <motion.button
                          className="px-3 py-1.5 bg-white text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowQuickActions(!showQuickActions)}
                        >
                          Quick Actions
                          <ChevronDown className={`w-3 h-3 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
                        </motion.button>

                        {/* Quick Actions Menu */}
                        <AnimatePresence>
                          {showQuickActions && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-10"
                            >
                              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                <Truck className="w-4 h-4 text-orange-600" />
                                Assign Vehicle/Driver
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                <Edit className="w-4 h-4 text-blue-600" />
                                Update Status
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                onClick={() => {
                                  setActiveTab('route')
                                  setShowQuickActions(false)
                                }}
                              >
                                <MapPin className="w-4 h-4 text-green-600" />
                                View Full Route
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                <FileText className="w-4 h-4 text-purple-600" />
                                Generate Documents
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                Send Notification
                              </button>
                              <div className="border-t border-slate-200 my-2"></div>
                              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                <RefreshCw className="w-4 h-4 text-indigo-600" />
                                Sync with NetSuite
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg hover:bg-orange-200 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Export PDF
                        </motion.button>
                        <motion.button
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Print
                        </motion.button>
                        <motion.button
                          onClick={handleClosePreLrModal}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 min-h-0" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
                  {/* Enhanced Quick Stats Cards - Enterprise Level */}
                  <div className="px-6 py-3 bg-white border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Fulfillment Status Card */}
                    <motion.div 
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer"
                      whileHover={{ scale: 1.03, shadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setActiveTab('overview')}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <Package className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-xl font-bold text-orange-600">{selectedPreLr.progress}%</span>
                        </div>
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Fulfillment</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-green-700">{selectedPreLr.preLrLines?.reduce((sum, line) => sum + parseInt(line.lrCreatedQty || 0), 0)} delivered</span>
                        <span className="text-red-700">{selectedPreLr.preLrLines?.reduce((sum, line) => sum + parseInt(line.lrRemainingQty || 0), 0)} pending</span>
                      </div>
                    </motion.div>
                    
                    {/* Line Items Status Card */}
                    <motion.div 
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer"
                      whileHover={{ scale: 1.03, shadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setActiveTab('lines')}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xl font-bold text-blue-600">{selectedPreLr.preLrLines?.length || 12}</span>
                        </div>
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Line Items</p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                          {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrRemainingQty) === 0).length || 0} ✓
                        </span>
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium">
                          {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) > 0 && parseInt(line.lrRemainingQty) > 0).length || 0} ⏳
                        </span>
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                          {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) === 0).length || 0} ○
                        </span>
                      </div>
                    </motion.div>
                    
                    {/* LRs & Tracking Card */}
                    <motion.div 
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer"
                      whileHover={{ scale: 1.03, shadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setActiveTab('lrs')}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <Truck className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-xl font-bold text-purple-600">{selectedPreLr.associatedLrs?.length || 0}</span>
                        </div>
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Total LRs</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-green-700">
                          {selectedPreLr.associatedLrs?.filter(lr => lr.status === 'completed').length || 0} delivered
                        </span>
                        <span className="text-blue-700">
                          {selectedPreLr.associatedLrs?.filter(lr => lr.status === 'processing').length || 0} active
                        </span>
                      </div>
                    </motion.div>
                    
                    {/* Route Survey Card */}
                    <motion.div 
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer"
                      whileHover={{ scale: 1.03, shadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setActiveTab('route')}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      </div>
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Route Tracking</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-700">3 vehicles active</span>
                        <span className="text-green-700">View map →</span>
                      </div>
                    </motion.div>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="border-b border-slate-200 bg-white">
                    <nav className="flex space-x-6 px-6" aria-label="Tabs">
                    {[
                      { id: 'overview', name: 'Overview', icon: FileText },
                      { id: 'lines', name: 'Line Items', icon: Package },
                      { id: 'lrs', name: 'LRs', icon: Truck },
                      { id: 'route', name: 'Route', icon: MapPin },
                      { id: 'documents', name: 'Documents', icon: FileText },
                      { id: 'activity', name: 'Activity', icon: Calendar }
                    ].map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                            activeTab === tab.id
                              ? 'border-orange-500 text-orange-600'
                              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                          }`}
                          onClick={() => setActiveTab(tab.id)}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.name}
                        </button>
                      )
                      })}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="bg-slate-50">
                    {activeTab === 'overview' && (
                    <div className="p-6 space-y-6">
                      {/* Fulfillment Overview - Enterprise Level */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 shadow-sm border border-orange-200">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h4 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                              <Package className="w-5 h-5 text-orange-600" />
                              Fulfillment Status
                            </h4>
                            <p className="text-slate-600 text-sm mt-1">Overall PRE-LR completion tracking</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-orange-600">{selectedPreLr.progress}%</div>
                            <p className="text-slate-600 text-xs mt-1">Complete</p>
                          </div>
                        </div>

                        {/* Overall Progress Bar */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Total Quantity Progress</span>
                            <span className="text-sm font-semibold text-slate-800">
                              {selectedPreLr.preLrLines?.reduce((sum, line) => sum + parseInt(line.lrCreatedQty || 0), 0)} / {selectedPreLr.totalPreLRQty || 240} qty
                            </span>
                          </div>
                          <div className="w-full bg-white rounded-full h-4 shadow-inner">
                            <motion.div
                              className="h-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-end pr-2"
                              initial={{ width: 0 }}
                              animate={{ width: `${selectedPreLr.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            >
                              <span className="text-xs font-bold text-white">{selectedPreLr.progress}%</span>
                            </motion.div>
                          </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-slate-800">{selectedPreLr.preLrLines?.length || 12}</div>
                            <div className="text-xs text-slate-600 mt-1">Total Lines</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrRemainingQty) === 0).length || 4}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">Completed</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) > 0 && parseInt(line.lrRemainingQty) > 0).length || 3}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">In Progress</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) === 0).length || 5}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">Not Started</div>
                          </div>
                        </div>
                      </div>

                      {/* Line Items Summary - Grouped by Status */}
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                        <div className="p-6 border-b border-slate-200">
                          <h4 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Line Items Summary
                          </h4>
                          <p className="text-slate-600 text-sm mt-1">Detailed breakdown by completion status</p>
                        </div>

                        <div className="p-6 space-y-4">
                          {/* Completed Lines */}
                          <div className="border border-green-200 rounded-lg overflow-hidden">
                            <div className="bg-green-50 px-4 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-green-900">Completed Lines</h5>
                                  <p className="text-xs text-green-700">All quantities fulfilled</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                  {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrRemainingQty) === 0).length || 4}
                                </div>
                                <p className="text-xs text-green-700">lines</p>
                              </div>
                            </div>
                            <div className="p-4 bg-white space-y-2">
                              {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrRemainingQty) === 0).slice(0, 3).map((line, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-green-700">✓</span>
                        </div>
                        <div>
                                      <p className="font-medium text-slate-800 text-sm">{line.subContent}</p>
                                      <p className="text-xs text-slate-500">{line.vehicleType}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-green-600">{line.totalQuantity}/{line.totalQuantity}</p>
                                    <p className="text-xs text-slate-500">{line.lrCreatedQty} LRs</p>
                                  </div>
                                </div>
                              ))}
                              {(selectedPreLr.preLrLines?.filter(line => parseInt(line.lrRemainingQty) === 0).length || 0) > 3 && (
                                <button className="text-xs text-green-600 hover:text-green-700 font-medium mt-2">
                                  View all {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrRemainingQty) === 0).length} completed lines →
                                </button>
                              )}
                            </div>
                          </div>

                          {/* In Progress Lines */}
                          <div className="border border-yellow-200 rounded-lg overflow-hidden">
                            <div className="bg-yellow-50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-yellow-900">In Progress Lines</h5>
                                  <p className="text-xs text-yellow-700">Partially fulfilled</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-yellow-600">
                                  {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) > 0 && parseInt(line.lrRemainingQty) > 0).length || 3}
                                </div>
                                <p className="text-xs text-yellow-700">lines</p>
                              </div>
                            </div>
                            <div className="p-4 bg-white space-y-3">
                              {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) > 0 && parseInt(line.lrRemainingQty) > 0).map((line, idx) => (
                                <div key={idx} className="border border-slate-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <p className="font-medium text-slate-800 text-sm">{line.subContent}</p>
                                      <p className="text-xs text-slate-500">{line.vehicleType}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-yellow-600">{line.lrCreatedQty}/{line.totalQuantity}</p>
                                      <p className="text-xs text-red-600">{line.lrRemainingQty} pending</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                      <div
                                        className="bg-yellow-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(parseInt(line.lrCreatedQty) / parseInt(line.totalQuantity)) * 100}%` }}
                              ></div>
                            </div>
                                    <span className="text-xs font-medium text-slate-600">
                                      {Math.round((parseInt(line.lrCreatedQty) / parseInt(line.totalQuantity)) * 100)}%
                                    </span>
                          </div>
                        </div>
                              ))}
                      </div>
                          </div>

                          {/* Not Started Lines */}
                          <div className="border border-red-200 rounded-lg overflow-hidden">
                            <div className="bg-red-50 px-4 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                  <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-red-900">Not Started Lines</h5>
                                  <p className="text-xs text-red-700">No LRs created yet</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-red-600">
                                  {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) === 0).length || 5}
                                </div>
                                <p className="text-xs text-red-700">lines</p>
                              </div>
                            </div>
                            <div className="p-4 bg-white space-y-2">
                              {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) === 0).slice(0, 3).map((line, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-red-700">○</span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-800 text-sm">{line.subContent}</p>
                                      <p className="text-xs text-slate-500">{line.vehicleType}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-red-600">0/{line.totalQuantity}</p>
                                    <p className="text-xs text-slate-500">Awaiting LR</p>
                                  </div>
                                </div>
                              ))}
                              {(selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) === 0).length || 0) > 3 && (
                                <button className="text-xs text-red-600 hover:text-red-700 font-medium mt-2">
                                  View all {selectedPreLr.preLrLines?.filter(line => parseInt(line.lrCreatedQty) === 0).length} pending lines →
                                </button>
                              )}
                            </div>
                          </div>
                  </div>
                </div>
                
                      {/* Enhanced Basic Information Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-slate-200 h-24 flex flex-col justify-center hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Consignor</label>
                      </div>
                          <p className="text-slate-800 font-medium text-sm truncate">{selectedPreLr.consignor}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-slate-200 h-24 flex flex-col justify-center hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                        <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Consignee</label>
                      </div>
                          <p className="text-slate-800 font-medium text-sm truncate">{selectedPreLr.consignee}</p>
                      </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-slate-200 h-24 flex flex-col justify-center hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Site</label>
                      </div>
                          <p className="text-slate-800 font-medium text-sm truncate">{selectedPreLr.site}</p>
                      </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-slate-200 h-24 flex flex-col justify-center hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">From</label>
                      </div>
                          <p className="text-slate-800 font-medium text-sm truncate">{selectedPreLr.fromLocation}</p>
                    </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-slate-200 h-24 flex flex-col justify-center hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">To</label>
                          </div>
                          <p className="text-slate-800 font-medium text-sm truncate">{selectedPreLr.toLocation}</p>
                  </div>

                        <div className="bg-white rounded-lg p-4 border border-slate-200 h-24 flex flex-col justify-center hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck className="w-3 h-3 text-slate-400" />
                            <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Mode</label>
                          </div>
                          <p className="text-slate-800 font-medium text-sm truncate">{selectedPreLr.transportMode}</p>
                        </div>
                      </div>

                      {/* Consolidated Information Section */}
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                        <h4 className="text-slate-600 font-semibold text-sm uppercase tracking-wide mb-6 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Additional Details
                    </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                        <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">District</label>
                            <p className="text-slate-800 font-medium text-sm">{selectedPreLr.district}</p>
                      </div>
                          <div className="space-y-1">
                        <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">State</label>
                            <p className="text-slate-800 font-medium text-sm">{selectedPreLr.state}</p>
                      </div>
                          <div className="space-y-1">
                            <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Created Date</label>
                            <p className="text-slate-800 font-medium text-sm">{selectedPreLr.createdDate}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Status</label>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedPreLr.status === 'completed' ? 'bg-green-500' :
                                selectedPreLr.status === 'in-progress' ? 'bg-yellow-500' : 'bg-slate-400'
                              }`}></div>
                              <p className="text-slate-800 font-medium text-sm capitalize">{selectedPreLr.status}</p>
                            </div>
                          </div>
                    </div>
                  </div>

                      {/* Enhanced Summary Section */}
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                        <h4 className="text-slate-600 font-semibold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                          Summary
                    </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-600 text-sm">Total LRs:</span>
                              <span className="font-semibold text-slate-800">{selectedPreLr.associatedLrs?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-600 text-sm">Line Items:</span>
                              <span className="font-semibold text-slate-800">{selectedPreLr.preLrLines?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-600 text-sm">Transport Mode:</span>
                              <span className="font-semibold text-slate-800">{selectedPreLr.transportMode}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-600 text-sm">From:</span>
                              <span className="font-semibold text-slate-800">{selectedPreLr.fromLocation}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-600 text-sm">To:</span>
                              <span className="font-semibold text-slate-800">{selectedPreLr.toLocation}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                              <span className="text-slate-600 text-sm">Site:</span>
                              <span className="font-semibold text-slate-800">{selectedPreLr.site}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Notes Section */}
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-slate-600 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Notes & Instructions
                          </h4>
                          <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                            Add Note
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-orange-800 font-medium text-sm">Special Instructions</p>
                                <p className="text-orange-700 text-sm mt-1">Handle with care. Fragile items included in shipment.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                            <div className="flex items-start gap-2">
                              <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-blue-800 font-medium text-sm">Delivery Requirements</p>
                                <p className="text-blue-700 text-sm mt-1">Signature required upon delivery. Contact consignee before arrival.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-green-800 font-medium text-sm">Route Notes</p>
                                <p className="text-green-700 text-sm mt-1">Avoid toll roads during peak hours. Alternative route available via NH48.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'lines' && (
                    <div className="p-6 space-y-6">
                      {/* Line Items Header with Search & Filters */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            Line Items Breakdown
                          </h4>
                          <p className="text-slate-600 text-sm mt-1">Track individual line item fulfillment status</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Search Input */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search items..."
                              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                              value={lineItemsSearch}
                              onChange={(e) => setLineItemsSearch(e.target.value)}
                            />
                          </div>
                          {/* Group Filter */}
                          <select
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={lineItemsFilter}
                            onChange={(e) => setLineItemsFilter(e.target.value)}
                          >
                            <option value="all">All Items</option>
                            <option value="completed">Completed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="not-started">Not Started</option>
                          </select>
                        </div>
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {(() => {
                                  const lines = selectedPreLr.preLrLines || []
                                  const filtered = lineItemsFilter === 'all' ? lines :
                                    lineItemsFilter === 'completed' ? lines.filter(l => parseInt(l.lrRemainingQty) === 0) :
                                    lineItemsFilter === 'in-progress' ? lines.filter(l => parseInt(l.lrCreatedQty) > 0 && parseInt(l.lrRemainingQty) > 0) :
                                    lines.filter(l => parseInt(l.lrCreatedQty) === 0)
                                  const searched = lineItemsSearch ? filtered.filter(l =>
                                    l.subContent?.toLowerCase().includes(lineItemsSearch.toLowerCase()) ||
                                    l.lineId?.toLowerCase().includes(lineItemsSearch.toLowerCase())
                                  ) : filtered
                                  return searched.length
                                })()}
                              </div>
                              <div className="text-xs text-slate-600 mt-1">Line Items</div>
                            </div>
                            <Package className="w-8 h-8 text-blue-500" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {selectedPreLr.preLrLines?.reduce((sum, line) => sum + parseInt(line.lrCreatedQty || 0), 0)}
                              </div>
                              <div className="text-xs text-slate-600 mt-1">Delivered Qty</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">✓</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-red-600">
                                {selectedPreLr.preLrLines?.reduce((sum, line) => sum + parseInt(line.lrRemainingQty || 0), 0)}
                              </div>
                              <div className="text-xs text-slate-600 mt-1">Pending Qty</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">⏱</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{selectedPreLr.progress}%</div>
                              <div className="text-xs text-slate-600 mt-1">Avg Progress</div>
                            </div>
                            <ArrowUp className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Line Items Table */}
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                              <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                    Line #
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  Item Description
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                    Total Qty
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  Delivered
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  Remaining
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  Vehicle Type
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  Status
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  Progress
                                </th>
                            </tr>
                          </thead>
                            <tbody className="divide-y divide-slate-200">
                              {(() => {
                                const lines = selectedPreLr.preLrLines || []

                                // Apply filter
                                const filtered = lineItemsFilter === 'all' ? lines :
                                  lineItemsFilter === 'completed' ? lines.filter(l => parseInt(l.lrRemainingQty) === 0) :
                                  lineItemsFilter === 'in-progress' ? lines.filter(l => parseInt(l.lrCreatedQty) > 0 && parseInt(l.lrRemainingQty) > 0) :
                                  lines.filter(l => parseInt(l.lrCreatedQty) === 0)

                                // Apply search
                                const searched = lineItemsSearch ? filtered.filter(l =>
                                  l.subContent?.toLowerCase().includes(lineItemsSearch.toLowerCase()) ||
                                  l.lineId?.toLowerCase().includes(lineItemsSearch.toLowerCase())
                                ) : filtered

                                if (searched.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                                        <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                        <p className="font-medium">No line items found</p>
                                        <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                                      </td>
                                    </tr>
                                  )
                                }

                                return searched.map((line, index) => {
                                  const progress = line.totalQuantity > 0
                                    ? Math.round((parseInt(line.lrCreatedQty || 0) / parseInt(line.totalQuantity)) * 100)
                                    : 0
                                  const isCompleted = parseInt(line.lrRemainingQty) === 0
                                  const isInProgress = parseInt(line.lrCreatedQty) > 0 && parseInt(line.lrRemainingQty) > 0
                                  const isNotStarted = parseInt(line.lrCreatedQty) === 0

                                  return (
                              <motion.tr 
                                      key={index}
                                      className="hover:bg-blue-50 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.03 }}
                                    >
                                      <td className="px-4 py-4 text-sm font-bold text-slate-900">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            isCompleted ? 'bg-green-500' :
                                            isInProgress ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}></div>
                                          {line.lineId}
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                          <span className="text-sm font-semibold text-slate-900">{line.subContent}</span>
                                          <span className="text-xs text-slate-500 mt-0.5">{line.itemCode || 'N/A'}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                          <span className="text-sm font-bold text-slate-900">{line.totalQuantity}</span>
                                          <span className="text-xs text-slate-500">{line.unit || 'units'}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-green-700">{line.lrCreatedQty || 0}</span>
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-red-700">{line.lrRemainingQty || 0}</span>
                                          {parseInt(line.lrRemainingQty) > 0 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-sm text-slate-700">
                                        <div className="flex items-center gap-1">
                                          <Truck className="w-3 h-3 text-slate-400" />
                                          <span className="text-xs">{line.vehicleType || 'N/A'}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full inline-flex items-center gap-1 ${
                                          isCompleted ? 'bg-green-100 text-green-800 border border-green-300' :
                                          isInProgress ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                          'bg-red-100 text-red-800 border border-red-300'
                                        }`}>
                                          {isCompleted ? '✓ Completed' : isInProgress ? '⏳ In Progress' : '○ Not Started'}
                                  </span>
                                </td>
                                      <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                          <div className="flex-1 min-w-[100px]">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs font-bold text-slate-700">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2.5 shadow-inner">
                                              <motion.div
                                                className={`h-2.5 rounded-full ${
                                                  progress === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                  progress >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                                  progress > 0 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                                  'bg-gradient-to-r from-red-500 to-red-600'
                                                }`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                              ></motion.div>
                                            </div>
                                          </div>
                                        </div>
                                </td>
                              </motion.tr>
                                  )
                                })
                              })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  )}

                  {activeTab === 'lrs' && (
                    <div className="p-6 space-y-6">
                      {/* LR Tracking Header with Search & Filters */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                            <Truck className="w-5 h-5 text-purple-600" />
                            LR Tracking & Route Monitoring
                    </h4>
                          <p className="text-slate-600 text-sm mt-1">Track all LRs with real-time route information</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Search Input */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search LRs..."
                              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                              value={lrTrackingSearch}
                              onChange={(e) => setLrTrackingSearch(e.target.value)}
                            />
                          </div>
                          {/* Status Filter */}
                          <select
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={lrTrackingFilter}
                            onChange={(e) => setLrTrackingFilter(e.target.value)}
                          >
                            <option value="all">All Status</option>
                            <option value="processing">In Transit</option>
                            <option value="pending">Loading</option>
                            <option value="completed">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {/* Link to Full Route Survey */}
                          <motion.button
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md text-sm font-semibold flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/route-survey/${selectedPreLr.id}`)}
                          >
                            <MapPin className="w-4 h-4" />
                            Full Route Map
                          </motion.button>
                        </div>
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{selectedPreLr.associatedLrs?.length || 0}</div>
                              <div className="text-xs text-slate-600 mt-1">Total LRs</div>
                            </div>
                            <FileText className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-green-600">{selectedPreLr.associatedLrs?.filter(lr => lr.status === 'processing').length || 0}</div>
                              <div className="text-xs text-slate-600 mt-1">In Transit</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                              <Truck className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{selectedPreLr.associatedLrs?.filter(lr => lr.status === 'completed').length || 0}</div>
                              <div className="text-xs text-slate-600 mt-1">Delivered</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">✓</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-yellow-600">{selectedPreLr.associatedLrs?.filter(lr => lr.status === 'pending').length || 0}</div>
                              <div className="text-xs text-slate-600 mt-1">Loading</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">⏱</div>
                          </div>
                        </div>
                      </div>

                      {/* LR Cards with Route Integration */}
                      <div className="space-y-4">
                        {(() => {
                          // Get transformed LR data from selectedPreLr
                          const realLrs = (selectedPreLr?.associatedLrs || []).map(lr => {
                            // Get items from PreLR lines (since lrLines might be empty, use PreLR lines as fallback)
                            const preLrLines = selectedPreLr?.preLrLines || []
                            const itemsText = preLrLines.length > 0
                              ? `${preLrLines.map(line => line.subContent).slice(0, 2).join(', ')}${preLrLines.length > 2 ? '...' : ''} (${preLrLines.length} items)`
                              : 'No line items'

                            return {
                              id: lr.lrName || lr.id,
                              status: lr.status,
                              vehicleNumber: lr.vehicleNo,
                              driverName: 'Not Assigned', // Driver assignment not implemented yet
                              lrDate: lr.lrDate,
                              from: selectedPreLr?.fromLocation || 'Loading Point',
                              to: selectedPreLr?.consignee || 'Destination',
                              distance: 'N/A', // Distance tracking not implemented
                              progress: lr.status === 'completed' ? 100 : (lr.status === 'processing' ? 50 : 0),
                              eta: lr.vehicleDepDate || 'Pending',
                              currentLocation: lr.status === 'completed' ? 'Delivered' : 'In Transit',
                              items: itemsText,
                              speed: 'N/A', // Speed tracking not implemented
                              deliveredAt: lr.status === 'completed' ? lr.lrDate : null,
                              deliveryStatus: lr.status,
                              loadingProgress: lr.status === 'completed' ? '100%' : '0%',
                              lrData: lr.rawData || lr // Store full LR data for modal
                            }
                          })

                          const filtered = lrTrackingFilter === 'all' ? realLrs :
                            realLrs.filter(lr => lr.status === lrTrackingFilter)

                          const searched = lrTrackingSearch ? filtered.filter(lr =>
                            lr.id?.toLowerCase().includes(lrTrackingSearch.toLowerCase()) ||
                            lr.vehicleNumber?.toLowerCase().includes(lrTrackingSearch.toLowerCase()) ||
                            lr.driverName?.toLowerCase().includes(lrTrackingSearch.toLowerCase())
                          ) : filtered

                          if (searched.length === 0) {
                            return (
                              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                                <Truck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-600 font-medium text-lg">No LRs found</p>
                                <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or search query</p>
                              </div>
                            )
                          }

                          return searched.map((lr, index) => (
                        <motion.div
                              key={index}
                              className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden ${
                                lr.status === 'processing' ? 'border-green-200' :
                                lr.status === 'completed' ? 'border-blue-200' :
                                lr.status === 'pending' ? 'border-yellow-200' :
                                'border-slate-200'
                              }`}
                              initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              {/* LR Header */}
                              <div className={`p-4 ${
                                lr.status === 'processing' ? 'bg-gradient-to-r from-green-50 to-green-100' :
                                lr.status === 'completed' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                                lr.status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' :
                                'bg-gradient-to-r from-slate-50 to-slate-100'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${
                                      lr.status === 'processing' ? 'bg-green-500' :
                                      lr.status === 'completed' ? 'bg-blue-500' :
                                      lr.status === 'pending' ? 'bg-yellow-500' :
                                      'bg-slate-500'
                                    }`}>
                                      <Truck className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                      <h5 className="text-lg font-bold text-slate-800">{lr.id}</h5>
                                      <p className="text-sm text-slate-600 mt-0.5">{lr.items}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                                      lr.status === 'processing' ? 'bg-green-100 text-green-800 border border-green-300' :
                                      lr.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                      lr.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                      'bg-slate-100 text-slate-800 border border-slate-300'
                                    }`}>
                                      {lr.status === 'processing' ? '🚚 In Transit' :
                                       lr.status === 'completed' ? '✓ Delivered' :
                                       lr.status === 'pending' ? '⏱ Loading' : 'Pending'}
                                    </span>
                                    {lr.status === 'processing' && (
                                      <motion.button
                                        className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300"
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => navigate(`/route-survey/${selectedPreLr.id}?lr=${lr.id}`)}
                                      >
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Track Live
                                      </motion.button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* LR Details Grid */}
                              <div className="p-5">
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">Vehicle</p>
                                    <p className="font-bold text-slate-800">{lr.vehicleNumber}</p>
                                  </div>
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">Driver</p>
                                    <p className="font-bold text-slate-800">{lr.driverName}</p>
                                  </div>
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">LR Date</p>
                                    <p className="font-bold text-slate-800">{lr.lrDate}</p>
                                  </div>
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-1">Distance</p>
                                    <p className="font-bold text-slate-800">{lr.distance}</p>
                                  </div>
                                </div>

                                {/* Route Information */}
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-bold text-slate-800 flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-slate-600" />
                                      Route Information
                                    </h6>
                                    {lr.status === 'in-transit' && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-green-700 font-semibold">{lr.speed}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 mb-3">
                                    <div className="flex-1">
                                      <p className="text-xs text-slate-600 mb-1">From</p>
                                      <p className="font-semibold text-slate-800 text-sm">{lr.from}</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                    <div className="flex-1">
                                      <p className="text-xs text-slate-600 mb-1">To</p>
                                      <p className="font-semibold text-slate-800 text-sm">{lr.to}</p>
                                    </div>
                                  </div>

                                  {lr.status === 'in-transit' && (
                                    <>
                                      <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-slate-600">Current Location</span>
                                          <span className="text-sm font-bold text-green-700">{lr.currentLocation}</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-slate-600">Progress</span>
                                          <span className="text-sm font-bold text-slate-800">{lr.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                                          <motion.div
                                            className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${lr.progress}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                          ></motion.div>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">ETA</span>
                                        <span className="font-bold text-orange-600">{lr.eta}</span>
                                      </div>
                                    </>
                                  )}

                                  {lr.status === 'delivered' && (
                                    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-200">
                                      <div>
                                        <p className="text-xs text-slate-600">Delivered At</p>
                                        <p className="font-bold text-blue-700 mt-1">{lr.deliveredAt}</p>
                                      </div>
                            <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-sm font-bold">✓</span>
                              </div>
                                        <span className="text-sm font-semibold text-blue-700">{lr.deliveryStatus}</span>
                                      </div>
                                    </div>
                                  )}

                                  {lr.status === 'loading' && (
                                    <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                              <div>
                                        <p className="text-xs text-slate-600">Loading Progress</p>
                                        <p className="font-bold text-yellow-700 mt-1">{lr.loadingProgress} Complete</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                          <Package className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-yellow-700">{lr.currentLocation}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* View Details Button */}
                                <div className="px-5 pb-4">
                                  <motion.button
                                    onClick={() => {
                                      // Use the original LR data from lrData property
                                      setSelectedLr(lr.lrData)
                                      setShowLrModal(true)
                                    }}
                                    className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    View LR Details & Line Items
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        })()}
                      </div>
                    </div>
                  )}

                  {activeTab === 'route' && (
                    <div className="p-6 space-y-6">
                      {/* Route Survey Preview */}
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
                          <h4 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Route Survey & Tracking
                          </h4>
                          <p className="text-slate-600 text-sm mt-1">Real-time vehicle location and route visualization</p>
                        </div>

                        <div className="p-6">
                          {/* Map Preview - Enhanced with Sample Route */}
                          <div className="relative bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-blue-300 mb-6 overflow-hidden">
                            {/* Sample Route SVG */}
                            <svg className="absolute inset-0 w-full h-full">
                              {/* Planned Route (Blue dashed) */}
                              <path
                                d="M 50 350 Q 200 300 350 280 Q 500 260 650 240"
                                stroke="#3B82F6"
                                strokeWidth="3"
                                strokeDasharray="8,4"
                                fill="none"
                                opacity="0.6"
                              />
                              {/* Actual Route (Green solid) */}
                              <path
                                d="M 50 350 Q 190 310 340 290 Q 480 270 580 260"
                                stroke="#10B981"
                                strokeWidth="4"
                                fill="none"
                                opacity="0.8"
                              />
                            </svg>

                            {/* Origin Marker */}
                            <div className="absolute left-12 bottom-16 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold">
                              A
                            </div>

                            {/* Destination Marker */}
                            <div className="absolute right-16 top-16 w-10 h-10 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold">
                              B
                            </div>

                            {/* Current Vehicle Position */}
                            <motion.div
                              className="absolute right-32 top-32 w-12 h-12 bg-orange-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Truck className="w-6 h-6 text-white" />
                            </motion.div>

                            {/* Center overlay */}
                            <div className="text-center z-10 bg-white bg-opacity-90 rounded-lg p-6 shadow-lg">
                              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                              <p className="text-slate-800 font-semibold text-lg mb-2">Interactive Route Map</p>
                              <p className="text-slate-600 text-sm mb-4">Full map with real-time tracking available</p>
                              <motion.button
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg text-sm font-semibold flex items-center gap-2 mx-auto"
                                whileHover={{ scale: 1.05, shadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/route-survey/${selectedPreLr.id}`)}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open Full Route Survey
                              </motion.button>
                            </div>
                          </div>

                          {/* Enhanced Route Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <motion.div
                              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                  <MapPin className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="font-bold text-slate-800">Route Details</h5>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Distance:</span>
                                  <span className="font-semibold text-slate-800">245 km</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Duration:</span>
                                  <span className="font-semibold text-slate-800">4h 30m</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Status:</span>
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">In Transit</span>
                                </div>
                              </div>
                            </motion.div>

                            <motion.div
                              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                  <Truck className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="font-bold text-slate-800">Vehicle Info</h5>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Vehicle:</span>
                                  <span className="font-semibold text-slate-800">MH12AB1234</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Driver:</span>
                                  <span className="font-semibold text-slate-800">Rajesh Kumar</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Speed:</span>
                                  <span className="font-semibold text-green-600">52 km/h</span>
                                </div>
                              </div>
                            </motion.div>

                            <motion.div
                              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-orange-500 rounded-lg">
                                  <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="font-bold text-slate-800">Timeline</h5>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Departure:</span>
                                  <span className="font-semibold text-slate-800">2:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">ETA:</span>
                                  <span className="font-semibold text-slate-800">6:30 PM</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Progress:</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-slate-200 rounded-full h-2">
                                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                    <span className="font-semibold text-slate-800">60%</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Waypoints Preview */}
                          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                            <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-600" />
                              Waypoints (4)
                            </h5>
                            <div className="space-y-3">
                              {[
                                { name: 'Origin - Suzlon Depot', location: 'Pune, Maharashtra', status: 'completed', time: '2:00 PM' },
                                { name: 'Toll Plaza - Mumbai Highway', location: 'Expressway', status: 'completed', time: '4:15 PM', delay: true },
                                { name: 'Rest Stop - Lonavala', location: 'Maharashtra', status: 'approaching', time: 'ETA: 30 min' },
                                { name: 'Destination - Mumbai', location: 'Maharashtra', status: 'pending', time: 'ETA: 2h 15m' }
                              ].map((waypoint, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                    waypoint.status === 'completed' ? 'bg-green-500' :
                                    waypoint.status === 'approaching' ? 'bg-yellow-500 animate-pulse' :
                                    'bg-slate-300'
                                  }`}>
                                    {waypoint.status === 'completed' ? '✓' : index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-800 text-sm">{waypoint.name}</p>
                                    <p className="text-xs text-slate-600">{waypoint.location}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-xs font-medium ${
                                      waypoint.status === 'completed' ? 'text-green-600' :
                                      waypoint.status === 'approaching' ? 'text-yellow-600' :
                                      'text-slate-500'
                                    }`}>
                                      {waypoint.time}
                                    </p>
                                    {waypoint.delay && (
                                      <p className="text-xs text-red-600">+15 min delay</p>
                                    )}
                              </div>
                            </div>
                              ))}
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="p-6 space-y-6">
                      {/* Compliance Dashboard Header */}
                            <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Document Compliance Tracking
                          </h4>
                          <p className="text-slate-600 text-sm mt-1">Monitor document status and compliance requirements</p>
                            </div>
                        <div className="flex items-center gap-3">
                          <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="all">All Documents</option>
                            <option value="required">Required Only</option>
                            <option value="expiring">Expiring Soon</option>
                            <option value="missing">Missing</option>
                          </select>
                        </div>
                      </div>

                      {/* Compliance Summary Cards */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="text-3xl font-bold text-indigo-600">85%</div>
                              <div className="text-xs text-slate-600 mt-1">Compliance Score</div>
                            </div>
                            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="w-full bg-white rounded-full h-2 mt-3">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-green-600">18</div>
                              <div className="text-xs text-slate-600 mt-1">Verified</div>
                            </div>
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-yellow-600">3</div>
                              <div className="text-xs text-slate-600 mt-1">Expiring Soon</div>
                            </div>
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-red-600">2</div>
                              <div className="text-xs text-slate-600 mt-1">Missing</div>
                            </div>
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
                          </div>
                        </div>
                      </div>

                      {/* Document Categories */}
                      <div className="space-y-4">
                        {/* Vehicle Documents */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-4 border-b border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                  <Truck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-800">Vehicle Documents</h5>
                                  <p className="text-xs text-slate-600 mt-0.5">Registration, Insurance, Permits</p>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">5/6 Complete</span>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="space-y-3">
                              {[
                                { name: 'Vehicle Registration Certificate', status: 'verified', expiry: 'Valid till Dec 2025', required: true },
                                { name: 'Vehicle Insurance', status: 'verified', expiry: 'Valid till Mar 2024', required: true, expiryWarning: true },
                                { name: 'Pollution Certificate', status: 'verified', expiry: 'Valid till Jun 2024', required: true },
                                { name: 'Fitness Certificate', status: 'verified', expiry: 'Valid till Sep 2024', required: true },
                                { name: 'Route Permit', status: 'verified', expiry: 'Valid till Aug 2024', required: true },
                                { name: 'National Permit', status: 'missing', required: false }
                              ].map((doc, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                                  doc.status === 'missing' ? 'bg-red-50 border-red-200' :
                                  doc.expiryWarning ? 'bg-yellow-50 border-yellow-200' :
                                  'bg-slate-50 border-slate-200'
                                }`}>
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      doc.status === 'verified' ? 'bg-green-500' :
                                      doc.status === 'missing' ? 'bg-red-500' :
                                      'bg-yellow-500'
                                    }`}>
                                      {doc.status === 'verified' ? (
                                        <span className="text-white text-sm font-bold">✓</span>
                                      ) : doc.status === 'missing' ? (
                                        <span className="text-white text-sm font-bold">!</span>
                                      ) : (
                                        <FileText className="w-4 h-4 text-white" />
                                      )}
                            </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
                                        {doc.required && (
                                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">Required</span>
                                        )}
                          </div>
                                      {doc.expiry && (
                                        <p className={`text-xs mt-1 ${
                                          doc.expiryWarning ? 'text-yellow-700 font-semibold' : 'text-slate-600'
                                        }`}>
                                          {doc.expiryWarning && '⚠️ '}{doc.expiry}
                                        </p>
                                      )}
                                      {doc.status === 'missing' && (
                                        <p className="text-xs text-red-700 font-semibold mt-1">Document not uploaded</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {doc.status === 'verified' && (
                                      <>
                                        <button className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium">
                                          View
                                        </button>
                                        <button className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-medium">
                                          Download
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                      ))}
                    </div>
                  </div>
                        </div>

                        {/* Transport Documents */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-4 border-b border-purple-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-800">Transport Documents</h5>
                                  <p className="text-xs text-slate-600 mt-0.5">PO, Invoices, Permits</p>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">6/6 Complete</span>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="space-y-3">
                              {[
                                { name: 'Purchase Order', status: 'verified', uploadDate: 'Jan 10, 2024', required: true },
                                { name: 'Tax Invoice', status: 'verified', uploadDate: 'Jan 11, 2024', required: true },
                                { name: 'E-Way Bill', status: 'verified', expiry: 'Valid till Jan 20, 2024', required: true },
                                { name: 'Transport Permit', status: 'verified', uploadDate: 'Jan 12, 2024', required: true },
                                { name: 'Loading Certificate', status: 'verified', uploadDate: 'Jan 13, 2024', required: true },
                                { name: 'Packing List', status: 'verified', uploadDate: 'Jan 13, 2024', required: true }
                              ].map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 border-slate-200">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                                      <span className="text-white text-sm font-bold">✓</span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
                                        {doc.required && (
                                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">Required</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-600 mt-1">
                                        {doc.expiry || `Uploaded: ${doc.uploadDate}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium">
                                      View
                                    </button>
                                    <button className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-medium">
                                      Download
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Driver Documents */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-5 py-4 border-b border-orange-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500 rounded-lg">
                                  <Package className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-800">Driver Documents</h5>
                                  <p className="text-xs text-slate-600 mt-0.5">License, Medical Fitness</p>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">3/4 Complete</span>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="space-y-3">
                              {[
                                { name: 'Driving License', status: 'verified', expiry: 'Valid till Nov 2026', required: true },
                                { name: 'Medical Fitness Certificate', status: 'verified', expiry: 'Valid till Feb 2024', required: true, expiryWarning: true },
                                { name: 'Police Verification', status: 'verified', uploadDate: 'Dec 2023', required: true },
                                { name: 'Training Certificate', status: 'missing', required: false }
                              ].map((doc, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                                  doc.status === 'missing' ? 'bg-red-50 border-red-200' :
                                  doc.expiryWarning ? 'bg-yellow-50 border-yellow-200' :
                                  'bg-slate-50 border-slate-200'
                                }`}>
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      doc.status === 'verified' ? 'bg-green-500' :
                                      'bg-red-500'
                                    }`}>
                                      {doc.status === 'verified' ? (
                                        <span className="text-white text-sm font-bold">✓</span>
                                      ) : (
                                        <span className="text-white text-sm font-bold">!</span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
                                        {doc.required && (
                                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">Required</span>
                                        )}
                                      </div>
                                      {doc.expiry && (
                                        <p className={`text-xs mt-1 ${
                                          doc.expiryWarning ? 'text-yellow-700 font-semibold' : 'text-slate-600'
                                        }`}>
                                          {doc.expiryWarning && '⚠️ '}{doc.expiry}
                                        </p>
                                      )}
                                      {doc.uploadDate && !doc.expiry && (
                                        <p className="text-xs text-slate-600 mt-1">Uploaded: {doc.uploadDate}</p>
                                      )}
                                      {doc.status === 'missing' && (
                                        <p className="text-xs text-red-700 font-semibold mt-1">Document not uploaded</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {doc.status === 'verified' && (
                                      <>
                                        <button className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium">
                                          View
                                        </button>
                                        <button className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-medium">
                                          Download
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="p-6 space-y-6">
                      {/* Activity Timeline Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-600" />
                            Activity Timeline
                          </h4>
                          <p className="text-slate-600 text-sm mt-1">Complete history of all PRE-LR activities</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
                            <option value="all">All Activities</option>
                            <option value="status">Status Changes</option>
                            <option value="lrs">LR Updates</option>
                            <option value="documents">Documents</option>
                            <option value="system">System Events</option>
                          </select>
                        </div>
                      </div>

                      {/* Activity Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-slate-700">42</div>
                              <div className="text-xs text-slate-600 mt-1">Total Events</div>
                            </div>
                            <Calendar className="w-8 h-8 text-slate-500" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">15</div>
                              <div className="text-xs text-slate-600 mt-1">LR Updates</div>
                            </div>
                            <Truck className="w-8 h-8 text-blue-500" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-green-600">12</div>
                              <div className="text-xs text-slate-600 mt-1">Documents</div>
                            </div>
                            <FileText className="w-8 h-8 text-green-500" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-yellow-600">8</div>
                              <div className="text-xs text-slate-600 mt-1">Status Changes</div>
                            </div>
                            <RefreshCw className="w-8 h-8 text-yellow-500" />
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Timeline */}
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="relative">
                          {/* Timeline vertical line */}
                          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200"></div>

                          <div className="space-y-6">
                            {/* Today */}
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">Today</span>
                                </div>
                                <div className="h-px bg-slate-200 flex-1"></div>
                              </div>
                              <div className="space-y-4 ml-4">
                                {[
                                  {
                                    time: '2:45 PM',
                                    title: 'Vehicle arrived at checkpoint',
                                    description: 'LR #LR001/2024 - Lonavala Toll Plaza',
                                    user: 'GPS Tracking System',
                                    type: 'tracking',
                                    icon: MapPin,
                                    color: 'green'
                                  },
                                  {
                                    time: '11:30 AM',
                                    title: 'Document verified',
                                    description: 'E-Way Bill approved by compliance team',
                                    user: 'Compliance Officer',
                                    type: 'document',
                                    icon: FileText,
                                    color: 'blue'
                                  },
                                  {
                                    time: '9:15 AM',
                                    title: 'New LR created',
                                    description: 'LR #LR004/2024 added - Loading in progress',
                                    user: 'Prakash Yadav',
                                    type: 'lr',
                                    icon: Truck,
                                    color: 'purple'
                                  }
                                ].map((event, index) => {
                                  const IconComponent = event.icon
                                  return (
                                    <motion.div
                                      key={index}
                                      className="relative flex gap-4"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                    >
                                      {/* Timeline dot */}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                                        event.color === 'green' ? 'bg-green-500' :
                                        event.color === 'blue' ? 'bg-blue-500' :
                                        event.color === 'purple' ? 'bg-purple-500' :
                                        event.color === 'yellow' ? 'bg-yellow-500' :
                                        'bg-slate-500'
                                      }`}>
                                        <IconComponent className="w-5 h-5 text-white" />
                                      </div>

                                      {/* Event card */}
                                      <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <h6 className="font-bold text-slate-800">{event.title}</h6>
                                            <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                                          </div>
                                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-3">{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                          <span className="px-2 py-1 bg-white rounded border border-slate-200">{event.user}</span>
                                          <span className={`px-2 py-1 rounded ${
                                            event.color === 'green' ? 'bg-green-100 text-green-700' :
                                            event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                            event.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                            event.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-100 text-slate-700'
                                          }`}>{event.type}</span>
                  </div>
                </div>
              </motion.div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Yesterday */}
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">Jan 15</span>
                                </div>
                                <div className="h-px bg-slate-200 flex-1"></div>
                              </div>
                              <div className="space-y-4 ml-4">
                                {[
                                  {
                                    time: '5:30 PM',
                                    title: 'LR delivered successfully',
                                    description: 'LR #LR003/2024 - Delivered and verified at Mumbai Site',
                                    user: 'Suresh Singh',
                                    type: 'delivery',
                                    icon: Package,
                                    color: 'green'
                                  },
                                  {
                                    time: '2:15 PM',
                                    title: 'Status updated',
                                    description: 'PRE-LR status changed from "Pending" to "In Progress"',
                                    user: 'System Auto-Update',
                                    type: 'status',
                                    icon: RefreshCw,
                                    color: 'yellow'
                                  },
                                  {
                                    time: '10:00 AM',
                                    title: 'Multiple LRs departed',
                                    description: 'LR #LR001/2024 and LR #LR002/2024 left depot',
                                    user: 'Depot Manager',
                                    type: 'departure',
                                    icon: Truck,
                                    color: 'blue'
                                  }
                                ].map((event, index) => {
                                  const IconComponent = event.icon
                                  return (
                                    <motion.div
                                      key={index}
                                      className="relative flex gap-4"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: (index + 3) * 0.1 }}
                                    >
                                      {/* Timeline dot */}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                                        event.color === 'green' ? 'bg-green-500' :
                                        event.color === 'blue' ? 'bg-blue-500' :
                                        event.color === 'yellow' ? 'bg-yellow-500' :
                                        'bg-slate-500'
                                      }`}>
                                        <IconComponent className="w-5 h-5 text-white" />
                                      </div>

                                      {/* Event card */}
                                      <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <h6 className="font-bold text-slate-800">{event.title}</h6>
                                            <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                                          </div>
                                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-3">{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                          <span className="px-2 py-1 bg-white rounded border border-slate-200">{event.user}</span>
                                          <span className={`px-2 py-1 rounded ${
                                            event.color === 'green' ? 'bg-green-100 text-green-700' :
                                            event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                            event.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-100 text-slate-700'
                                          }`}>{event.type}</span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Older */}
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">Jan 10</span>
                                </div>
                                <div className="h-px bg-slate-200 flex-1"></div>
                              </div>
                              <div className="space-y-4 ml-4">
                                {[
                                  {
                                    time: '3:00 PM',
                                    title: 'Documents uploaded',
                                    description: 'Purchase Order and Tax Invoice added to system',
                                    user: 'Document Manager',
                                    type: 'document',
                                    icon: FileText,
                                    color: 'blue'
                                  },
                                  {
                                    time: '11:00 AM',
                                    title: 'PRE-LR created',
                                    description: 'DOMWBS252600000454 synced from NetSuite ERP',
                                    user: 'System (NetSuite Sync)',
                                    type: 'create',
                                    icon: Package,
                                    color: 'purple'
                                  }
                                ].map((event, index) => {
                                  const IconComponent = event.icon
                                  return (
                                    <motion.div
                                      key={index}
                                      className="relative flex gap-4"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: (index + 6) * 0.1 }}
                                    >
                                      {/* Timeline dot */}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                                        event.color === 'blue' ? 'bg-blue-500' :
                                        event.color === 'purple' ? 'bg-purple-500' :
                                        'bg-slate-500'
                                      }`}>
                                        <IconComponent className="w-5 h-5 text-white" />
                                      </div>

                                      {/* Event card */}
                                      <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <h6 className="font-bold text-slate-800">{event.title}</h6>
                                            <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                                          </div>
                                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-3">{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                          <span className="px-2 py-1 bg-white rounded border border-slate-200">{event.user}</span>
                                          <span className={`px-2 py-1 rounded ${
                                            event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                            event.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                            'bg-slate-100 text-slate-700'
                                          }`}>{event.type}</span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced LR Details Modal */}
        <AnimatePresence>
          {showLrModal && selectedLr && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"
              onClick={handleCloseLrModal}
              onWheel={(e) => e.preventDefault()}
              onTouchMove={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Premium Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">LR Details</h3>
                        <p className="text-slate-600 text-sm mt-1">{selectedLr.lrName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getLrStatusColor(selectedLr.status)}`}>
                        {selectedLr.status ? selectedLr.status.charAt(0).toUpperCase() + selectedLr.status.slice(1) : 'Unknown'}
                      </span>
                      <div className="flex items-center gap-2">
                        <motion.button
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Export PDF
                        </motion.button>
                        <motion.button
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Print
                        </motion.button>
                        <motion.button
                          onClick={handleCloseLrModal}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats Cards */}
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Vehicle</p>
                          <p className="text-sm font-bold text-slate-800">{selectedLr.vehicleNo || 'N/A'}</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">LR Date</p>
                          <p className="text-sm font-bold text-slate-800">{selectedLr.lrDate || 'N/A'}</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Assignment</p>
                          <p className="text-sm font-bold text-slate-800 capitalize">{selectedLr.assignmentStatus || 'N/A'}</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Ready Status</p>
                          <p className={`text-sm font-bold ${selectedLr.ready ? 'text-green-800' : 'text-amber-800'}`}>
                            {selectedLr.ready ? 'Ready' : 'Processing'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Basic LR Information Cards */}
                    <div className="space-y-6">
                      <h4 className="text-slate-600 font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Basic LR Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">LR Number</label>
                          <p className="font-semibold text-slate-800 text-sm mt-1">{selectedLr.lrName || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">LR Date</label>
                          <p className="font-medium text-slate-800 text-sm mt-1">{selectedLr.lrDate || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Status</label>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLrStatusColor(selectedLr.status)}`}>
                              {selectedLr.status ? selectedLr.status.charAt(0).toUpperCase() + selectedLr.status.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Vehicle Number</label>
                          <p className="font-medium text-slate-800 text-sm mt-1">{selectedLr.vehicleNo || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Vehicle Type</label>
                          <p className="font-medium text-slate-800 text-sm mt-1">{selectedLr.vehicleType || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Assignment Status</label>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              selectedLr.assignmentStatus === 'assigned' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedLr.assignmentStatus ? selectedLr.assignmentStatus.charAt(0).toUpperCase() + selectedLr.assignmentStatus.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="space-y-6">
                      <h4 className="text-slate-600 font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Vehicle Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Request Date</label>
                          <p className="font-medium text-slate-800 text-sm mt-1">{selectedLr.vehicleReqDate || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Report Date</label>
                          <p className="font-medium text-slate-800 text-sm mt-1">{selectedLr.vehicleRepDate || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Departure Date</label>
                          <p className="font-medium text-slate-800 text-sm mt-1">{selectedLr.vehicleDepDate || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Release Date</label>
                          <p className="font-medium text-slate-800 text-sm mt-1">{selectedLr.vehicleRelDate || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Assignment Information */}
                    <div className="space-y-6">
                      <h4 className="text-slate-600 font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Assignment Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Driver Status</label>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              selectedLr.driverStatus === 'assigned' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedLr.driverStatus ? selectedLr.driverStatus.charAt(0).toUpperCase() + selectedLr.driverStatus.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Punchlist Status</label>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLrStatusColor(selectedLr.punchlistStatus)}`}>
                              {selectedLr.punchlistStatus ? selectedLr.punchlistStatus.charAt(0).toUpperCase() + selectedLr.punchlistStatus.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <label className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Punchlist Type</label>
                        <p className="font-medium text-slate-800 text-sm mt-1">{selectedLr.punchlistType || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Ready Status */}
                    <div className="space-y-6">
                      <h4 className="text-slate-600 font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Ready Status
                      </h4>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-600 font-semibold text-xs uppercase tracking-wide">Status</p>
                            <p className="text-slate-800 font-medium text-sm mt-1">
                              {selectedLr.ready ? 'Ready for Processing' : 'Currently Processing'}
                            </p>
                          </div>
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                            selectedLr.ready
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {selectedLr.ready ? 'Ready' : 'Processing'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Line Items in this LR */}
                    <div className="space-y-6">
                      <h4 className="text-slate-600 font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Line Items in this LR
                      </h4>

                      {selectedLr.local?.lrLines && selectedLr.local.lrLines.length > 0 ? (
                        <>
                          {/* Stats Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-slate-600 font-medium">Total Items</p>
                                  <p className="text-2xl font-bold text-blue-700 mt-1">
                                    {selectedLr.local.lrLines.length}
                                  </p>
                                </div>
                                <Package className="w-8 h-8 text-blue-600 opacity-50" />
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-slate-600 font-medium">Total Quantity</p>
                                  <p className="text-2xl font-bold text-green-700 mt-1">
                                    {selectedLr.local.lrLines.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
                                  </p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-slate-600 font-medium">Full Loads</p>
                                  <p className="text-2xl font-bold text-purple-700 mt-1">
                                    {selectedLr.local.lrLines.filter(item => item.status === 'full').length}
                                  </p>
                                </div>
                                <Truck className="w-8 h-8 text-purple-600 opacity-50" />
                              </div>
                            </div>
                          </div>

                          {/* Line Items Table */}
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                  <tr>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wide">#</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wide">Item Name</th>
                                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wide">Quantity</th>
                                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wide">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wide">Line ID</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {selectedLr.local.lrLines.map((item, index) => (
                                    <motion.tr
                                      key={index}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="hover:bg-slate-50 transition-colors"
                                    >
                                      <td className="py-3 px-4">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                          {index + 1}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <Package className="w-4 h-4 text-slate-400" />
                                          <span className="font-semibold text-slate-800">{item.subContent}</span>
                                        </div>
                                        {item.subContentId && (
                                          <p className="text-xs text-slate-500 mt-1 ml-6">ID: {item.subContentId}</p>
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <span className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-100 rounded-full">
                                          <span className="font-bold text-slate-800">{item.quantity}</span>
                                          <span className="text-xs text-slate-600 ml-1">units</span>
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                                          item.status === 'full' ? 'bg-green-100 text-green-800 border border-green-300' :
                                          item.status === 'partial' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                          'bg-slate-100 text-slate-800 border border-slate-300'
                                        }`}>
                                          {item.status === 'full' ? '✓ Full' :
                                           item.status === 'partial' ? '⏳ Partial' : '○ Empty'}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <span className="text-sm text-slate-600 font-mono">{item.prelrLineItnernalId}</span>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-slate-50 rounded-lg p-8 text-center border-2 border-dashed border-slate-300">
                          <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-slate-600 font-medium">No line items mapped to this LR</p>
                          <p className="text-slate-500 text-sm mt-2">
                            Line items will appear here once the LR-Line mapping is applied
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default OrdersTable
