import React from 'react'
import { motion } from 'framer-motion'

const ActionButton = ({ 
  children, 
  onClick, 
  variant = "primary", // "primary", "secondary", "success", "danger", "warning"
  size = "md", // "sm", "md", "lg"
  disabled = false,
  icon: Icon = null,
  iconPosition = "left", // "left", "right"
  className = "",
  ...props 
}) => {
  const getVariantClasses = (variant) => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
      case 'secondary':
        return 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
      default:
        return 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
    }
  }

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm rounded-lg'
      case 'md':
        return 'px-4 py-2 text-base rounded-xl'
      case 'lg':
        return 'px-6 py-3 text-lg rounded-xl'
      default:
        return 'px-4 py-2 text-base rounded-xl'
    }
  }

  const iconClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <motion.button
      className={`font-semibold transition-all shadow-lg ${getVariantClasses(variant)} ${getSizeClasses(size)} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {Icon && iconPosition === 'left' && <Icon className={iconClasses} />}
        {children}
        {Icon && iconPosition === 'right' && <Icon className={iconClasses} />}
      </div>
    </motion.button>
  )
}

export default ActionButton 