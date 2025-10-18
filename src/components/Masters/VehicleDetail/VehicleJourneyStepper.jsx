import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, FileText } from 'lucide-react';
import {
  STATUS_ORDER,
  getStatusConfig,
  isStatusCompleted,
  isStatusCurrent,
  isStatusPending,
  formatDateTime,
  formatTime,
  calculateDuration
} from '../../../utils/vehicleStatusUtils';

/**
 * VehicleJourneyStepper Component - COMPACT VERSION with History
 * Displays the vehicle's journey through operational stages with actual timestamps
 */
const VehicleJourneyStepper = ({ vehicle }) => {
  const currentStatus = vehicle?.operationalStatus || 'available';
  const statusMeta = vehicle?.statusMeta || {};
  const statusHistory = vehicle?.statusHistory || [];

  /**
   * Get timestamp for a specific status from history or current
   */
  const getStatusTimestamp = (status) => {
    // If it's the current status, use statusMeta
    if (status === currentStatus) {
      return statusMeta.statusChangedAt;
    }

    // Otherwise, look in history
    const historyEntry = statusHistory.find(h => h.operationalStatus === status);
    return historyEntry?.statusChangedAt;
  };

  /**
   * Get complete status data (from history or current)
   */
  const getStatusData = (status) => {
    if (status === currentStatus) {
      return {
        ...statusMeta,
        operationalStatus: currentStatus
      };
    }
    return statusHistory.find(h => h.operationalStatus === status);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-sm">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </span>
          Vehicle Journey
        </h3>
        <span className="text-xs text-slate-600">
          {getStatusConfig(currentStatus).label}
        </span>
      </div>

      {/* Compact Stepper */}
      <div className="relative">
        {/* Progress Line (Background) */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" style={{ marginLeft: '1.5rem', marginRight: '1.5rem' }} />

        {/* Progress Line (Filled) */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-1000"
          style={{
            marginLeft: '1.5rem',
            width: `calc(${((STATUS_ORDER.indexOf(currentStatus) + 1) / STATUS_ORDER.length) * 100}% - 3rem)`
          }}
        />

        {/* Compact Status Steps */}
        <div className="relative flex justify-between items-start">
          {STATUS_ORDER.map((status, index) => {
            const config = getStatusConfig(status);
            const completed = isStatusCompleted(status, currentStatus);
            const current = isStatusCurrent(status, currentStatus);
            const pending = isStatusPending(status, currentStatus);
            const timestamp = getStatusTimestamp(status);

            return (
              <motion.div
                key={status}
                className="flex flex-col items-center flex-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Compact Status Circle */}
                <motion.div
                  className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    completed
                      ? 'bg-green-500 border-green-600 shadow-md'
                      : current
                      ? `${config.bgColor} ${config.borderColor} shadow-lg ring-2 ${config.ringColor} ring-opacity-50`
                      : 'bg-white border-slate-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {completed && (
                    <span className="text-lg text-white font-bold">✓</span>
                  )}
                  {current && (
                    <span className="text-xl">{config.icon}</span>
                  )}
                  {pending && (
                    <span className="text-lg text-slate-400">{config.icon}</span>
                  )}
                </motion.div>

                {/* Compact Status Label */}
                <div className="mt-2 text-center">
                  <p className={`text-xs font-semibold ${
                    completed
                      ? 'text-green-700'
                      : current
                      ? config.textColor
                      : 'text-slate-400'
                  }`}>
                    {config.label}
                  </p>

                  {/* Timestamp */}
                  {timestamp && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formatTime(timestamp)}
                    </p>
                  )}

                  {!timestamp && pending && (
                    <p className="text-xs text-slate-400 mt-0.5">Pending</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Compact Current Status Info - Inline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mt-4 p-3 rounded-lg ${getStatusConfig(currentStatus).bgColor} border ${getStatusConfig(currentStatus).borderColor}`}
      >
        <div className="flex items-start gap-3">
          {/* Left: Status Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{getStatusConfig(currentStatus).icon}</span>
              <h4 className={`text-sm font-bold ${getStatusConfig(currentStatus).textColor}`}>
                {getStatusConfig(currentStatus).label}
              </h4>
              {statusMeta.statusChangedAt && (
                <span className="text-xs text-slate-600">
                  • {calculateDuration(statusMeta.statusChangedAt)}
                </span>
              )}
            </div>

            {/* Inline Details */}
            <div className="text-xs text-slate-700 space-y-1">
              {statusMeta.statusChangedAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{formatDateTime(statusMeta.statusChangedAt)}</span>
                </div>
              )}

              {statusMeta.statusChangedBy && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>{statusMeta.statusChangedBy}</span>
                </div>
              )}

              {statusMeta.plant && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span className="capitalize">{statusMeta.plant} Plant</span>
                </div>
              )}

              {statusMeta.notes && (
                <div className="flex items-start gap-1 mt-1">
                  <FileText className="w-3 h-3 text-slate-500 mt-0.5" />
                  <span className="text-slate-700">{statusMeta.notes}</span>
                </div>
              )}
            </div>

            {/* ETA vs ATA - Compact */}
            {(currentStatus === 'inbound' || currentStatus === 'at gate') && (statusMeta.eta || statusMeta.ata) && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                {statusMeta.eta && (
                  <div>
                    <span className="text-slate-600">ETA: </span>
                    <span className="font-semibold text-slate-800">{formatTime(statusMeta.eta)}</span>
                  </div>
                )}
                {statusMeta.ata && (
                  <div>
                    <span className="text-slate-600">ATA: </span>
                    <span className="font-semibold text-slate-800">{formatTime(statusMeta.ata)}</span>
                    {statusMeta.eta && (
                      <span className={`ml-1 ${
                        new Date(statusMeta.ata) <= new Date(statusMeta.eta) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {new Date(statusMeta.ata) <= new Date(statusMeta.eta) ? '✓' : '⚠'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Status Image Thumbnail */}
          {statusMeta.statusImage?.url && (
            <div className="flex-shrink-0">
              <img
                src={statusMeta.statusImage.url}
                alt="Status"
                className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(statusMeta.statusImage.url, '_blank')}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Show History Count */}
      {statusHistory.length > 0 && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          {statusHistory.length} stage{statusHistory.length !== 1 ? 's' : ''} completed in journey
        </div>
      )}
    </div>
  );
};

export default VehicleJourneyStepper;