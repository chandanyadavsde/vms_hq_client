import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, Clock, Eye, Download } from 'lucide-react';
import {
  getAllDocumentStatuses,
  getDocumentSummary,
  sortDocumentsByUrgency,
  formatExpiryDate
} from '../../../utils/documentExpiryUtils';

/**
 * DocumentStatusDashboard Component
 * Displays document status overview with expiry alerts
 */
const DocumentStatusDashboard = ({ vehicle }) => {
  // Get all document statuses
  const documentStatuses = getAllDocumentStatuses(vehicle);
  const summary = getDocumentSummary(documentStatuses);
  const sortedDocs = sortDocumentsByUrgency(documentStatuses);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-5 border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
      {/* Header with Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </span>
          <h3 className="text-lg font-bold text-blue-900">Document Status</h3>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2">
          {summary.needsAttention > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              {summary.needsAttention} Need Attention
            </span>
          )}
          {summary.valid > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              {summary.valid} Valid
            </span>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      {summary.needsAttention > 0 && (
        <motion.div
          className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg shadow-sm"
          animate={{
            boxShadow: summary.expired > 0 || summary.critical > 0
              ? ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 0 8px rgba(239, 68, 68, 0.1)', '0 0 0 0 rgba(239, 68, 68, 0)']
              : undefined
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="flex items-start gap-2">
            <motion.div
              animate={{
                rotate: summary.expired > 0 || summary.critical > 0 ? [0, -10, 10, -10, 0] : 0
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            </motion.div>
            <div className="flex-1">
              <p className="text-base font-semibold text-red-800">Action Required</p>
              <p className="text-sm text-red-700 mt-1">
                {summary.expired > 0 && `${summary.expired} document${summary.expired > 1 ? 's' : ''} expired. `}
                {summary.critical > 0 && `${summary.critical} expiring within 7 days. `}
                {summary.warning > 0 && `${summary.warning} expiring within 30 days.`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Document Cards */}
      <div className="space-y-2">
        {sortedDocs.map((doc, index) => (
          <motion.div
            key={doc.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg border-2 ${doc.statusConfig.borderColor} ${doc.statusConfig.bgColor}`}
          >
            <div className="flex items-start justify-between">
              {/* Left: Document Info */}
              <div className="flex items-start gap-2 flex-1">
                <span className="text-2xl">{doc.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${doc.statusConfig.textColor}`}>
                      {doc.label}
                    </h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${doc.statusConfig.badgeClass} text-white`}>
                      {doc.statusConfig.icon} {doc.statusConfig.label}
                    </span>
                  </div>

                  {/* Expiry Info */}
                  <div className="mt-1 space-y-0.5">
                    {doc.endDate && (
                      <div className="flex items-center gap-1 text-xs text-slate-700">
                        <Clock className="w-3 h-3" />
                        <span>
                          Valid until: <span className="font-semibold">{doc.formattedDate}</span>
                        </span>
                      </div>
                    )}

                    {/* Days Remaining Message */}
                    {doc.daysRemaining !== null && (
                      <p className={`text-xs font-medium ${doc.statusConfig.textColor}`}>
                        {doc.message}
                      </p>
                    )}

                    {!doc.endDate && (
                      <p className="text-xs text-gray-600">No expiry date available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-1 ml-2">
                {vehicle.rawData?.[`custrecord_${doc.type}_doc_attach`]?.length > 0 && (
                  <button
                    onClick={() => {
                      const attachments = vehicle.rawData?.[`custrecord_${doc.type}_doc_attach`];
                      if (attachments && attachments[0]?.url) {
                        window.open(attachments[0].url, '_blank');
                      }
                    }}
                    className="p-1.5 hover:bg-white rounded transition-colors"
                    title="View document"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar for Valid Documents */}
            {doc.status === 'valid' && doc.daysRemaining !== null && doc.daysRemaining <= 365 && (
              <div className="mt-2">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{
                      width: `${Math.max(10, Math.min(100, (doc.daysRemaining / 365) * 100))}%`
                    }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {doc.daysRemaining} days remaining
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Overall Status Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">
            Total Documents: <span className="font-semibold text-slate-800">{summary.total}</span>
          </span>
          <div className="flex items-center gap-3">
            {summary.expired > 0 && (
              <span className="text-red-700 font-semibold">
                {summary.expired} Expired
              </span>
            )}
            {summary.critical > 0 && (
              <span className="text-red-700 font-semibold">
                {summary.critical} Critical
              </span>
            )}
            {summary.warning > 0 && (
              <span className="text-orange-700 font-semibold">
                {summary.warning} Warning
              </span>
            )}
            {summary.valid > 0 && (
              <span className="text-green-700 font-semibold">
                {summary.valid} Valid
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentStatusDashboard;