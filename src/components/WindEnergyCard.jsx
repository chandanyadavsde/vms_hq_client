import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Zap, Settings, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react'
import TurbineIcon from './TurbineIcon.jsx'
import StageCard from './StageCard.jsx'

const WindEnergyCard = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [stages, setStages] = useState([
    {
      id: 1,
      name: 'Site Planning',
      description: 'Analyze wind patterns and determine optimal turbine placement',
      status: 'completed',
      progress: 100,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-30'),
      icon: <Wind className="w-6 h-6" />
    },
    {
      id: 2,
      name: 'Installation',
      description: 'Install wind turbines and connect to power grid',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2024-02-01'),
      icon: <Settings className="w-6 h-6" />
    },
    {
      id: 3,
      name: 'Testing',
      description: 'Test turbine performance and power generation',
      status: 'not-started',
      progress: 0,
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 4,
      name: 'Operation',
      description: 'Monitor and maintain wind farm operations',
      status: 'not-started',
      progress: 0,
      icon: <CheckCircle className="w-6 h-6" />
    }
  ])

  const overallProgress = stages.reduce((acc, stage) => acc + stage.progress, 0) / stages.length

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

  const handleStageAction = (stageId, action) => {
    setStages(prev => prev.map(stage => {
      if (stage.id === stageId) {
        switch (action) {
          case 'start':
            return { ...stage, status: 'in-progress', startDate: new Date() }
          case 'pause':
            return { ...stage, status: 'not-started' }
          case 'complete':
            return { ...stage, status: 'completed', progress: 100, endDate: new Date() }
          default:
            return stage
        }
      }
      return stage
    }))
  }

  return (
    <div className="relative">
      {/* Main Card */}
      <motion.div
        className="glass-effect rounded-2xl p-6 cursor-pointer relative overflow-hidden"
        style={{ width: isExpanded ? '800px' : '400px', height: isExpanded ? '600px' : '300px' }}
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Background Wind Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="wind-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Wind Farm Alpha</h2>
                              <p className="text-teal-200 text-sm">Location: Coastal Plains</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <TurbineIcon className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </div>

          {/* Progress Ring */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                  fill="none"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallProgress / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - overallProgress / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{Math.round(overallProgress)}%</span>
              </div>
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-between mb-4">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusBgColor(stage.status)}`}
                whileHover={{ scale: 1.2 }}
                animate={{
                  scale: stage.status === 'in-progress' ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: stage.status === 'in-progress' ? Infinity : 0,
                }}
              >
                <div className={`w-4 h-4 rounded-full ${getStatusColor(stage.status)}`}>
                  {stage.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                  {stage.status === 'in-progress' && <Play className="w-4 h-4" />}
                  {stage.status === 'not-started' && <div className="w-4 h-4 bg-current rounded-full" />}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Status Text */}
          <div className="text-center">
            <p className="text-white font-medium">
              {stages.find(s => s.status === 'in-progress')?.name || 'All stages completed'}
            </p>
                            <p className="text-teal-200 text-sm">
              {stages.filter(s => s.status === 'completed').length} of {stages.length} stages complete
            </p>
          </div>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Process Stages</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsExpanded(false)
                      }}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {stages.map((stage) => (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        onAction={handleStageAction}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default WindEnergyCard 