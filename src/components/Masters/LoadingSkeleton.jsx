import React from 'react'
import { motion } from 'framer-motion'

const LoadingSkeleton = ({ viewMode = 'vehicle' }) => {
  const skeletonRows = Array.from({ length: 8 }, (_, index) => index)

  return (
    <div className="space-y-2">
      {skeletonRows.map((index) => (
        <motion.div
          key={index}
          className="bg-white rounded-xl p-3 shadow-sm border border-slate-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="grid grid-cols-12 gap-3 items-center">
            {viewMode === 'vehicle' ? (
              // Vehicle skeleton
              <>
                {/* Vehicle */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 w-16 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Driver */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-200 animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 w-12 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Mobile */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-slate-200 animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-28 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 w-16 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                </div>

                {/* Plant */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Vendor */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Arrived */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Created */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-14 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Other */}
                <div className="col-span-1 flex justify-center">
                  <div className="w-6 h-6 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
              </>
            ) : (
              // Driver skeleton
              <>
                {/* Name */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 w-12 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-slate-200 animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-28 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 w-16 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* License */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-slate-200 animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 w-14 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Expire Date */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 w-12 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Attached */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-2 w-12 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Created */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-14 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Image */}
                <div className="col-span-1 flex justify-center">
                  <div className="w-6 h-6 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
