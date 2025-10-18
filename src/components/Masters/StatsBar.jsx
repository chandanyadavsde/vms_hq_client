import React from 'react'
import { motion } from 'framer-motion'
import { Car, CheckCircle, XCircle, Clock, TrendingUp, MapPin } from 'lucide-react'

const StatsBar = ({ vehicles = [] }) => {
  // Calculate statistics
  const stats = {
    total: vehicles.length,
    approved: vehicles.filter(v => v.approvalStatus === 'approved').length,
    pending: vehicles.filter(v => v.approvalStatus === 'pending').length,
    rejected: vehicles.filter(v => v.approvalStatus === 'rejected').length,
    withDriver: vehicles.filter(v => v.hasDriver).length,
    available: vehicles.filter(v => v.operationalStatus === 'available').length
  }

  const statCards = [
    {
      id: 'total',
      label: 'Total Vehicles',
      value: stats.total,
      icon: Car,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500'
    },
    {
      id: 'approved',
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'bg-green-500',
      lightBg: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
      percentage: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
    },
    {
      id: 'pending',
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-500',
      percentage: stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0
    },
    {
      id: 'rejected',
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'bg-red-500',
      lightBg: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
      percentage: stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0
    },
    {
      id: 'withDriver',
      label: 'With Driver',
      value: stats.withDriver,
      icon: TrendingUp,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-500',
      percentage: stats.total > 0 ? Math.round((stats.withDriver / stats.total) * 100) : 0
    },
    {
      id: 'available',
      label: 'Available',
      value: stats.available,
      icon: MapPin,
      color: 'bg-teal-500',
      lightBg: 'bg-teal-50',
      textColor: 'text-teal-700',
      iconColor: 'text-teal-500',
      percentage: stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0
    }
  ]

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.id}
              className={`${stat.lightBg} rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 ${stat.lightBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                {stat.percentage !== undefined && (
                  <span className={`text-xs font-bold ${stat.textColor}`}>
                    {stat.percentage}%
                  </span>
                )}
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs font-medium text-slate-600">
                {stat.label}
              </div>
              {stat.percentage !== undefined && (
                <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                  <motion.div
                    className={`${stat.color} h-1.5 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default StatsBar