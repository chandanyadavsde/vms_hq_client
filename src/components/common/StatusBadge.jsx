import React from 'react'

const StatusBadge = ({ 
  status, 
  text, 
  size = "sm",
  showIcon = false,
  icon: Icon = null 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'success':
        return 'text-emerald-400 bg-emerald-500/20'
      case 'in-progress':
      case 'pending':
        return 'text-amber-400 bg-amber-500/20'
      case 'error':
      case 'rejected':
      case 'failed':
        return 'text-red-400 bg-red-500/20'
      case 'not-started':
      case 'waiting':
        return 'text-slate-400 bg-slate-500/20'
      default:
        return 'text-cyan-400 bg-cyan-500/20'
    }
  }

  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs'
      case 'sm':
        return 'px-3 py-1 text-sm'
      case 'md':
        return 'px-4 py-2 text-base'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-3 py-1 text-sm'
    }
  }

  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-medium ${getStatusColor(status)} ${getSizeClasses(size)}`}>
      {showIcon && Icon && <Icon className="w-4 h-4" />}
      {text}
    </span>
  )
}

export default StatusBadge 