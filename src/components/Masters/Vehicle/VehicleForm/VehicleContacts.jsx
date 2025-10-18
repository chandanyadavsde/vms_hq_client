import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Plus, X, Edit2, Users } from 'lucide-react'
import { getThemeColors } from '../../../../utils/theme.js'

const VehicleContacts = ({ formData, setFormData, currentTheme = 'teal' }) => {
  const themeColors = getThemeColors(currentTheme)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [editingContactId, setEditingContactId] = useState(null)
  const [newContact, setNewContact] = useState({ name: '', phone: '' })

  const handleInputChange = (field, value) => {
    setFormData({
      [field]: value
    })
  }

  const handleAddContact = () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      const contactToAdd = {
        id: Date.now().toString(),
        name: newContact.name.trim(),
        phone: newContact.phone.trim(),
        addedDate: new Date().toISOString()
      }

      const currentContacts = formData.contactPersons || []
      handleInputChange('contactPersons', [...currentContacts, contactToAdd])
      
      setNewContact({ name: '', phone: '' })
      setIsAddingContact(false)
    }
  }

  const handleEditContact = (contactId) => {
    const contact = (formData.contactPersons || []).find(c => c.id === contactId)
    if (contact) {
      setNewContact({ name: contact.name, phone: contact.phone })
      setEditingContactId(contactId)
      setIsAddingContact(true)
    }
  }

  const handleUpdateContact = () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      const currentContacts = formData.contactPersons || []
      const updatedContacts = currentContacts.map(contact => 
        contact.id === editingContactId 
          ? { ...contact, name: newContact.name.trim(), phone: newContact.phone.trim() }
          : contact
      )

      handleInputChange('contactPersons', updatedContacts)
      
      setNewContact({ name: '', phone: '' })
      setIsAddingContact(false)
      setEditingContactId(null)
    }
  }

  const handleRemoveContact = (contactId) => {
    const currentContacts = formData.contactPersons || []
    const updatedContacts = currentContacts.filter(contact => contact.id !== contactId)
    handleInputChange('contactPersons', updatedContacts)
  }

  const handleCancelAdd = () => {
    setNewContact({ name: '', phone: '' })
    setIsAddingContact(false)
    setEditingContactId(null)
  }

  const formatPhoneNumber = (phone) => {
    // Basic phone number formatting
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
    }
    return phone
  }

  const contacts = formData.contactPersons || []

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Contact Persons</h3>
        <p className="text-sm text-gray-600">Add contact persons for this vehicle</p>
      </div>

      {/* Add Contact Button */}
      {!isAddingContact && (
        <motion.button
          onClick={() => setIsAddingContact(true)}
          className="w-full p-4 border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-xl text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="w-5 h-5" />
          Add Contact Person
        </motion.button>
      )}

      {/* Add/Edit Contact Form */}
      <AnimatePresence>
        {isAddingContact && (
          <motion.div
            className="bg-blue-50 rounded-xl p-6 border border-blue-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              {editingContactId ? 'Edit Contact Person' : 'Add New Contact Person'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <User className="w-4 h-4 text-blue-500" />
                  Name *
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Contact Person Name"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-medium">
                  <Phone className="w-4 h-4 text-blue-500" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g., +91-9876543210"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={editingContactId ? handleUpdateContact : handleAddContact}
                disabled={!newContact.name.trim() || !newContact.phone.trim()}
                className={`px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  newContact.name.trim() && newContact.phone.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={newContact.name.trim() && newContact.phone.trim() ? { scale: 1.02 } : {}}
                whileTap={newContact.name.trim() && newContact.phone.trim() ? { scale: 0.98 } : {}}
              >
                <Plus className="w-4 h-4" />
                {editingContactId ? 'Update Contact' : 'Add Contact'}
              </motion.button>

              <motion.button
                onClick={handleCancelAdd}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact List */}
      {contacts.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Contact Persons ({contacts.length})
          </h4>
          
          <div className="space-y-3">
            <AnimatePresence>
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id || index}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="text-gray-800 font-medium">{contact.name}</h5>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {formatPhoneNumber(contact.phone)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleEditContact(contact.id)}
                        className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleRemoveContact(contact.id)}
                        className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </motion.button>
                    </div>
                  </div>
                  
                  {contact.addedDate && (
                    <div className="mt-2 text-xs text-gray-500">
                      Added: {new Date(contact.addedDate).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {contacts.length === 0 && !isAddingContact && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-gray-800 font-medium mb-2">No Contact Persons Added</h4>
          <p className="text-gray-600 text-sm mb-4">
            Add contact persons to help with vehicle communication and coordination.
          </p>
        </motion.div>
      )}

      {/* Information Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Users className="w-3 h-3 text-blue-600" />
          </div>
          <div>
            <h4 className="text-blue-800 font-medium mb-1">Contact Management</h4>
            <p className="text-blue-700 text-sm">
              Contact persons help in vehicle coordination and emergency communication. 
              You can add multiple contacts and edit them anytime.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VehicleContacts
