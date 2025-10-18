import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LegalModal = ({ isOpen, onClose, type }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && type) {
      fetchLegalData()
    }
  }, [isOpen, type])

  const fetchLegalData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const endpoint = type === 'privacy' 
        ? 'http://localhost:5000/legal/privacy-policy'
        : 'http://localhost:5000/legal/terms-of-service'
      
      const response = await fetch(endpoint)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError('Failed to load content')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderContent = (content) => {
    if (!content) return null

    const renderSection = (section, key) => {
      if (!section) return null

      return (
        <div key={key} className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            {section.title}
          </h3>
          
          {section.description && (
            <p className="text-gray-700 mb-4 leading-relaxed">{section.description}</p>
          )}
          
          {section.purposes && (
            <ul className="space-y-2 mb-4">
              {section.purposes.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          
          {section.circumstances && (
            <ul className="space-y-2 mb-4">
              {section.circumstances.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          
          {section.restrictions && (
            <ul className="space-y-2 mb-4">
              {section.restrictions.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          
          {section.responsibilities && (
            <ul className="space-y-2 mb-4">
              {section.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          
          {section.services && (
            <ul className="space-y-2 mb-4">
              {section.services.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          
          {section.rights && (
            <ul className="space-y-2 mb-4">
              {section.rights.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          
          {section.personalInformation && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h4>
              <ul className="space-y-2 mb-4">
                {section.personalInformation.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {section.usageInformation && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Usage Information</h4>
              <ul className="space-y-2 mb-4">
                {section.usageInformation.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {section.contact && (
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Contact Information</h4>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{section.contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{section.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{section.contact.address}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Introduction */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed text-lg">{content.introduction}</p>
        </div>

        {/* Render all sections */}
        {Object.entries(content).map(([key, section]) => {
          if (key === 'introduction') return null
          return renderSection(section, key)
        })}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <motion.div
          className="relative bg-white/95 backdrop-blur-sm rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-orange-200/30 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Enhanced Multi-Layer Texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-green-50/30"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 via-transparent to-purple-50/20"></div>
          
          {/* Subtle Animated Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-green-400 to-blue-400 opacity-60 animate-pulse"></div>
          
          {/* Glass Effect Border */}
          <div className="absolute inset-0 rounded-3xl border border-orange-200/40 shadow-inner"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-8 pb-6 border-b border-orange-200/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {data?.title || (type === 'privacy' ? 'Privacy Policy' : 'Terms of Service')}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {data?.company} • Last updated: {data?.lastUpdated}
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-orange-200/40 hover:bg-white hover:shadow-lg transition-all shadow-sm hover:scale-105 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Area */}
            <div 
              className="flex-1 overflow-y-auto p-8 pt-6 min-h-0" 
              style={{ 
                maxHeight: 'calc(90vh - 120px)',
                scrollbarWidth: 'thin',
                scrollbarColor: '#f97316 #fed7aa'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Content</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchLegalData}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  {renderContent(data?.content)}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LegalModal 