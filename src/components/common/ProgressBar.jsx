import React from 'react'
import { motion } from 'framer-motion'

const ProgressBar = ({ 
  progress, 
  height = "h-2",
  showLabel = true,
  labelPosition = "top", // "top", "bottom", "inside"
  className = "",
  animated = true
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  
  const progressBar = (
    <div className={`w-full bg-white/10 rounded-full ${height} overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
        initial={animated ? { width: 0 } : {}}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ duration: animated ? 0.8 : 0, ease: "easeOut" }}
      />
    </div>
  )

  if (!showLabel) return progressBar

  if (labelPosition === "inside") {
    return (
      <div className="relative">
        {progressBar}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-medium">{Math.round(clampedProgress)}%</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {labelPosition === "top" && (
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Progress</span>
          <span className="text-white text-sm font-medium">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      {progressBar}
      {labelPosition === "bottom" && (
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Progress</span>
          <span className="text-white text-sm font-medium">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar 