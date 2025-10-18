import { useState, useCallback } from 'react'

/**
 * Custom hook for date validation in vehicle forms
 * Ensures end dates cannot be before start dates
 */
export const useDateValidation = () => {
  const [dateValidation, setDateValidation] = useState({
    rc: { startDate: null, endDate: null, isValid: true, error: null },
    insurance: { startDate: null, endDate: null, isValid: true, error: null },
    permit: { startDate: null, endDate: null, isValid: true, error: null },
    puc: { startDate: null, endDate: null, isValid: true, error: null }
  })

  /**
   * Validate a date pair (start and end date)
   * @param {string} documentType - Type of document (rc, insurance, permit, puc)
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {object} Validation result with isValid and error message
   */
  const validateDatePair = useCallback((documentType, startDate, endDate) => {
    if (!startDate || !endDate) {
      return { isValid: true, error: null }
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid date format' }
    }

    if (end < start) {
      return { 
        isValid: false, 
        error: `End date cannot be before start date (${startDate})` 
      }
    }

    return { isValid: true, error: null }
  }, [])

  /**
   * Update start date and validate against existing end date
   * @param {string} documentType - Type of document
   * @param {string} startDate - New start date
   */
  const updateStartDate = useCallback((documentType, startDate) => {
    setDateValidation(prev => {
      const current = prev[documentType]
      const validation = validateDatePair(documentType, startDate, current.endDate)
      
      return {
        ...prev,
        [documentType]: {
          startDate,
          endDate: current.endDate,
          isValid: validation.isValid,
          error: validation.error
        }
      }
    })
  }, [validateDatePair])

  /**
   * Update end date and validate against existing start date
   * @param {string} documentType - Type of document
   * @param {string} endDate - New end date
   */
  const updateEndDate = useCallback((documentType, endDate) => {
    setDateValidation(prev => {
      const current = prev[documentType]
      const validation = validateDatePair(documentType, current.startDate, endDate)
      
      return {
        ...prev,
        [documentType]: {
          startDate: current.startDate,
          endDate,
          isValid: validation.isValid,
          error: validation.error
        }
      }
    })
  }, [validateDatePair])

  /**
   * Get minimum date for end date picker
   * @param {string} documentType - Type of document
   * @returns {string|null} Minimum date in YYYY-MM-DD format or null
   */
  const getMinEndDate = useCallback((documentType) => {
    const startDate = dateValidation[documentType]?.startDate
    return startDate || null
  }, [dateValidation])

  /**
   * Check if all date validations are valid
   * @returns {boolean} True if all validations pass
   */
  const isAllValid = useCallback(() => {
    return Object.values(dateValidation).every(validation => validation.isValid)
  }, [dateValidation])

  /**
   * Get all validation errors
   * @returns {Array} Array of error messages
   */
  const getAllErrors = useCallback(() => {
    return Object.entries(dateValidation)
      .filter(([_, validation]) => !validation.isValid && validation.error)
      .map(([documentType, validation]) => ({
        documentType,
        error: validation.error
      }))
  }, [dateValidation])

  /**
   * Reset validation for a specific document type
   * @param {string} documentType - Type of document
   */
  const resetValidation = useCallback((documentType) => {
    setDateValidation(prev => ({
      ...prev,
      [documentType]: { startDate: null, endDate: null, isValid: true, error: null }
    }))
  }, [])

  /**
   * Reset all validations
   */
  const resetAllValidations = useCallback(() => {
    setDateValidation({
      rc: { startDate: null, endDate: null, isValid: true, error: null },
      insurance: { startDate: null, endDate: null, isValid: true, error: null },
      permit: { startDate: null, endDate: null, isValid: true, error: null },
      puc: { startDate: null, endDate: null, isValid: true, error: null }
    })
  }, [])

  return {
    dateValidation,
    updateStartDate,
    updateEndDate,
    getMinEndDate,
    isAllValid,
    getAllErrors,
    resetValidation,
    resetAllValidations,
    validateDatePair
  }
}

export default useDateValidation
