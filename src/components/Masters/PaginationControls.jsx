import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  hasNext, 
  hasPrev,
  position = 'bottom', // 'top' or 'bottom'
  compact = false
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  // Different styles for top vs bottom position
  const containerClass = position === 'top'
    ? "bg-slate-50 rounded-md p-1.5 border border-slate-200 mb-1"
    : "bg-white rounded-lg p-4 border border-slate-200 shadow-sm"

  const infoClass = compact 
    ? "text-xs text-slate-500"
    : "text-sm text-slate-600"

  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, y: position === 'top' ? -10 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Items Info */}
        <div className={infoClass}>
          {compact ? (
            <>
              <span className="font-medium text-slate-700">{startItem}-{endItem}</span> of{' '}
              <span className="font-medium text-slate-700">{totalItems}</span>
            </>
          ) : (
            <>
              Showing <span className="font-medium text-slate-800">{startItem}</span> to{' '}
              <span className="font-medium text-slate-800">{endItem}</span> of{' '}
              <span className="font-medium text-slate-800">{totalItems}</span> results
            </>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className={`flex items-center gap-1 ${compact ? 'px-1.5 py-0.5' : 'px-3 py-2'} rounded-md ${compact ? 'text-xs' : 'text-sm'} font-medium transition-all ${
            hasPrev
              ? 'bg-white hover:bg-orange-50 text-slate-700 border border-slate-200 hover:border-orange-300'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          whileHover={hasPrev ? { scale: 1.05 } : {}}
          whileTap={hasPrev ? { scale: 0.95 } : {}}
        >
          <ChevronLeft className={compact ? "w-3 h-3" : "w-4 h-4"} />
          {!compact && "Previous"}
        </motion.button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <div className={`${compact ? 'px-1 py-1' : 'px-2 py-2'} text-slate-400`}>
                    <MoreHorizontal className={compact ? "w-3 h-3" : "w-4 h-4"} />
                  </div>
                ) : (
                  <motion.button
                    onClick={() => onPageChange(page)}
                    className={`${compact ? 'w-5 h-5' : 'px-3 py-2'} rounded-md ${compact ? 'text-xs' : 'text-sm'} font-medium transition-all ${
                      page === currentPage
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white hover:bg-orange-50 text-slate-700 border border-slate-200 hover:border-orange-300'
                    }`}
                    whileHover={page !== currentPage ? { scale: 1.05 } : {}}
                    whileTap={page !== currentPage ? { scale: 0.95 } : {}}
                  >
                    {page}
                  </motion.button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`flex items-center gap-1 ${compact ? 'px-1.5 py-0.5' : 'px-3 py-2'} rounded-md ${compact ? 'text-xs' : 'text-sm'} font-medium transition-all ${
            hasNext
              ? 'bg-white hover:bg-orange-50 text-slate-700 border border-slate-200 hover:border-orange-300'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          whileHover={hasNext ? { scale: 1.05 } : {}}
          whileTap={hasNext ? { scale: 0.95 } : {}}
        >
          {!compact && "Next"}
          <ChevronRight className={compact ? "w-3 h-3" : "w-4 h-4"} />
        </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default PaginationControls
