import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

const toastConfig = {
  success: {
    bg: 'bg-white',
    border: 'border-l-4 border-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    Icon: CheckCircle
  },
  error: {
    bg: 'bg-white',
    border: 'border-l-4 border-red-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    Icon: AlertTriangle
  },
  warning: {
    bg: 'bg-white',
    border: 'border-l-4 border-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    titleColor: 'text-orange-800',
    messageColor: 'text-orange-700',
    Icon: AlertTriangle
  },
  info: {
    bg: 'bg-white',
    border: 'border-l-4 border-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    Icon: Info
  }
}

const Toast = ({ id, type, title, message, onClose, duration }) => {
  const [progress, setProgress] = useState(100)
  const config = toastConfig[type] || toastConfig.info
  const { Icon } = config

  useEffect(() => {
    if (duration <= 0) return

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 50))
        return newProgress <= 0 ? 0 : newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`${config.bg} ${config.border} rounded-xl shadow-2xl overflow-hidden min-w-[300px] max-w-[500px]`}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-1 bg-slate-100">
          <motion.div
            className={`h-full ${config.iconBg}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>
      )}

      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${config.titleColor}`}>
            {title}
          </p>
          <p className={`text-sm mt-0.5 ${config.messageColor}`}>
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-slate-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        </button>
      </div>
    </motion.div>
  )
}

export default Toast
