import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

const ExportButton = ({ data, filename = 'prelr-export', activeFilters = {} }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)

    try {
      // Prepare PRE-LR Summary data for CSV
      const preLrData = data.map(preLr => ({
        'PRE-LR ID': preLr.id || '',
        'Consignor': preLr.consignor || 'N/A',
        'Consignee': preLr.consignee || 'N/A',
        'Site': preLr.site || 'N/A',
        'District': preLr.district || 'N/A',
        'State': preLr.state || 'N/A',
        'From Location': preLr.fromLocation || 'N/A',
        'WTG Number': preLr.wtgNumber || 'N/A',
        'Content': preLr.content || 'N/A',
        'Total LRs': preLr.lrCount || 0,
        'Total Quantity': preLr.preLrLines.reduce((sum, line) => sum + (parseInt(line.totalQuantity) || 0), 0),
        'LR Created Qty': preLr.preLrLines.reduce((sum, line) => sum + (parseInt(line.lrCreatedQty) || 0), 0),
        'Remaining Qty': preLr.preLrLines.reduce((sum, line) => sum + (parseInt(line.lrRemainingQty) || 0), 0),
        'Status': preLr.status || 'N/A',
        'Progress': `${preLr.progress || 0}%`,
        'Created Date': preLr.createdDate || 'N/A'
      }))

      // Create CSV string
      const headers = Object.keys(preLrData[0])
      const csvContent = [
        headers.join(','),
        ...preLrData.map(row =>
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
      console.error('CSV Export failed:', error)
      alert('CSV Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = () => {
    setIsExporting(true)

    try {
      // Create workbook
      const wb = XLSX.utils.book_new()

      // Sheet 1: PRE-LR Summary
      const preLrData = data.map(preLr => ({
        'PRE-LR ID': preLr.id || '',
        'Consignor': preLr.consignor || 'N/A',
        'Consignee': preLr.consignee || 'N/A',
        'Site': preLr.site || 'N/A',
        'District': preLr.district || 'N/A',
        'State': preLr.state || 'N/A',
        'From Location': preLr.fromLocation || 'N/A',
        'WTG Number': preLr.wtgNumber || 'N/A',
        'Content': preLr.content || 'N/A',
        'Total LRs': preLr.lrCount || 0,
        'Completed LRs': preLr.associatedLrs.filter(lr => lr.status === 'completed').length,
        'Pending LRs': preLr.associatedLrs.filter(lr => lr.status !== 'completed').length,
        'Total Quantity': preLr.preLrLines.reduce((sum, line) => sum + (parseInt(line.totalQuantity) || 0), 0),
        'LR Created Qty': preLr.preLrLines.reduce((sum, line) => sum + (parseInt(line.lrCreatedQty) || 0), 0),
        'Remaining Qty': preLr.preLrLines.reduce((sum, line) => sum + (parseInt(line.lrRemainingQty) || 0), 0),
        'Status': preLr.status || 'N/A',
        'Progress %': preLr.progress || 0,
        'Created Date': preLr.createdDate || 'N/A'
      }))

      const ws1 = XLSX.utils.json_to_sheet(preLrData)
      XLSX.utils.book_append_sheet(wb, ws1, 'PRE-LR Summary')

      // Sheet 2: LR Details (flatten all LRs from all PRE-LRs)
      const lrData = []
      data.forEach(preLr => {
        preLr.associatedLrs.forEach(lr => {
          lrData.push({
            'PRE-LR ID': preLr.id || '',
            'PRE-LR Status': preLr.status || 'N/A',
            'LR Name': lr.lrName || 'N/A',
            'LR Date': lr.lrDate || 'N/A',
            'Vehicle No': lr.vehicleNo || 'N/A',
            'Vehicle Type': lr.vehicleType || 'N/A',
            'Vehicle Requested Date': lr.vehicleReqDate || 'N/A',
            'Vehicle Reporting Date': lr.vehicleRepDate || 'N/A',
            'Vehicle Departure Date': lr.vehicleDepDate || 'N/A',
            'Vehicle Release Date': lr.vehicleRelDate || 'N/A',
            'Vehicle Assignment': lr.assignmentStatus || 'unassigned',
            'Driver Status': lr.driverStatus || 'unassigned',
            'Punchlist Status': lr.punchlistStatus || 'pending',
            'LR Status': lr.status || 'N/A',
            'Ready Status': lr.ready ? 'Yes' : 'No'
          })
        })
      })

      if (lrData.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(lrData)
        XLSX.utils.book_append_sheet(wb, ws2, 'LR Details')
      }

      // Sheet 3: Line Items (flatten all lines from all PRE-LRs)
      const lineData = []
      data.forEach(preLr => {
        preLr.preLrLines.forEach(line => {
          lineData.push({
            'PRE-LR ID': preLr.id || '',
            'PRE-LR Status': preLr.status || 'N/A',
            'Line Internal ID': line.prelrLineItnernalId || '',
            'Sub Content': line.subContent || 'N/A',
            'Sub Content ID': line.subContentId || 'N/A',
            'Vehicle Type': line.vehicleType || 'N/A',
            'Vehicle Category': line.vehicleCategory || 'N/A',
            'Total Quantity': line.totalQuantity || '0',
            'LR Created Qty': line.lrCreatedQty || '0',
            'LR Remaining Qty': line.lrRemainingQty || '0',
            'Customer Rate': line.customerRate || 'N/A',
            'New Customer Rate': line.newCustomerRate || 'N/A',
            'Line Consigner': line.lineConsigner || 'N/A',
            'Line Remarks': line.lineRemarks || 'N/A',
            'Short Close': line.shortClose ? 'Yes' : 'No',
            'Line Status': line.lineStatus || 'N/A'
          })
        })
      })

      if (lineData.length > 0) {
        const ws3 = XLSX.utils.json_to_sheet(lineData)
        XLSX.utils.book_append_sheet(wb, ws3, 'Line Items')
      }

      // Auto-size columns for all sheets
      [ws1, lrData.length > 0 ? XLSX.utils.sheet_to_json(wb.Sheets['LR Details']) : null, lineData.length > 0 ? XLSX.utils.sheet_to_json(wb.Sheets['Line Items']) : null]
        .filter(Boolean)
        .forEach((_, sheetIndex) => {
          const sheetName = wb.SheetNames[sheetIndex]
          const sheet = wb.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(sheet)

          if (data.length > 0) {
            const maxWidth = 50
            const colWidths = Object.keys(data[0]).map(key => {
              const maxLength = Math.max(
                key.length,
                ...data.map(row => String(row[key] || '').length)
              )
              return { wch: Math.min(maxLength + 2, maxWidth) }
            })
            sheet['!cols'] = colWidths
          }
        })

      // Download
      const timestamp = new Date().toISOString().split('T')[0]
      const filterInfo = Object.keys(activeFilters).length > 0 ? '-filtered' : ''
      XLSX.writeFile(wb, `${filename}${filterInfo}-${timestamp}.xlsx`)

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Excel Export failed:', error)
      alert('Excel Export failed. Please try again.')
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
          title="Export to Excel (3 sheets: PRE-LR Summary, LR Details, Line Items)"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel</span>
        </button>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute top-full right-0 mt-2 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
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
