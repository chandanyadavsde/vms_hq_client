import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, CreditCard, Users, UserPlus, Eye } from 'lucide-react';

/**
 * DriverAssignmentSection Component
 * Displays driver assignment and contact persons information
 */
const DriverAssignmentSection = ({ vehicle, onViewDriver, onChangeDriver, onAddContact }) => {
  const driver = vehicle?.assignedDriver || vehicle?.rawData?.assignedDriver;
  const contactPersons = vehicle?.contactPersons || vehicle?.rawData?.contactPersons || [];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl p-5 border-2 border-purple-300 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-white" />
          </span>
          <h3 className="text-lg font-bold text-purple-900">Driver Assignment</h3>
        </div>
        {driver && onChangeDriver && (
          <button
            onClick={onChangeDriver}
            className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline"
          >
            Change
          </button>
        )}
      </div>

      {/* Driver Info */}
      {driver ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border-2 border-purple-200 mb-4"
        >
          <div className="flex items-start gap-3">
            {/* Driver Avatar Placeholder */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {driver.custrecord_driver_name?.[0]?.toUpperCase() || 'D'}
            </div>

            {/* Driver Details */}
            <div className="flex-1">
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {driver.custrecord_driver_name || 'Unknown Driver'}
                </h4>
                {driver.custrecord_license_category_ag && (
                  <p className="text-sm text-slate-600">
                    {driver.custrecord_license_category_ag}
                  </p>
                )}
              </div>

              {/* Driver Info Grid */}
              <div className="mt-2 space-y-2">
                {driver.custrecord_driving_license_no && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">
                      License: <span className="font-semibold">{driver.custrecord_driving_license_no}</span>
                    </span>
                  </div>
                )}

                {driver.custrecord_driver_mobile_no && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <a
                      href={`tel:${driver.custrecord_driver_mobile_no}`}
                      className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                    >
                      {driver.custrecord_driver_mobile_no}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center gap-2">
                {onViewDriver && (
                  <button
                    onClick={() => onViewDriver(driver)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-700 hover:text-purple-800 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                )}
                <a
                  href={`tel:${driver.custrecord_driver_mobile_no}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 hover:text-green-800 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-5 border-2 border-dashed border-slate-300 text-center mb-4"
        >
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-800 mb-1">No Driver Assigned</p>
          <p className="text-sm text-slate-600 mb-3">Assign a driver to this vehicle</p>
          {onChangeDriver && (
            <button
              onClick={onChangeDriver}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 active:from-purple-700 active:to-purple-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-100"
            >
              <UserPlus className="w-4 h-4" />
              Assign Driver
            </button>
          )}
        </motion.div>
      )}

      {/* Contact Persons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            <h4 className="text-sm font-bold text-slate-800">Contact Persons</h4>
            {contactPersons.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-sm font-semibold">
                {contactPersons.length}
              </span>
            )}
          </div>
          {onAddContact && (
            <button
              onClick={onAddContact}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline"
            >
              + Add
            </button>
          )}
        </div>

        {contactPersons.length > 0 ? (
          <div className="space-y-2">
            {contactPersons.map((contact, index) => (
              <motion.div
                key={contact._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-3 border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                      {contact.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {contact.name || 'Unknown'}
                      </p>
                      {contact.type && (
                        <p className="text-sm text-slate-600 capitalize">
                          {contact.type.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 hover:text-green-800 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                      title={`Call ${contact.name}`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-3 border border-dashed border-slate-200 text-center">
            <Users className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-600">No contact persons added</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverAssignmentSection;