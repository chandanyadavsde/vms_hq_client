import React from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, User, RefreshCw, Database, History, Info, UserCheck
} from 'lucide-react'

/**
 * SystemInfoSection Component
 * Displays audit trail, system information, and recent activity
 */
const SystemInfoSection = ({ vehicle }) => {
  // Calculate time ago
  const getTimeAgo = (date) => {
    if (!date) return 'N/A'

    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatDate(date)
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate vehicle age from RC start date or creation date
  const calculateVehicleAge = () => {
    const rcStartDate = vehicle.rawData?.custrecord_rc_start_date || vehicle.custrecord_datecreate_vehicle_master
    if (!rcStartDate) return 'N/A'

    const startDate = new Date(rcStartDate)
    const now = new Date()
    const ageYears = now.getFullYear() - startDate.getFullYear()
    const ageMonths = now.getMonth() - startDate.getMonth()

    if (ageYears === 0) {
      return `${ageMonths + (ageMonths === 0 ? 1 : 0)} month${ageMonths > 0 ? 's' : ''}`
    }

    if (ageMonths < 0) {
      return `${ageYears - 1} year${ageYears - 1 > 1 ? 's' : ''}, ${12 + ageMonths} months`
    }

    return ageMonths === 0
      ? `${ageYears} year${ageYears > 1 ? 's' : ''}`
      : `${ageYears} year${ageYears > 1 ? 's' : ''}, ${ageMonths} month${ageMonths > 1 ? 's' : ''}`
  }

  // Get recent activity
  const getRecentActivity = () => {
    const activities = []

    const statusMeta = vehicle.rawData?.statusMeta || vehicle.statusMeta
    const approvalMeta = vehicle.rawData?.approvalMeta || vehicle.approvalMeta
    const operationalStatus = vehicle.rawData?.operationalStatus || vehicle.operationalStatus
    const updatedAt = vehicle.rawData?.updatedAt || vehicle.updatedAt
    const approvedByHq = vehicle.rawData?.approved_by_hq || vehicle.approved_by_hq

    // Status change
    if (statusMeta?.statusChangedAt) {
      activities.push({
        type: 'status',
        icon: RefreshCw,
        title: 'Status Updated',
        description: `Changed to "${operationalStatus || 'Unknown'}"`,
        timestamp: statusMeta.statusChangedAt,
        user: statusMeta.statusChangedBy || 'System'
      })
    }

    // Approval action
    if (approvalMeta?.reviewedAt) {
      activities.push({
        type: 'approval',
        icon: UserCheck,
        title: 'Approval Action',
        description: approvalMeta.reviewMessage || `Vehicle ${approvedByHq}`,
        timestamp: approvalMeta.reviewedAt,
        user: approvalMeta.reviewer || 'HQ Admin'
      })
    }

    // Last update
    if (updatedAt) {
      activities.push({
        type: 'update',
        icon: Database,
        title: 'Record Updated',
        description: 'Vehicle information modified',
        timestamp: updatedAt,
        user: 'System'
      })
    }

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
  }

  const recentActivity = getRecentActivity()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-teal-50 to-slate-50 rounded-xl border-2 border-teal-300 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-5 py-4 border-b-2 border-teal-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-teal-900">System Information</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">

        {/* Creation Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Creation Details
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {/* Created By */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <User className="w-5 h-5 text-slate-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 font-medium">Created By</p>
                <p className="text-base font-semibold text-slate-800 truncate">
                  {vehicle.rawData?.custrecord_create_by || vehicle.custrecord_create_by || 'N/A'}
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 font-medium">Created On</p>
                <p className="text-base font-semibold text-slate-800">
                  {formatDate(vehicle.rawData?.custrecord_datecreate_vehicle_master || vehicle.custrecord_datecreate_vehicle_master)}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-600 font-medium">Last Updated</p>
                <p className="text-base font-semibold text-blue-900">
                  {getTimeAgo(vehicle.rawData?.updatedAt || vehicle.updatedAt)}
                </p>
                <p className="text-sm text-blue-600 mt-0.5">
                  {formatDate(vehicle.rawData?.updatedAt || vehicle.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Age */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Vehicle Age
          </h4>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-300">
                <Calendar className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Age Since Registration</p>
                <p className="text-xl font-bold text-purple-900">
                  {calculateVehicleAge()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Activity
            </h4>

            <div className="space-y-2">
              {recentActivity.map((activity, index) => {
                const ActivityIcon = activity.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center flex-shrink-0">
                      <ActivityIcon className="w-5 h-5 text-slate-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500 font-medium">
                          {activity.user}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Database Info */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Database className="w-3.5 h-3.5" />
            <span>Database ID:</span>
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-xs">
              {(vehicle.rawData?._id || vehicle._id)?.slice(-8) || 'N/A'}
            </code>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SystemInfoSection
