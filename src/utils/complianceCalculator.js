/**
 * Compliance Score Calculator
 * Calculates vehicle compliance score based on documents, driver, and operational status
 */

/**
 * Check if a document is valid (not expired)
 * @param {string|Date} endDate - Document expiry date
 * @returns {boolean} True if document is valid
 */
export const isDocumentValid = (endDate) => {
  if (!endDate) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(endDate);
    expiry.setHours(0, 0, 0, 0);

    return expiry >= today;
  } catch (error) {
    console.error('Error validating document:', error);
    return false;
  }
};

/**
 * Calculate compliance score for a vehicle
 * @param {Object} vehicle - Vehicle data
 * @returns {Object} Compliance score details
 */
export const calculateComplianceScore = (vehicle) => {
  const rawData = vehicle?.rawData || vehicle;

  let score = 0;
  const breakdown = {
    documents: { score: 0, max: 70, details: [] },
    operational: { score: 0, max: 30, details: [] }
  };

  // ==========================================
  // DOCUMENTS (70 points)
  // ==========================================

  // Insurance (25 points) - Most Critical
  const insuranceValid = isDocumentValid(rawData?.custrecord_insurance_end_date_ag);
  if (insuranceValid) {
    breakdown.documents.score += 25;
    breakdown.documents.details.push({
      name: 'Insurance',
      status: 'valid',
      points: 25,
      icon: '🛡️'
    });
  } else {
    breakdown.documents.details.push({
      name: 'Insurance',
      status: 'invalid',
      points: 0,
      icon: '❌',
      issue: 'Expired or missing'
    });
  }

  // RC Certificate (20 points)
  const rcValid = isDocumentValid(rawData?.custrecord_rc_end_date);
  if (rcValid) {
    breakdown.documents.score += 20;
    breakdown.documents.details.push({
      name: 'RC Certificate',
      status: 'valid',
      points: 20,
      icon: '📋'
    });
  } else {
    breakdown.documents.details.push({
      name: 'RC Certificate',
      status: 'invalid',
      points: 0,
      icon: '❌',
      issue: 'Expired or missing'
    });
  }

  // Permit (15 points)
  const permitValid = isDocumentValid(rawData?.custrecord_permit_end_date);
  if (permitValid) {
    breakdown.documents.score += 15;
    breakdown.documents.details.push({
      name: 'Permit',
      status: 'valid',
      points: 15,
      icon: '📜'
    });
  } else {
    breakdown.documents.details.push({
      name: 'Permit',
      status: 'invalid',
      points: 0,
      icon: '❌',
      issue: 'Expired or missing'
    });
  }

  // PUC (10 points)
  const pucValid = isDocumentValid(rawData?.custrecord_puc_end_date_ag);
  if (pucValid) {
    breakdown.documents.score += 10;
    breakdown.documents.details.push({
      name: 'PUC',
      status: 'valid',
      points: 10,
      icon: '🔍'
    });
  } else {
    breakdown.documents.details.push({
      name: 'PUC',
      status: 'invalid',
      points: 0,
      icon: '❌',
      issue: 'Expired or missing'
    });
  }

  // Fitness (5 points) - Bonus
  const fitnessValid = isDocumentValid(rawData?.custrecord_fitness_end_date);
  if (fitnessValid) {
    breakdown.documents.score += 5;
    breakdown.documents.details.push({
      name: 'Fitness',
      status: 'valid',
      points: 5,
      icon: '✅'
    });
  } else if (rawData?.custrecord_fitness_end_date) {
    // Only show as issue if fitness date exists but is expired
    breakdown.documents.details.push({
      name: 'Fitness',
      status: 'invalid',
      points: 0,
      icon: '⚠️',
      issue: 'Expired'
    });
  }

  // ==========================================
  // OPERATIONAL (30 points)
  // ==========================================

  // Driver Assigned (15 points)
  const hasDriver = rawData?.assignedDriver && rawData?.assignedDriver?.custrecord_driver_name;
  if (hasDriver) {
    breakdown.operational.score += 15;
    breakdown.operational.details.push({
      name: 'Driver Assigned',
      status: 'valid',
      points: 15,
      icon: '👤',
      value: rawData.assignedDriver.custrecord_driver_name
    });
  } else {
    breakdown.operational.details.push({
      name: 'Driver Assigned',
      status: 'invalid',
      points: 0,
      icon: '❌',
      issue: 'No driver assigned'
    });
  }

  // GPS Tracking (10 points)
  const hasGPS = rawData?.custrecord_vehicle_master_gps_available === true;
  if (hasGPS) {
    breakdown.operational.score += 10;
    breakdown.operational.details.push({
      name: 'GPS Tracking',
      status: 'valid',
      points: 10,
      icon: '📍'
    });
  } else {
    breakdown.operational.details.push({
      name: 'GPS Tracking',
      status: 'invalid',
      points: 0,
      icon: '❌',
      issue: 'GPS not available'
    });
  }

  // Data Completeness (5 points) - Chassis & Engine numbers
  const hasChassisAndEngine =
    rawData?.custrecord_chassis_number &&
    rawData?.custrecord_engine_number_ag;
  if (hasChassisAndEngine) {
    breakdown.operational.score += 5;
    breakdown.operational.details.push({
      name: 'Vehicle Data',
      status: 'valid',
      points: 5,
      icon: '📊',
      value: 'Complete'
    });
  } else {
    breakdown.operational.details.push({
      name: 'Vehicle Data',
      status: 'invalid',
      points: 0,
      icon: '⚠️',
      issue: 'Chassis/Engine number missing'
    });
  }

  // ==========================================
  // TOTAL SCORE & GRADE
  // ==========================================

  score = breakdown.documents.score + breakdown.operational.score;
  const maxScore = breakdown.documents.max + breakdown.operational.max;
  const percentage = Math.round((score / maxScore) * 100);

  let grade, gradeLabel, gradeColor, gradeBgColor;
  if (percentage >= 90) {
    grade = 'A';
    gradeLabel = 'Excellent';
    gradeColor = 'text-green-700';
    gradeBgColor = 'bg-green-100';
  } else if (percentage >= 75) {
    grade = 'B';
    gradeLabel = 'Good';
    gradeColor = 'text-green-600';
    gradeBgColor = 'bg-green-50';
  } else if (percentage >= 60) {
    grade = 'C';
    gradeLabel = 'Fair';
    gradeColor = 'text-orange-600';
    gradeBgColor = 'bg-orange-50';
  } else {
    grade = 'D';
    gradeLabel = 'Poor';
    gradeColor = 'text-red-700';
    gradeBgColor = 'bg-red-100';
  }

  // Count issues
  const issues = [
    ...breakdown.documents.details.filter(d => d.status === 'invalid'),
    ...breakdown.operational.details.filter(d => d.status === 'invalid')
  ];

  return {
    score,
    maxScore,
    percentage,
    grade,
    gradeLabel,
    gradeColor,
    gradeBgColor,
    breakdown,
    issues,
    hasIssues: issues.length > 0
  };
};

