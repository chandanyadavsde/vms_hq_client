import React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, CheckCircle, RotateCcw, Calendar, Clock } from 'lucide-react'

const StageCard = ({ stage, onAction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-energy-green'
      case 'in-progress': return 'text-energy-yellow'
      case 'error': return 'text-energy-red'
      default: return 'text-energy-gray'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-energy-green/20'
      case 'in-progress': return 'bg-energy-yellow/20'
      case 'error': return 'bg-energy-red/20'
      default: return 'bg-energy-gray/20'
    }
  }

  const getProgressColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-energy-green'
      case 'in-progress': return 'bg-energy-yellow'
      case 'error': return 'bg-energy-red'
      default: return 'bg-energy-gray'
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDuration = () => {
    if (stage.startDate && stage.endDate) {
      const diffTime = Math.abs(stage.endDate.getTime() - stage.startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} days`
    }
    if (stage.startDate) {
      const diffTime = Math.abs(new Date().getTime() - stage.startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} days`
    }
    return null
  }

  return (
    <motion.div
      className="glass-effect rounded-xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        {/* Stage Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${getStatusBgColor(stage.status)}`}>
              <div className={getStatusColor(stage.status)}>
                {stage.icon}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold">{stage.name}</h4>
                              <p className="text-teal-200 text-sm">{stage.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
                            <div className="flex justify-between text-xs text-teal-200 mb-1">
              <span>Progress</span>
              <span>{stage.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${getProgressColor(stage.status)}`}
                initial={{ width: 0 }}
                animate={{ width: `${stage.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Date Info */}
          {(stage.startDate || stage.endDate) && (
                            <div className="flex items-center gap-4 text-xs text-teal-200">
              {stage.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Started: {formatDate(stage.startDate)}</span>
                </div>
              )}
              {stage.endDate && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Completed: {formatDate(stage.endDate)}</span>
                </div>
              )}
              {getDuration() && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getDuration()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4">
          {stage.status === 'not-started' && (
            <motion.button
              onClick={() => onAction(stage.id, 'start')}
              className="p-2 bg-energy-green/20 text-energy-green rounded-lg hover:bg-energy-green/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4 h-4" />
            </motion.button>
          )}

          {stage.status === 'in-progress' && (
            <>
              <motion.button
                onClick={() => onAction(stage.id, 'pause')}
                className="p-2 bg-energy-yellow/20 text-energy-yellow rounded-lg hover:bg-energy-yellow/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pause className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => onAction(stage.id, 'complete')}
                className="p-2 bg-energy-green/20 text-energy-green rounded-lg hover:bg-energy-green/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className="w-4 h-4" />
              </motion.button>
            </>
          )}

          {stage.status === 'completed' && (
            <motion.button
              onClick={() => onAction(stage.id, 'start')}
              className="p-2 bg-energy-green/20 text-energy-green rounded-lg hover:bg-energy-green/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default StageCard 