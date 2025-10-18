import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

const ExportButton = ({ data, filename = 'vehicles-export', viewMode = 'vehicle' }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)

    try {
      // Prepare data for CSV
      const csvData = data.map(item => {
        if (viewMode === 'vehicle') {
          return {
            'Vehicle Number': item.vehicleNumber || '',
            'Driver Name': item.driverName || 'No Driver',
            'Mobile Number': item.mobileNumber || 'N/A',
            'Plant Status': item.plantStatus || 'unassigned',
            'Current Plant': item.currentPlant || 'N/A',
            'Operational Status': item.operationalStatus || 'available',
            'Last Updated': item.lastUpdated || 'N/A',
            'Created By': item.createdBy || 'N/A',
            'Approval Status': item.approvalStatus || 'pending',
            'Has Driver': item.hasDriver ? 'Yes' : 'No',
            'Has Checklist': item.hasChecklist ? 'Yes' : 'No',
            'Has Contacts': item.hasContacts ? 'Yes' : 'No'
          }
        } else {
          // Driver export format
          return {
            'Name': item.name || '',
            'Contact': item.contact?.phone || 'N/A',
            'License Number': item.identification?.licenseNumber || 'N/A',
            'License Type': item.identification?.licenseType || 'N/A',
            'License Start': item.identification?.licenseStart || 'N/A',
            'License Expiry': item.identification?.licenseExpiry || 'N/A',
            'Vehicle Assigned': item.assignedVehicles && item.assignedVehicles.length > 0
              ? item.assignedVehicles[0].vehicleNumber
              : 'No Vehicle',
            'Status': item.status || 'N/A',
            'Created At': item.createdAt || 'N/A'
          }
        }
      })

      // Create CSV string
      const headers = Object.keys(csvData[0])
      const csvContent = [
        headers.join(','),
        ...csvData.map(row =>
          headers.map(header => {
            const value = row[header]
            // Escape quotes and wrap in quotes if contains comma
            return typeof value === 'string' && value.includes(',')
              ? `"${value.replace(/"/g, '""')}"`
              : value
          }).join(',')
        )
      ].join('\n')

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = () => {
    setIsExporting(true)

    try {
      // Prepare data for Excel
      const excelData = data.map(item => {
        if (viewMode === 'vehicle') {
          return {
            'Vehicle Number': item.vehicleNumber || '',
            'Driver Name': item.driverName || 'No Driver',
            'Mobile Number': item.mobileNumber || 'N/A',
            'Plant Status': item.plantStatus || 'unassigned',
            'Current Plant': item.currentPlant || 'N/A',
            'Operational Status': item.operationalStatus || 'available',
            'Last Updated': item.lastUpdated || 'N/A',
            'Created By': item.createdBy || 'N/A',
            'Approval Status': item.approvalStatus || 'pending',
            'Has Driver': item.hasDriver ? 'Yes' : 'No',
            'Has Checklist': item.hasChecklist ? 'Yes' : 'No',
            'Has Contacts': item.hasContacts ? 'Yes' : 'No'
          }
        } else {
          return {
            'Name': item.name || '',
            'Contact': item.contact?.phone || 'N/A',
            'License Number': item.identification?.licenseNumber || 'N/A',
            'License Type': item.identification?.licenseType || 'N/A',
            'License Start': item.identification?.licenseStart || 'N/A',
            'License Expiry': item.identification?.licenseExpiry || 'N/A',
            'Vehicle Assigned': item.assignedVehicles && item.assignedVehicles.length > 0
              ? item.assignedVehicles[0].vehicleNumber
              : 'No Vehicle',
            'Status': item.status || 'N/A',
            'Created At': item.createdAt || 'N/A'
          }
        }
      })

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, viewMode === 'vehicle' ? 'Vehicles' : 'Drivers')

      // Auto-size columns
      const maxWidth = 50
      const colWidths = Object.keys(excelData[0] || {}).map(key => {
        const maxLength = Math.max(
          key.length,
          ...excelData.map(row => String(row[key] || '').length)
        )
        return { wch: Math.min(maxLength + 2, maxWidth) }
      })
      ws['!cols'] = colWidths

      // Download
      XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={exportToCSV}
          disabled={isExporting || data.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-white border border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export to CSV"
        >
          <FileText className="w-4 h-4" />
          <span>CSV</span>
        </button>

        <button
          onClick={exportToExcel}
          disabled={isExporting || data.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-white border border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export to Excel"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel</span>
        </button>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute top-full right-0 mt-2 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Exported successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExportButton