import React from 'react'
import { motion } from 'framer-motion'

const BaseCard = ({ 
  children, 
  className = "", 
  onClick, 
  isHoverable = true,
      gradient = "from-teal-900 via-teal-800 to-teal-900",
  ...props 
}) => {
  return (
    <motion.div
      className={`relative bg-gradient-to-br ${gradient} rounded-3xl p-6 cursor-pointer overflow-hidden ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)'
      }}
      whileHover={isHoverable ? { scale: 1.02, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default BaseCard 