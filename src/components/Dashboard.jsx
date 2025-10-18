/**
 * Enterprise Dashboard Component
 * Comprehensive VMS dashboard with real-time analytics and modern design
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Truck,
  Users,
  AlertTriangle,
  PieChart,
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Bell,
  Download,
  Filter,
  Plus,
  UserCheck,
  FileText,
  Shield,
  Zap,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import DashboardService from '../services/DashboardService.js'

const Dashboard = ({ currentTheme }) => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [dateRange, setDateRange] = useState('7days')
  const [activityFilter, setActivityFilter] = useState('all')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DashboardService.getDashboardData()
      setDashboardData(data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading Dashboard</h3>
          <p className="text-slate-600">Fetching real-time data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Dashboard Error</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const { preLr, vehicles, drivers, metrics, alerts } = dashboardData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100">
      <div className="max-w-[1920px] mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-orange-600 to-slate-800 bg-clip-text text-transparent mb-2">
                Enterprise Dashboard
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {lastRefresh && `Last updated ${lastRefresh.toLocaleTimeString()}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-xl shadow-sm border border-slate-200 hover:border-orange-200 transition-all duration-200 hover:shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section - Critical KPIs */}
        <HeroSection
          metrics={metrics}
          alerts={alerts}
          preLr={preLr}
        />

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <EnhancedMetricCard
                title="PRE-LRs"
                value={preLr.total}
                icon={Package}
                color="blue"
                trend={preLr.trends?.weeklyGrowth || 0}
                subtitle={`${preLr.lrDistribution?.totalLrs || 0} total LRs`}
              />
              <EnhancedMetricCard
                title="Active Orders"
                value={preLr.byStatus?.active || 0}
                icon={Activity}
                color="green"
                trend={5}
                subtitle="Currently in progress"
              />
              <EnhancedMetricCard
                title="Vehicles"
                value={vehicles.total}
                icon={Truck}
                color="orange"
                trend={vehicles.assignmentRate - 70}
                subtitle={`${vehicles.assignmentRate}% utilization`}
              />
              <EnhancedMetricCard
                title="Drivers"
                value={drivers.total}
                icon={Users}
                color="purple"
                trend={drivers.assignmentRate - 65}
                subtitle={`${drivers.assignmentRate}% assigned`}
              />
            </div>

            {/* Visual Analytics Section */}
            <VisualAnalyticsSection
              preLr={preLr}
              vehicles={vehicles}
              drivers={drivers}
            />

            {/* Resource Utilization */}
            <ResourceUtilizationSection
              vehicles={vehicles}
              drivers={drivers}
            />

            {/* Top Performers */}
            <TopPerformersSection
              topConsignees={preLr.topConsignees || []}
              byPlant={preLr.byPlant || {}}
            />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <AlertsPanel alerts={alerts || []} />

            {/* Status Overview */}
            <StatusCard
              title="Order Status"
              data={preLr.byStatus}
              icon={PieChart}
            />

            {/* Activity Timeline */}
            <EnhancedActivityCard
              title="Recent Activity"
              data={preLr.recentActivity}
              icon={Activity}
              filter={activityFilter}
              onFilterChange={setActivityFilter}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Hero Section Component
