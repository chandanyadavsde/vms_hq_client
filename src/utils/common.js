// Date formatting utility
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Document status utility
export const getDocumentStatus = (endDate) => {
  if (!endDate) return 'unknown'
  const end = new Date(endDate)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'expiring-soon'
  return 'valid'
}

// Status color utilities
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
    case 'approved':
    case 'success':
      return 'text-emerald-400'
    case 'in-progress':
    case 'pending':
      return 'text-amber-400'
    case 'error':
    case 'rejected':
    case 'failed':
      return 'text-red-400'
    case 'not-started':
    case 'waiting':
      return 'text-slate-400'
    default:
      return 'text-cyan-400'
  }
}

export const getStatusBgColor = (status) => {
  switch (status) {
    case 'completed':
    case 'approved':
    case 'success':
      return 'bg-emerald-500/20'
    case 'in-progress':
    case 'pending':
      return 'bg-amber-500/20'
    case 'error':
    case 'rejected':
    case 'failed':
      return 'bg-red-500/20'
    case 'not-started':
    case 'waiting':
      return 'bg-slate-500/20'
    default:
      return 'bg-cyan-500/20'
  }
}

// Animation variants
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

// Common styles
export const glassMorphismClasses = {
  card: 'bg-white/10 backdrop-blur-md border border-white/20',
  modal: 'bg-black/95 border border-white/20',
  button: 'bg-white/10 hover:bg-white/20 border border-white/20'
} 