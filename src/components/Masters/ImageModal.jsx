import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ExternalLink, AlertCircle } from 'lucide-react'

const ImageModal = ({ isOpen, onClose, imageUrl, driverName, licenseNumber }) => {
  if (!isOpen) return null

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `license-${licenseNumber || 'document'}.jpg`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleOpenInNewTab = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  License Document
                </h3>
                <p className="text-sm text-slate-600">
                  {driverName} • License: {licenseNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {imageUrl ? (
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt={`License document for ${driverName}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div
                    className="hidden flex-col items-center justify-center p-8 text-center"
                    style={{ display: 'none' }}
                  >
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">
                      Image Failed to Load
                    </h4>
                    <p className="text-slate-600 mb-4">
                      The license document image could not be loaded. This might be due to:
                    </p>
                    <ul className="text-sm text-slate-500 text-left space-y-1">
                      <li>• Network connectivity issues</li>
                      <li>• Invalid or expired image URL</li>
                      <li>• Server-side restrictions</li>
                    </ul>
                    <button
                      onClick={handleOpenInNewTab}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Try Opening in New Tab
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">
                    No Image Available
                  </h4>
                  <p className="text-slate-600">
                    No license document image is available for this driver.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>
                  <span className="font-medium">Driver:</span> {driverName}
                </div>
                <div>
                  <span className="font-medium">License:</span> {licenseNumber}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ImageModal