const HeroSection = ({ metrics, alerts, preLr }) => {
  const systemHealth = metrics?.systemHealth || 0
  const efficiency = metrics?.overallEfficiency || 0
  const activeAlertCount = alerts?.filter(a => a.priority === 'high').length || 0
  const todayOrders = preLr?.total || 0

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <motion.div
      className={`rounded-2xl p-6 mb-6 border-2 ${getHealthBg(systemHealth)} shadow-lg`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${systemHealth >= 80 ? 'bg-green-500' : systemHealth >= 60 ? 'bg-yellow-500' : 'bg-red-500'} shadow-lg`}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">System Health</p>
            <p className={`text-3xl font-bold ${getHealthColor(systemHealth)}`}>
              {systemHealth}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Efficiency</p>
            <p className="text-3xl font-bold text-blue-600 flex items-center gap-2">
              {efficiency}%
              {efficiency > 70 && <TrendingUp className="w-5 h-5 text-green-500" />}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${activeAlertCount > 0 ? 'bg-red-500' : 'bg-green-500'} shadow-lg relative`}>
            <Bell className="w-8 h-8 text-white" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeAlertCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Active Alerts</p>
            <p className={`text-3xl font-bold ${activeAlertCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {activeAlertCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-orange-600">
              {todayOrders}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Quick Actions Toolbar
const QuickActionsToolbar = () => {
  return (
    <motion.div
      className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium">
          <Plus className="w-4 h-4" />
          Create Order
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 font-medium">
          <UserCheck className="w-4 h-4" />
          Assign Vehicle
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 font-medium">
          <FileText className="w-4 h-4" />
          View Reports
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 font-medium">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 font-medium">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
    </motion.div>
  )
}

// Enhanced Metric Card with Trends
const EnhancedMetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
  const colorConfigs = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-500',
      accent: 'border-blue-200'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      icon: 'text-green-600',
      iconBg: 'bg-green-500',
      accent: 'border-green-200'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-500',
      accent: 'border-orange-200'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-500',
      accent: 'border-purple-200'
    }
  }

  const config = colorConfigs[color]
  const isPositiveTrend = trend > 0

  return (
    <motion.div
      className={`${config.bg} rounded-xl p-5 border ${config.accent} hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer`}
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${config.gradient} shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isPositiveTrend
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {isPositiveTrend ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value.toLocaleString()}</p>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

// Alerts Panel Component
const AlertsPanel = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <motion.div
        className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 shadow-sm"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-500 shadow-md">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-green-900">All Clear</h3>
        </div>
        <p className="text-sm text-green-700">No active alerts. System is running smoothly.</p>
      </motion.div>
    )
  }

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertCircle className="w-4 h-4" />
    if (priority === 'medium') return <Clock className="w-4 h-4" />
    return <Bell className="w-4 h-4" />
  }

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-50 border-red-200 text-red-700'
    if (priority === 'medium') return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    return 'bg-blue-50 border-blue-200 text-blue-700'
  }

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md relative">
          <Bell className="w-5 h-5 text-white" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Active Alerts</h3>
          <p className="text-xs text-slate-500">{alerts.length} items need attention</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {alerts.map((alert, index) => (
          <motion.div
            key={index}
            className={`p-4 rounded-xl border-2 ${getPriorityColor(alert.priority)} transition-all duration-200 hover:shadow-md`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getPriorityIcon(alert.priority)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">{alert.message}</p>
                <p className="text-xs opacity-75 mb-2">{alert.action}</p>
                <span className="inline-block px-2 py-0.5 bg-white/50 rounded-full text-xs font-medium">
                  {alert.category}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Visual Analytics Section
const VisualAnalyticsSection = ({ preLr, vehicles, drivers }) => {
  // Prepare data for Order Trends chart (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      orders: Math.floor(Math.random() * 20) + 10, // Simulated data
      completed: Math.floor(Math.random() * 15) + 5
    }
  })

  // Prepare data for Status Distribution
  const statusData = [
    { name: 'Active', value: preLr.byStatus?.active || 0, color: '#10b981' },
    { name: 'Completed', value: preLr.byStatus?.completed || 0, color: '#3b82f6' },
    { name: 'Pending', value: preLr.byStatus?.pending || 0, color: '#f59e0b' }
  ]

  // Prepare data for Plant Performance
  const plantData = Object.entries(preLr.byPlant || {})
    .slice(0, 5)
    .map(([plant, data]) => ({
      name: plant.substring(0, 10),
      total: data.total || 0,
      active: data.active || 0
    }))

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Order Trends */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Order Trends
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-green-600" />
          Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <RechartsPieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs text-slate-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plant Performance */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-600" />
          Top Plants
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={plantData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="total" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

// Resource Utilization Section
const ResourceUtilizationSection = ({ vehicles, drivers }) => {
  const vehicleUtilization = vehicles.utilization?.utilizationRate || 0
  const driverUtilization = drivers.assignmentRate || 0
  const avgUtilization = Math.round((vehicleUtilization + driverUtilization) / 2)

  const UtilizationBar = ({ label, percentage, assigned, total, color }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">
          {assigned}/{total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-3 rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
    </div>
  )

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Resource Utilization</h3>
          <p className="text-sm text-slate-500">Fleet and driver capacity overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <UtilizationBar
            label="Vehicles"
            percentage={vehicleUtilization}
            assigned={vehicles.utilization?.assigned || 0}
            total={vehicles.total}
            color="from-orange-400 to-orange-600"
          />
          <UtilizationBar
            label="Drivers"
            percentage={driverUtilization}
            assigned={vehicles.utilization?.assigned || 0}
            total={drivers.total}
            color="from-purple-400 to-purple-600"
          />
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e2e8f0"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 352" }}
                animate={{ strokeDasharray: `${(avgUtilization / 100) * 352} 352` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-slate-900">{avgUtilization}%</span>
              <span className="text-xs text-slate-500">Average</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-slate-600 mb-1">Available Vehicles</p>
            <p className="text-2xl font-bold text-orange-600">
              {vehicles.utilization?.available || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-slate-600 mb-1">Available Drivers</p>
            <p className="text-2xl font-bold text-purple-600">
              {drivers.total - (vehicles.utilization?.assigned || 0)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Top Performers Section
const TopPerformersSection = ({ topConsignees, byPlant }) => {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Top Performers</h3>
          <p className="text-sm text-slate-500">Leading consignees and locations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Consignees */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Top Consignees</h4>
          <div className="space-y-3">
            {topConsignees.slice(0, 5).map((consignee, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">
                    {consignee.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((consignee.count / topConsignees[0].count) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 min-w-[30px]">
                    {consignee.count}
                  </span>
                </div>
              </motion.div>
            ))}
            {topConsignees.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Plants */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Top Plants</h4>
          <div className="space-y-3">
            {Object.entries(byPlant).slice(0, 5).map(([plant, data], index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-slate-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]">
                    {plant}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((data.total / Object.values(byPlant)[0].total) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 min-w-[30px]">
                    {data.total}
                  </span>
                </div>
              </motion.div>
            ))}
            {Object.keys(byPlant).length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Status Card Component
const StatusCard = ({ title, data, icon: Icon }) => {
  const statuses = [
    { key: 'active', label: 'Active', color: 'bg-green-500', gradient: 'from-green-400 to-green-600' },
    { key: 'completed', label: 'Completed', color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
    { key: 'pending', label: 'Pending', color: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600' }
  ]

  const total = Object.values(data).reduce((sum, count) => sum + count, 0)

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{total} total orders</p>
        </div>
      </div>
      <div className="space-y-4">
        {statuses.map(({ key, label, color, gradient }) => {
          const count = data[key] || 0
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0

          return (
            <motion.div
              key={key}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">{count}</span>
                  <span className="text-xs text-slate-500 ml-1">({percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${gradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Enhanced Activity Card Component
const EnhancedActivityCard = ({ title, data, icon: Icon, filter, onFilterChange }) => {
  const filteredData = filter === 'all'
    ? data
    : data.filter(activity => activity.status === filter)

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200">
          <Icon className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">Latest updates</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {['all', 'active', 'completed', 'pending'].map(status => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              filter === status
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredData.length > 0 ? (
          filteredData.slice(0, 8).map((activity, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 bg-gradient-to-r from-slate-50 to-orange-50/30 rounded-xl border border-slate-100 hover:border-orange-200 transition-all duration-200 cursor-pointer hover:shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {activity.consignee} → {activity.toLocation}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-500">
                    {activity.lrCount} LRs
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activity.status === 'active' ? 'bg-green-100 text-green-700' :
                    activity.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm">No {filter !== 'all' ? filter : ''} activity</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Dashboard
