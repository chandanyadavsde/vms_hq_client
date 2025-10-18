import React from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Table } from 'lucide-react'

const ViewToggle = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
      {/* Card View Button */}
      <motion.button
        onClick={() => onViewChange('cards')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === 'cards'
            ? 'bg-white text-orange-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Card View"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Cards</span>
      </motion.button>

      {/* Table View Button */}
      <motion.button
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === 'table'
            ? 'bg-white text-orange-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Table View"
      >
        <Table className="w-4 h-4" />
        <span className="hidden sm:inline">Table</span>
      </motion.button>
    </div>
  )
}

export default ViewToggle
