/**
 * Document Expiry Utilities
 * Helper functions for document status and expiry calculations
 */

/**
 * Document types configuration
 */
export const DOCUMENT_TYPES = {
  rc: {
    label: 'RC Certificate',
    icon: '📋',
    startDateField: 'custrecord_rc_start_date',
    endDateField: 'custrecord_rc_end_date',
    numberField: 'custrecord_rc_no',
    attachmentField: 'custrecord_rc_doc_attach'
  },
  insurance: {
    label: 'Insurance',
    icon: '🛡️',
    startDateField: 'custrecord_insurance_start_date_ag',
    endDateField: 'custrecord_insurance_end_date_ag',
    numberField: 'custrecord_insurance_number_ag',
    attachmentField: 'custrecord_insurance_attachment_ag',
    companyField: 'custrecord_insurance_company_name_ag'
  },
  permit: {
    label: 'Permit',
    icon: '📜',
    startDateField: 'custrecord_permit_start_date',
    endDateField: 'custrecord_permit_end_date',
    numberField: 'custrecord_permit_number_ag',
    attachmentField: 'custrecord_permit_attachment_ag'
  },
  puc: {
    label: 'PUC',
    icon: '🔍',
    startDateField: 'custrecord_puc_start_date_ag',
    endDateField: 'custrecord_puc_end_date_ag',
    numberField: 'custrecord_puc_number',
    attachmentField: 'custrecord_puc_attachment_ag'
  },
  fitness: {
    label: 'Fitness',
    icon: '✅',
    endDateField: 'custrecord_fitness_end_date',
    attachmentField: 'custrecord_fitness_attachment_ag'
  }
};

/**
 * Document status levels
 */
export const DOCUMENT_STATUS = {
  EXPIRED: 'expired',
  CRITICAL: 'critical',      // 0-7 days remaining
  WARNING: 'warning',         // 8-30 days remaining
  VALID: 'valid',            // >30 days remaining
  MISSING: 'missing'         // No date provided
};

/**
 * Status colors and styles
 */
export const STATUS_CONFIG = {
  expired: {
    label: 'Expired',
    icon: '❌',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    badgeClass: 'bg-red-500'
  },
  critical: {
    label: 'Expiring Soon',
    icon: '🚨',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    badgeClass: 'bg-red-500'
  },
  warning: {
    label: 'Expires Soon',
    icon: '⚠️',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    badgeClass: 'bg-orange-500'
  },
  valid: {
    label: 'Valid',
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    badgeClass: 'bg-green-500'
  },
  missing: {
    label: 'Missing',
    icon: '⚪',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    badgeClass: 'bg-gray-400'
  }
};

/**
 * Calculate days until expiry
 * @param {string|Date} expiryDate - Document expiry date
 * @returns {number} Days until expiry (negative if expired)
 */
export const calculateDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); // Start of expiry date

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('Error calculating days until expiry:', error);
    return null;
  }
};

/**
 * Get document status based on expiry date
 * @param {string|Date} expiryDate - Document expiry date
 * @returns {string} Document status (expired, critical, warning, valid, missing)
 */
export const getDocumentStatus = (expiryDate) => {
  if (!expiryDate) return DOCUMENT_STATUS.MISSING;

  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);

  if (daysUntilExpiry === null) return DOCUMENT_STATUS.MISSING;
  if (daysUntilExpiry < 0) return DOCUMENT_STATUS.EXPIRED;
  if (daysUntilExpiry <= 7) return DOCUMENT_STATUS.CRITICAL;
  if (daysUntilExpiry <= 30) return DOCUMENT_STATUS.WARNING;

  return DOCUMENT_STATUS.VALID;
};

/**
 * Get status configuration for a document
 * @param {string} status - Document status
 * @returns {Object} Status configuration
 */
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.missing;
};

/**
 * Format expiry date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatExpiryDate = (date) => {
  if (!date) return 'Not Available';

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Get expiry message based on days remaining
 * @param {number} daysRemaining - Days until expiry
 * @returns {string} Human-readable expiry message
 */
export const getExpiryMessage = (daysRemaining) => {
  if (daysRemaining === null) return 'No expiry date';
  if (daysRemaining < 0) return `Expired ${Math.abs(daysRemaining)} days ago`;
  if (daysRemaining === 0) return 'Expires today';
  if (daysRemaining === 1) return 'Expires tomorrow';
  if (daysRemaining <= 7) return `Expires in ${daysRemaining} days`;
  if (daysRemaining <= 30) return `Expires in ${daysRemaining} days`;

  return `Valid for ${daysRemaining} days`;
};

/**
 * Get all document statuses for a vehicle
 * @param {Object} vehicle - Vehicle data
 * @returns {Object} Document statuses keyed by document type
 */
export const getAllDocumentStatuses = (vehicle) => {
  const statuses = {};

  Object.keys(DOCUMENT_TYPES).forEach(docType => {
    const config = DOCUMENT_TYPES[docType];
    const endDate = vehicle.rawData?.[config.endDateField] || vehicle[config.endDateField];

    statuses[docType] = {
      type: docType,
      label: config.label,
      icon: config.icon,
      endDate: endDate,
      daysRemaining: calculateDaysUntilExpiry(endDate),
      status: getDocumentStatus(endDate),
      statusConfig: getStatusConfig(getDocumentStatus(endDate)),
      message: getExpiryMessage(calculateDaysUntilExpiry(endDate)),
      formattedDate: formatExpiryDate(endDate)
    };
  });

  return statuses;
};

/**
 * Get document summary statistics
 * @param {Object} documentStatuses - Document statuses from getAllDocumentStatuses
 * @returns {Object} Summary statistics
 */
export const getDocumentSummary = (documentStatuses) => {
  const summary = {
    total: 0,
    expired: 0,
    critical: 0,
    warning: 0,
    valid: 0,
    missing: 0,
    needsAttention: 0  // expired + critical + warning
  };

  Object.values(documentStatuses).forEach(doc => {
    summary.total++;
    summary[doc.status]++;
  });

  summary.needsAttention = summary.expired + summary.critical + summary.warning;

  return summary;
};

/**
 * Sort documents by urgency (most urgent first)
 * @param {Object} documentStatuses - Document statuses from getAllDocumentStatuses
 * @returns {Array} Sorted array of documents
 */
export const sortDocumentsByUrgency = (documentStatuses) => {
  const urgencyOrder = {
    [DOCUMENT_STATUS.EXPIRED]: 1,
    [DOCUMENT_STATUS.CRITICAL]: 2,
    [DOCUMENT_STATUS.WARNING]: 3,
    [DOCUMENT_STATUS.MISSING]: 4,
    [DOCUMENT_STATUS.VALID]: 5
  };

  return Object.values(documentStatuses).sort((a, b) => {
    const urgencyDiff = urgencyOrder[a.status] - urgencyOrder[b.status];
    if (urgencyDiff !== 0) return urgencyDiff;

    // If same urgency, sort by days remaining (ascending)
    if (a.daysRemaining !== null && b.daysRemaining !== null) {
      return a.daysRemaining - b.daysRemaining;
    }

    return 0;
  });
};

/**
 * Check if vehicle has any document issues
 * @param {Object} vehicle - Vehicle data
 * @returns {boolean} True if has issues
 */
export const hasDocumentIssues = (vehicle) => {
  const statuses = getAllDocumentStatuses(vehicle);
  const summary = getDocumentSummary(statuses);
  return summary.needsAttention > 0;
};

/**
 * Get priority level for vehicle based on documents
 * @param {Object} vehicle - Vehicle data
 * @returns {string} Priority level (high, medium, low)
 */
export const getVehiclePriority = (vehicle) => {
  const statuses = getAllDocumentStatuses(vehicle);
  const summary = getDocumentSummary(statuses);

  if (summary.expired > 0) return 'high';
  if (summary.critical > 0) return 'high';
  if (summary.warning > 0) return 'medium';

  return 'low';
};