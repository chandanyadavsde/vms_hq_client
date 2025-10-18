import React from 'react';
import { motion } from 'framer-motion';
import { Award, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { calculateComplianceScore, getComplianceMessage } from '../../../utils/complianceCalculator';

/**
 * ComplianceScoreCard Component
 * Displays vehicle compliance score with detailed breakdown
 */
const ComplianceScoreCard = ({ vehicle }) => {
  const compliance = calculateComplianceScore(vehicle);
  const {
    score,
    maxScore,
    percentage,
    grade,
    gradeLabel,
    gradeColor,
    gradeBgColor,
    breakdown,
    issues,
    hasIssues
  } = compliance;

  const message = getComplianceMessage(compliance);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl p-5 border-2 border-purple-300 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Award className="w-5 h-5 text-white" />
          </span>
          <h3 className="text-lg font-bold text-purple-900">Compliance Score</h3>
        </div>
      </div>

      {/* Score Display - Large Circle */}
      <div className="mb-4">
        <div className="flex items-center justify-center mb-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`relative w-32 h-32 rounded-full ${gradeBgColor} flex flex-col items-center justify-center border-4 ${
              percentage >= 90 ? 'border-green-400' :
              percentage >= 75 ? 'border-green-300' :
              percentage >= 60 ? 'border-orange-300' :
              'border-red-300'
            }`}
          >
            {/* Percentage */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-4xl font-bold ${gradeColor}`}
            >
              {percentage}%
            </motion.div>

            {/* Grade */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1"
            >
              <span className={`text-lg font-bold ${gradeColor}`}>Grade {grade}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Grade Label */}
        <div className="text-center">
          <p className={`text-base font-semibold ${gradeColor}`}>{gradeLabel} Compliance</p>
          <p className="text-sm text-slate-600 mt-1">
            {score} / {maxScore} points
          </p>
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-lg mb-4 ${
        percentage >= 90 ? 'bg-green-50 border border-green-200' :
        percentage >= 75 ? 'bg-green-50 border border-green-200' :
        percentage >= 60 ? 'bg-orange-50 border border-orange-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <p className="text-sm font-medium text-slate-700">{message}</p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4 mb-4">
        {/* Documents Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-800">📄 Documents</h4>
            <span className="text-sm font-semibold text-slate-600">
              {breakdown.documents.score} / {breakdown.documents.max}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(breakdown.documents.score / breakdown.documents.max) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`h-full ${
                (breakdown.documents.score / breakdown.documents.max) >= 0.9 ? 'bg-green-500' :
                (breakdown.documents.score / breakdown.documents.max) >= 0.7 ? 'bg-green-400' :
                (breakdown.documents.score / breakdown.documents.max) >= 0.5 ? 'bg-orange-400' :
                'bg-red-400'
              }`}
            />
          </div>

          {/* Document Details */}
          <div className="space-y-1.5">
            {breakdown.documents.details.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span>{doc.icon}</span>
                  <span className={doc.status === 'valid' ? 'text-slate-700' : 'text-slate-500'}>
                    {doc.name}
                  </span>
                  {doc.issue && (
                    <span className="text-red-600 italic">- {doc.issue}</span>
                  )}
                </div>
                <span className={`font-semibold ${doc.status === 'valid' ? 'text-green-600' : 'text-slate-400'}`}>
                  {doc.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-800">⚙️ Operational</h4>
            <span className="text-sm font-semibold text-slate-600">
              {breakdown.operational.score} / {breakdown.operational.max}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(breakdown.operational.score / breakdown.operational.max) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className={`h-full ${
                (breakdown.operational.score / breakdown.operational.max) >= 0.9 ? 'bg-purple-500' :
                (breakdown.operational.score / breakdown.operational.max) >= 0.7 ? 'bg-purple-400' :
                (breakdown.operational.score / breakdown.operational.max) >= 0.5 ? 'bg-orange-400' :
                'bg-red-400'
              }`}
            />
          </div>

          {/* Operational Details */}
          <div className="space-y-1.5">
            {breakdown.operational.details.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className={item.status === 'valid' ? 'text-slate-700' : 'text-slate-500'}>
                    {item.name}
                  </span>
                  {item.issue && (
                    <span className="text-red-600 italic">- {item.issue}</span>
                  )}
                  {item.value && (
                    <span className="text-slate-600">({item.value})</span>
                  )}
                </div>
                <span className={`font-semibold ${item.status === 'valid' ? 'text-purple-600' : 'text-slate-400'}`}>
                  {item.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues Summary */}
      {hasIssues && (
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-800">
                {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'} Found
              </p>
              <ul className="mt-1 space-y-0.5">
                {issues.slice(0, 3).map((issue, index) => (
                  <li key={index} className="text-xs text-slate-600">
                    • {issue.name}: {issue.issue}
                  </li>
                ))}
                {issues.length > 3 && (
                  <li className="text-xs text-slate-500 italic">
                    + {issues.length - 3} more issues
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Perfect Score Celebration */}
      {percentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: [
              '0 0 0 0 rgba(34, 197, 94, 0)',
              '0 0 0 8px rgba(34, 197, 94, 0.1)',
              '0 0 0 0 rgba(34, 197, 94, 0)'
            ]
          }}
          transition={{
            delay: 0.5,
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="mt-3 p-3 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-lg border-2 border-green-300 shadow-md"
        >
          <div className="flex items-center gap-2">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              🎉
            </motion.span>
            <div>
              <p className="text-sm font-bold text-green-800">Perfect Compliance!</p>
              <p className="text-sm text-green-700">All checks passed successfully</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ComplianceScoreCard;