/**
 * Get compliance status message
 * @param {Object} complianceData - Result from calculateComplianceScore
 * @returns {string} Status message
 */
export const getComplianceMessage = (complianceData) => {
  const { percentage, issues } = complianceData;

  if (percentage === 100) {
    return '🎉 Perfect compliance! All checks passed.';
  } else if (percentage >= 90) {
    return `✅ Excellent compliance. ${issues.length} minor ${issues.length === 1 ? 'issue' : 'issues'}.`;
  } else if (percentage >= 75) {
    return `👍 Good compliance. ${issues.length} ${issues.length === 1 ? 'issue' : 'issues'} to address.`;
  } else if (percentage >= 60) {
    return `⚠️ Fair compliance. ${issues.length} ${issues.length === 1 ? 'issue needs' : 'issues need'} attention.`;
  } else {
    return `❌ Poor compliance. ${issues.length} critical ${issues.length === 1 ? 'issue' : 'issues'} found.`;
  }
};

/**
 * Get priority level for compliance score
 * @param {number} percentage - Compliance percentage
 * @returns {string} Priority level
 */
export const getCompliancePriority = (percentage) => {
  if (percentage >= 90) return 'low';
  if (percentage >= 75) return 'medium';
  if (percentage >= 60) return 'high';
  return 'critical';
};
