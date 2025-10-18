import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Building2, Package, Wind, MapPin, Map, Eye, ChevronDown, ChevronRight,
  Calendar, Truck, TrendingUp, CheckCircle, AlertCircle, Clock
} from 'lucide-react'
import PreLrService from '../../services/PreLrService.js'

const PreLrCard = ({ preLr, onViewDetails, onLrClick, expanded, onToggleExpand }) => {
  const getStatusColor = (status) => PreLrService.getStatusColor(status)
  const getLrStatusColor = (status) => PreLrService.getLrStatusColor(status)

  // Calculate progress percentage
  const progressPercentage = preLr.progress || 0

  // Get progress color
  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500'
    if (percentage >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }
console.log(preLr,)
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-slate-200 hover:border-orange-300 transition-all duration-300 overflow-hidden group min-w-[320px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between mb-3">
          {/* PRE-LR ID & Icon */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg group-hover:from-orange-200 group-hover:to-orange-300 transition-all">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <button
                onClick={() => onViewDetails(preLr)}
                className="font-bold text-slate-800 text-sm hover:text-orange-600 hover:underline transition-colors"
              >
                {preLr.id}
              </button>
              <p className="text-xs text-slate-500 mt-0.5">PRE-LR Number</p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(preLr.status)}`}>
            {preLr.status.charAt(0).toUpperCase() + preLr.status.slice(1)}
          </span>
        </div>

        {/* Consignor/Consignee - Vertical Stack to Prevent Overlap */}
        <div className="space-y-2.5">
          {/* Consignor */}
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">Consignor</p>
              <p className="text-sm font-medium text-slate-800 truncate" title={preLr.consignor}>
                {preLr.consignor}
              </p>
            </div>
          </div>

          {/* Consignee */}
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">Consignee</p>
              <p className="text-sm font-medium text-slate-800 truncate" title={preLr.consignee}>
                {preLr.consignee || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body - Key Info Grid - Responsive */}
      <div className="p-4 bg-slate-50">
        <div className="grid grid-cols-3 gap-3">
          {/* LR Count */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
              <Package className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">LR Count</p>
              <p className="text-sm font-bold text-blue-800 truncate">{preLr.lrCount} LRs</p>
            </div>
          </div>

          {/* WTG Number */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-purple-100 rounded-lg flex-shrink-0">
              <Wind className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">WTG</p>
              <p className="text-sm font-bold text-purple-800 truncate" title={preLr.wtgNumber}>{preLr.wtgNumber}</p>
            </div>
          </div>


          {/* Created Date */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-orange-100 rounded-lg flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm font-bold text-orange-800 truncate" title={preLr.createdDate}>{preLr.createdDate}</p>
            </div>
          </div>
        </div>

        {/* Location Details - Fixed Truncation */}
        <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate" title={preLr.district}>{preLr.district}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Map className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate" title={preLr.state}>{preLr.state}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate" title={preLr.fromLocation}>
              {preLr.fromLocation}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="px-4 py-3 bg-white border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Progress</span>
          </div>
          <span className="text-xs font-bold text-slate-800">{progressPercentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full ${getProgressColor(progressPercentage)} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {progressPercentage >= 75 ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : progressPercentage >= 25 ? (
              <Clock className="w-3 h-3 text-yellow-500" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-500" />
            )}
            <span className="text-xs text-slate-600">
              {progressPercentage >= 75 ? 'On Track' : progressPercentage >= 25 ? 'In Progress' : 'Needs Attention'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {preLr.associatedLrs.filter(lr => lr.status === 'completed').length}/{preLr.lrCount} Completed
          </span>
        </div>
      </div>

      {/* Card Footer - Actions */}
      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2">
          {/* View Details Button */}
          <button
            onClick={() => onViewDetails(preLr)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 hover:border-orange-300 transition-all text-xs font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </button>

          {/* Expand LRs Button */}
          <button
            onClick={() => onToggleExpand(preLr.id)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-xs font-medium"
          >
            {expanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Hide LRs
              </>
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                View {preLr.lrCount} LRs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded LRs Section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-orange-200 bg-orange-50"
          >
            <div className="p-4">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                Associated LRs ({preLr.associatedLrs.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preLr.associatedLrs.map((lr) => (
                  <motion.div
                    key={lr.id}
                    className="bg-white border border-orange-200 rounded-lg p-3 hover:shadow-md hover:border-orange-400 transition-all cursor-pointer"
                    onClick={() => onLrClick(lr)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                      <h5 className="font-semibold text-slate-800 text-sm truncate flex-1" title={lr.lrName}>{lr.lrName}</h5>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${getLrStatusColor(lr.status)}`}>
                        {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 min-w-0">
                        <Truck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-medium truncate" title={lr.vehicleNo || 'N/A'}>{lr.vehicleNo || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 min-w-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-medium truncate" title={lr.lrDate || 'N/A'}>{lr.lrDate || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-xs text-orange-600 font-medium hover:underline">
                        Click to view details →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PreLrCard
