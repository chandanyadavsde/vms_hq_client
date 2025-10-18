import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useToastContext } from '../../contexts/ToastContext'
import Toast from './Toast'

const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext()

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
