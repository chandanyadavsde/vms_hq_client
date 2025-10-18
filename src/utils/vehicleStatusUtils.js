/**
 * Vehicle Status Utilities
 * Helper functions for vehicle status calculations and transformations
 */

/**
 * Status order for progression validation
 */
export const STATUS_ORDER = ['inbound', 'at gate', 'inspection', 'available', 'loaded'];

/**
 * Status display configuration
 */
export const STATUS_CONFIG = {
  inbound: {
    label: 'Inbound',
    icon: '🚛',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    ringColor: 'ring-blue-500',
    description: 'Vehicle is on the way to plant'
  },
  'at gate': {
    label: 'At Gate',
    icon: '🚪',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    ringColor: 'ring-orange-500',
    description: 'Vehicle has arrived at plant gate'
  },
  inspection: {
    label: 'Inspection',
    icon: '🔍',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    ringColor: 'ring-purple-500',
    description: 'Vehicle is undergoing inspection'
  },
  available: {
    label: 'Available',
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    ringColor: 'ring-green-500',
    description: 'Vehicle is ready for assignment'
  },
  loaded: {
    label: 'Loaded',
    icon: '📦',
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-300',
    ringColor: 'ring-teal-500',
    description: 'Vehicle is loaded and ready to depart'
  }
};

/**
 * Get status configuration
 * @param {string} status - Operational status
 * @returns {object} Status configuration
 */
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.available;
};

/**
 * Get status index in progression
 * @param {string} status - Operational status
 * @returns {number} Index in status order
 */
export const getStatusIndex = (status) => {
  return STATUS_ORDER.indexOf(status);
};

/**
 * Check if status is completed
 * @param {string} status - Status to check
 * @param {string} currentStatus - Current vehicle status
 * @returns {boolean} True if status is completed
 */
export const isStatusCompleted = (status, currentStatus) => {
  const statusIdx = getStatusIndex(status);
  const currentIdx = getStatusIndex(currentStatus);
  return statusIdx < currentIdx;
};

/**
 * Check if status is current
 * @param {string} status - Status to check
 * @param {string} currentStatus - Current vehicle status
 * @returns {boolean} True if status is current
 */
export const isStatusCurrent = (status, currentStatus) => {
  return status === currentStatus;
};

/**
 * Check if status is pending
 * @param {string} status - Status to check
 * @param {string} currentStatus - Current vehicle status
 * @returns {boolean} True if status is pending
 */
export const isStatusPending = (status, currentStatus) => {
  const statusIdx = getStatusIndex(status);
  const currentIdx = getStatusIndex(currentStatus);
  return statusIdx > currentIdx;
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return formatDateTime(date);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'N/A';
  }
};

/**
 * Format timestamp to date and time string
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'N/A';
  }
};

/**
 * Format timestamp to date only
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format timestamp to time only
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted time
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'N/A';
  }
};

/**
 * Calculate duration from timestamp to now
 * @param {string|Date} startTimestamp - Start timestamp
 * @returns {string} Duration string (e.g., "2h 30m")
 */
export const calculateDuration = (startTimestamp) => {
  if (!startTimestamp) return 'N/A';

  try {
    const start = new Date(startTimestamp);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      const hours = diffHours % 24;
      return `${diffDays}d ${hours}h`;
    }
    if (diffHours > 0) {
      const mins = diffMins % 60;
      return `${diffHours}h ${mins}m`;
    }
    return `${diffMins}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 'N/A';
  }
};

/**
 * Calculate time between two timestamps
 * @param {string|Date} startTimestamp - Start timestamp
 * @param {string|Date} endTimestamp - End timestamp
 * @returns {string} Duration string
 */
export const calculateTimeBetween = (startTimestamp, endTimestamp) => {
  if (!startTimestamp || !endTimestamp) return 'N/A';

  try {
    const start = new Date(startTimestamp);
    const end = new Date(endTimestamp);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffHours > 0) {
      const mins = diffMins % 60;
      return `${diffHours}h ${mins}m`;
    }
    return `${diffMins}m`;
  } catch (error) {
    console.error('Error calculating time between:', error);
    return 'N/A';
  }
};

/**
 * Compare ETA vs ATA
 * @param {string|Date} eta - Expected Time of Arrival
 * @param {string|Date} ata - Actual Time of Arrival
 * @returns {object} Comparison result with status and difference
 */
export const compareEtaVsAta = (eta, ata) => {
  if (!eta || !ata) {
    return {
      status: 'unknown',
      message: 'N/A',
      color: 'gray'
    };
  }

  try {
    const etaDate = new Date(eta);
    const ataDate = new Date(ata);
    const diffMs = ataDate - etaDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < -15) {
      return {
        status: 'early',
        message: `${Math.abs(diffMins)} mins early`,
        color: 'green'
      };
    } else if (diffMins <= 15) {
      return {
        status: 'on-time',
        message: 'On time',
        color: 'green'
      };
    } else {
      return {
        status: 'delayed',
        message: `${diffMins} mins delayed`,
        color: 'red'
      };
    }
  } catch (error) {
    console.error('Error comparing ETA vs ATA:', error);
    return {
      status: 'unknown',
      message: 'Error',
      color: 'gray'
    };
  }
};

/**
 * Get plant display name
 * @param {string} plantCode - Plant code
 * @returns {string} Plant display name
 */
export const getPlantDisplayName = (plantCode) => {
  const plantNames = {
    pune: 'Pune',
    solapur: 'Solapur',
    surat: 'Surat',
    daman: 'Daman',
    free: 'Unassigned',
    'in transit': 'In Transit'
  };
  return plantNames[plantCode?.toLowerCase()] || plantCode || 'Unknown';
};

/**
 * Get status badge color classes
 * @param {string} status - Status value
 * @returns {string} Tailwind CSS classes
 */
export const getStatusBadgeClasses = (status) => {
  const config = getStatusConfig(status);
  return `${config.bgColor} ${config.textColor} ${config.borderColor} border-2`;
};