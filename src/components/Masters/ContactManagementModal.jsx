import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, Phone, Plus, CheckCircle, AlertCircle, Loader2, Car, UserCheck, Trash2 } from 'lucide-react'
import baseApiService from '../../services/BaseApiService'

const ContactManagementModal = ({ vehicle, onClose, onContactUpdate }) => {
  // Debug: Log the vehicle data
  console.log('🔍 ContactManagementModal - Vehicle data:', vehicle)
  console.log('🔍 ContactManagementModal - ContactPersons:', vehicle?.contactPersons)
  
  // Initialize contacts from vehicle data or empty array
  const [contacts, setContacts] = useState(() => {
    if (!vehicle?.contactPersons || !Array.isArray(vehicle.contactPersons)) {
      console.log('📝 No contactPersons found, using empty array')
      return []
    }
    
    console.log('📝 Found contactPersons:', vehicle.contactPersons)
    
    // Transform API data to our component format
    return vehicle.contactPersons.map(contact => ({
      id: contact._id || contact.id || Date.now() + Math.random(),
      type: contact.type || 'other',
      name: contact.name || 'Unknown',
      phone: contact.phone || 'N/A',
      licenceNumber: contact.licenceNumber || '',
      addedDate: contact.addedDate,
      _id: contact._id
    }))
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({ 
    type: 'other', 
    name: '', 
    phone: '', 
    licenceNumber: '' 
  })

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      setError('Name and phone are required')
      return
    }

    // Validate licence number for secondary drivers
    if (newContact.type === 'secondary_driver' && !newContact.licenceNumber) {
      setError('Licence number is required for secondary drivers')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      console.log('🔄 Adding contact:', newContact)
      
      // Call API to add contact using BaseApiService
      const result = await baseApiService.post(
        `/vms/vehicle/${vehicle.vehicleNumber}/contact-person`,
        {
          type: newContact.type,
          name: newContact.name,
          phone: newContact.phone,
          licenceNumber: newContact.licenceNumber || null
        }
      )
      console.log('✅ Contact added successfully:', result)
      
      // Update local state with new contact
      const newContactData = {
        id: result.vehicle.contactPersons[result.vehicle.contactPersons.length - 1]._id,
        type: newContact.type,
        name: newContact.name,
        phone: newContact.phone,
        licenceNumber: newContact.licenceNumber || '',
        addedDate: new Date().toISOString(),
        _id: result.vehicle.contactPersons[result.vehicle.contactPersons.length - 1]._id
      }
      
      setContacts([...contacts, newContactData])
      setNewContact({ type: 'other', name: '', phone: '', licenceNumber: '' })
      setShowAddForm(false)
      setSuccess(`Contact ${newContact.name} added successfully!`)
      
      // Notify parent component to refresh vehicle data
      if (onContactUpdate) {
        onContactUpdate(vehicle.vehicleNumber, result.vehicle)
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err) {
      console.error('❌ Error adding contact:', err)
      setError(err.message || 'Failed to add contact')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveContact = async (contactId) => {
    if (!contactId) {
      setError('Contact ID not found')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('🔄 Removing contact:', contactId)
      
      // Call API to remove contact
      await baseApiService.delete(
        `/vms/vehicle/${vehicle.vehicleNumber}/contact-person/${contactId}`
      )
      
      // Update local state
      setContacts(contacts.filter(contact => contact._id !== contactId))
      setSuccess('Contact removed successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err) {
      console.error('❌ Error removing contact:', err)
      setError(err.message || 'Failed to remove contact')
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      return 'Unknown'
    }
  }

  if (!vehicle) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        className="relative bg-white rounded-lg p-3 max-w-lg w-full border border-slate-200 shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Contact Management</h2>
              <p className="text-slate-600 text-xs">Vehicle: {vehicle.vehicleNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-700 text-xs">{success}</p>
            </div>
          </motion.div>
        )}
        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          </motion.div>
        )}
        
        {/* Current Contacts */}
        <div className="space-y-2 mb-3">
          <h3 className="text-xs font-semibold text-slate-800">Current Contacts</h3>
          {contacts.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-2">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-xs">No contacts configured</p>
              <p className="text-slate-500 text-xs">Add emergency and backup contacts</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      contact.type === 'secondary_driver' 
                        ? 'bg-blue-100' 
                        : 'bg-orange-100'
                    }`}>
                      {contact.type === 'secondary_driver' ? (
                        <Car className="w-3 h-3 text-blue-600" />
                      ) : (
                        <User className="w-3 h-3 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-800 text-xs">{contact.name}</div>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          contact.type === 'secondary_driver'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {contact.type === 'secondary_driver' ? 'Driver' : 'Contact'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </div>
                      {contact.type === 'secondary_driver' && contact.licenceNumber && (
                        <div className="text-xs text-slate-600">
                          Licence: {contact.licenceNumber}
                        </div>
                      )}
                      {contact.addedDate && (
                        <div className="text-xs text-slate-500">
                          Added: {formatDate(contact.addedDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveContact(contact._id)}
                    disabled={loading}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Contact */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 p-2 bg-orange-100 hover:bg-orange-200 border border-orange-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-orange-700 text-xs">Add New Contact</span>
          </button>
        ) : (
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-2 text-xs">Add New Contact</h4>
            <div className="space-y-2">
              {/* Contact Type Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contact Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewContact({ ...newContact, type: 'other', licenceNumber: '' })}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      newContact.type === 'other'
                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    Other Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewContact({ ...newContact, type: 'secondary_driver', licenceNumber: '' })}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      newContact.type === 'secondary_driver'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Car className="w-3 h-3" />
                    Secondary Driver
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Contact Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500 text-xs"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500 text-xs"
              />
              
              {/* Licence Number - Only for Secondary Drivers */}
              {newContact.type === 'secondary_driver' && (
                <input
                  type="text"
                  placeholder="Driving Licence Number *"
                  value={newContact.licenceNumber}
                  onChange={(e) => setNewContact({ ...newContact, licenceNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddContact}
                  disabled={loading}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {loading ? 'Adding...' : 'Add Contact'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setError('')
                    setNewContact({ type: 'other', name: '', phone: '', licenceNumber: '' })
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs">
                {contacts.length} contact{contacts.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ContactManagementModal
