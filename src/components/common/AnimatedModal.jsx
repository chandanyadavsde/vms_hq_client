import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getModalAnimation } from '../../utils/modalAnimations.js'

const AnimatedModal = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon,
  preset = 'fullScreen',
  showCloseButton = true,
  className = '',
  ...props
}) => {
  if (!isOpen) return null

  const animationConfig = getModalAnimation(preset)
  const { container, backdrop, modal } = animationConfig

  return (
    <AnimatePresence>
      <motion.div
        className={container.className}
        initial={container.initial}
        animate={container.animate}
        exit={container.exit}
        transition={container.transition}
        {...props}
      >
        <motion.div
          className={backdrop.className}
          onClick={onClose}
        />

        <motion.div
          className={`relative bg-white ${animationConfig.modalClass} ${className}`}
          initial={modal.initial}
          animate={modal.animate}
          exit={modal.exit}
          transition={modal.transition}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Only show if title is provided */}
          {title && (
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="text-sm text-slate-600">{subtitle}</p>
                    )}
                  </div>
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimatedModal
