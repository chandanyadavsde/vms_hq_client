import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  Truck, 
  Calendar, 
  Clock, 
  Navigation, 
  RefreshCw, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Filter,
  Layers,
  Maximize2,
  Minimize2
} from 'lucide-react'

const RouteSurveyPage = ({ currentTheme }) => {
  const { preLrId } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [routeData, setRouteData] = useState(null)
  const [activeRoute, setActiveRoute] = useState(null)
  const [showSidePanel, setShowSidePanel] = useState(true)
  const [selectedWaypoint, setSelectedWaypoint] = useState(null)
  const [playbackMode, setPlaybackMode] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(null)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadRouteData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      setTimeout(() => {
        setRouteData({
          preLrId: preLrId || 'DOMWBS252600000454',
          routes: [
            {
              id: 'route-1',
              lrId: 'LR123456',
              vehicle: {
                number: 'MH12AB1234',
                driver: 'Rajesh Kumar',
                phone: '+91-9876543210',
                status: 'In Transit'
              },
              origin: {
                name: 'SUZLON ENERGY LIMITED',
                address: 'Pune, Maharashtra',
                lat: 18.5204,
                lng: 73.8567
              },
              destination: {
                name: 'AMPIN ENERGY TRANSMISSION',
                address: 'Mumbai, Maharashtra',
                lat: 19.0760,
                lng: 72.8777
              },
              waypoints: [
                {
                  id: 'wp-1',
                  name: 'Origin - Suzlon Depot',
                  type: 'origin',
                  lat: 18.5204,
                  lng: 73.8567,
                  status: 'completed',
                  plannedArrival: '2024-01-20T14:00:00Z',
                  actualArrival: '2024-01-20T14:00:00Z',
                  notes: 'Loaded by Amit Sharma'
                },
                {
                  id: 'wp-2',
                  name: 'Toll Plaza - Mumbai Highway',
                  type: 'toll',
                  lat: 18.75,
                  lng: 73.42,
                  status: 'completed',
                  plannedArrival: '2024-01-20T16:00:00Z',
                  actualArrival: '2024-01-20T16:15:00Z',
                  notes: '15 min delay due to traffic'
                },
                {
                  id: 'wp-3',
                  name: 'Rest Stop - Lonavala',
                  type: 'rest',
                  lat: 18.7532,
                  lng: 73.4198,
                  status: 'approaching',
                  plannedArrival: '2024-01-20T17:00:00Z',
                  actualArrival: null,
                  notes: 'ETA: 30 minutes'
                },
                {
                  id: 'wp-4',
                  name: 'Destination - Mumbai',
                  type: 'destination',
                  lat: 19.0760,
                  lng: 72.8777,
                  status: 'upcoming',
                  plannedArrival: '2024-01-20T18:30:00Z',
                  actualArrival: null,
                  notes: 'ETA: 2 hours 15 minutes'
                }
              ],
              plannedRoute: {
                distance: 245,
                duration: 270, // minutes
                polyline: 'mock-polyline-data'
              },
              actualRoute: {
                distance: 248,
                duration: 285,
                polyline: 'mock-actual-polyline-data'
              },
              currentLocation: {
                lat: 18.7532,
                lng: 73.4198,
                speed: 52,
                heading: 45,
                lastUpdate: '2024-01-20T16:45:00Z'
              },
              alerts: [
                {
                  id: 'alert-1',
                  type: 'warning',
                  message: 'Vehicle stopped for 45 minutes',
                  location: 'Near Lonavala',
                  timestamp: '2024-01-20T16:00:00Z',
                  status: 'active'
                },
                {
                  id: 'alert-2',
                  type: 'info',
                  message: 'Route deviation: 5km',
                  location: 'Mumbai Highway',
                  timestamp: '2024-01-20T15:30:00Z',
                  status: 'acknowledged'
                }
              ]
            }
          ]
        })
        setActiveRoute('route-1')
        setIsLoading(false)
      }, 1000)
    }

    loadRouteData()
  }, [preLrId])

  const currentRoute = routeData?.routes?.find(r => r.id === activeRoute)

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'approaching': return 'text-yellow-600 bg-yellow-100'
      case 'upcoming': return 'text-slate-600 bg-slate-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200'
      default: return 'text-slate-600 bg-slate-100 border-slate-200'
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'TBD'
    return new Date(timestamp).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading route data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Route Survey</h1>
              <p className="text-sm text-slate-600">PRE-LR: {routeData?.preLrId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh
            </motion.button>
            
            <motion.button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showSidePanel ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Map Area */}
        <div className={`transition-all duration-300 ${showSidePanel ? 'w-[70%]' : 'w-full'}`}>
          {/* Map Placeholder */}
          <div className="h-full bg-slate-100 relative">
            {/* Map Controls */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white rounded-lg shadow-lg p-2">
                <div className="space-y-2">
                  <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors">
                    <Layers className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors">
                    <Navigation className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Map Content */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Interactive Route Map</h3>
                <p className="text-slate-500 mb-4">Google Maps integration will be displayed here</p>
                
                {/* Mock Route Visualization */}
                <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
                  <h4 className="font-semibold text-slate-800 mb-4">Route Overview</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Origin: {currentRoute?.origin.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Waypoints: {currentRoute?.waypoints.length - 2} stops</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Destination: {currentRoute?.destination.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Vehicle: {currentRoute?.vehicle.number}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            {playbackMode && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded">
                    <Play className="w-4 h-4" />
                  </button>
                  <div className="w-48 bg-slate-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm text-slate-600">3:45 PM</span>
                  <select 
                    value={playbackSpeed} 
                    onChange={(e) => setPlaybackSpeed(e.target.value)}
                    className="text-sm border border-slate-300 rounded px-2 py-1"
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {showSidePanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '30%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-l border-slate-200 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Route Summary */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Route Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">PRE-LR:</span>
                      <span className="font-medium">{routeData?.preLrId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">LR:</span>
                      <span className="font-medium">{currentRoute?.lrId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vehicle:</span>
                      <span className="font-medium">{currentRoute?.vehicle.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Driver:</span>
                      <span className="font-medium">{currentRoute?.vehicle.driver}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        currentRoute?.vehicle.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {currentRoute?.vehicle.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Distance:</span>
                        <span className="font-medium">{currentRoute?.plannedRoute.distance} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duration:</span>
                        <span className="font-medium">{formatDuration(currentRoute?.plannedRoute.duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">ETA:</span>
                        <span className="font-medium">6:30 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Waypoints */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Waypoints ({currentRoute?.waypoints.length})</h3>
                  <div className="space-y-3">
                    {currentRoute?.waypoints.map((waypoint, index) => (
                      <motion.div
                        key={waypoint.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedWaypoint === waypoint.id ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedWaypoint(waypoint.id)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            waypoint.status === 'completed' ? 'bg-green-500' :
                            waypoint.status === 'approaching' ? 'bg-yellow-500' :
                            waypoint.status === 'upcoming' ? 'bg-slate-300' : 'bg-red-500'
                          }`}>
                            {waypoint.status === 'completed' ? '✓' : index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800 text-sm">{waypoint.name}</h4>
                            <p className="text-xs text-slate-600 mt-1">{waypoint.address || 'Location details'}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(waypoint.status)}`}>
                                {waypoint.status}
                              </span>
                              <span className="text-xs text-slate-500">
                                {waypoint.status === 'completed' ? `Arrived: ${formatTime(waypoint.actualArrival)}` :
                                 waypoint.status === 'approaching' ? `ETA: ${formatTime(waypoint.plannedArrival)}` :
                                 `Planned: ${formatTime(waypoint.plannedArrival)}`}
                              </span>
                            </div>
                            {waypoint.notes && (
                              <p className="text-xs text-slate-500 mt-1">{waypoint.notes}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                {currentRoute?.alerts && currentRoute.alerts.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Active Alerts ({currentRoute.alerts.length})</h3>
                    <div className="space-y-3">
                      {currentRoute.alerts.map((alert) => (
                        <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{alert.message}</p>
                              <p className="text-xs text-slate-600 mt-1">{alert.location}</p>
                              <p className="text-xs text-slate-500">{formatTime(alert.timestamp)}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              alert.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone className="w-4 h-4 inline mr-2" />
                      Call Driver
                    </motion.button>
                    <motion.button
                      className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Send Message
                    </motion.button>
                    <motion.button
                      className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Navigation className="w-4 h-4 inline mr-2" />
                      Center Map
                    </motion.button>
                    <motion.button
                      className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-4 h-4 inline mr-2" />
                      Playback
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RouteSurveyPage
