import React from 'react'
import { motion } from 'framer-motion'
import { Search, CheckCircle, AlertCircle, Car, User, Phone, MapPin, Building2, Calendar, UserCheck } from 'lucide-react'

const SearchResult = ({ result, onClose, viewMode, onVehicleClick, onDriverAction, onContactAction }) => {
  if (!result) return null

  const { vehicle, isSearchResult } = result

  return (
    <motion.div
      className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 mb-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-200 flex items-center justify-center">
            <Search className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-orange-800">Search Result</h3>
            <p className="text-xs text-orange-600">Found 1 matching vehicle</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-orange-200 rounded-lg transition-colors"
        >
          <AlertCircle className="w-4 h-4 text-orange-600" />
        </button>
      </div>

      <div className="bg-white rounded-lg p-3 border border-orange-200">
        <div className="grid grid-cols-12 gap-3 items-center">
          {viewMode === 'vehicle' ? (
            // Vehicle search result
            <>
              {/* Vehicle */}
              <div className="col-span-2">
                <button 
                  onClick={() => onVehicleClick(vehicle)}
                  className="flex items-center gap-2 text-left w-full hover:bg-orange-50 p-1.5 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Car className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-xs">{vehicle.vehicleNumber}</div>
                    <div className="text-xs text-slate-500">Vehicle ID</div>
                  </div>
                </button>
              </div>

              {/* Driver */}
              <div className="col-span-2">
                <button 
                  onClick={() => onDriverAction(vehicle)}
                  className="flex items-center gap-2 w-full hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-xs">{vehicle.driverName}</div>
                    <div className="text-xs text-slate-500">Driver</div>
                  </div>
                </button>
              </div>

              {/* Mobile */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center">
                    <Phone className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-xs">{vehicle.mobileNumber}</div>
                    <div className="text-xs text-slate-500">Contact</div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border-green-200">
                  {vehicle.status}
                </span>
              </div>

              {/* Plant */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-700 text-xs font-medium">{vehicle.currentPlant}</span>
                </div>
              </div>

              {/* Vendor */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-700 text-xs font-medium">{vehicle.vendorName}</span>
                </div>
              </div>

              {/* Arrived */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-700 text-xs font-medium">{vehicle.arrivedAtPlant}</span>
                </div>
              </div>

              {/* Created */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-700 text-xs font-medium">{vehicle.createdBy}</span>
                </div>
              </div>

              {/* Other */}
              <div className="col-span-1 flex justify-center">
                <button 
                  onClick={() => onContactAction(vehicle)}
                  className="p-1.5 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                  title="Manage Contacts"
                >
                  <User className="w-3 h-3 text-orange-600" />
                </button>
              </div>
            </>
          ) : (
            // Driver search result (if needed)
            <div className="col-span-12 text-center py-4">
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <User className="w-4 h-4" />
                <span className="text-sm">Driver search results will be displayed here</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-orange-700">
        <CheckCircle className="w-3 h-3" />
        <span>Click on vehicle details to view more information</span>
      </div>
    </motion.div>
  )
}

export default SearchResult
