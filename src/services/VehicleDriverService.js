import baseApiService from './BaseApiService.js'

class VehicleDriverService {
  // Create vehicle with driver and contacts in a single API call
  async createVehicleWithDriver(data, files = {}) {
    try {
      console.log('🚀 VehicleDriverService - Creating vehicle with driver:', data)
      console.log('📁 Files to upload:', files)

      // Prepare FormData for file uploads
      const formData = new FormData()

      // Add vehicle data
      Object.keys(data).forEach(key => {
        if (key !== 'driver' && key !== 'contactPersons') {
          if (typeof data[key] === 'object' && data[key] !== null) {
            formData.append(key, JSON.stringify(data[key]))
          } else {
            formData.append(key, data[key] || '')
          }
        }
      })

      // Add driver data
      if (data.driver) {
        Object.keys(data.driver).forEach(key => {
          formData.append(`driver[${key}]`, data.driver[key] || '')
        })
      }

      // Add contact persons
      if (data.contactPersons && data.contactPersons.length > 0) {
        formData.append('contactPersons', JSON.stringify(data.contactPersons))
      }

      // Add files
      Object.keys(files).forEach(category => {
        Object.keys(files[category]).forEach(fieldName => {
          const file = files[category][fieldName]
          if (file) {
            if (Array.isArray(file)) {
              file.forEach((f, index) => {
                formData.append(fieldName, f)
              })
            } else {
              formData.append(fieldName, file)
            }
          }
        })
      })

      console.log('📤 Sending FormData to API...')
      
      const response = await baseApiService.post('/vms/vehicle-with-driver', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ VehicleDriverService - Success:', response)
      return response

    } catch (error) {
      console.error('❌ VehicleDriverService - Error:', error)
      throw error
    }
  }

  // Get vehicle with driver details
  async getVehicleWithDriver(vehicleId) {
    try {
      const response = await baseApiService.get(`/vms/vehicle/${vehicleId}`)
      return response
    } catch (error) {
      console.error('Error fetching vehicle with driver:', error)
      throw error
    }
  }

  // Update vehicle with driver
  async updateVehicleWithDriver(vehicleId, data, files = {}) {
    try {
      const formData = new FormData()

      // Add vehicle data
      Object.keys(data).forEach(key => {
        if (key !== 'driver' && key !== 'contactPersons') {
          if (typeof data[key] === 'object' && data[key] !== null) {
            formData.append(key, JSON.stringify(data[key]))
          } else {
            formData.append(key, data[key] || '')
          }
        }
      })

      // Add driver data
      if (data.driver) {
        Object.keys(data.driver).forEach(key => {
          formData.append(`driver[${key}]`, data.driver[key] || '')
        })
      }

      // Add contact persons
      if (data.contactPersons && data.contactPersons.length > 0) {
        formData.append('contactPersons', JSON.stringify(data.contactPersons))
      }

      // Add files
      Object.keys(files).forEach(category => {
        Object.keys(files[category]).forEach(fieldName => {
          const file = files[category][fieldName]
          if (file) {
            if (Array.isArray(file)) {
              file.forEach((f, index) => {
                formData.append(fieldName, f)
              })
            } else {
              formData.append(fieldName, file)
            }
          }
        })
      })

      const response = await baseApiService.put(`/vms/vehicle/${vehicleId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response
    } catch (error) {
      console.error('Error updating vehicle with driver:', error)
      throw error
    }
  }

  // Add contact person to vehicle
  async addContactPerson(vehicleNumber, contactData) {
    try {
      const response = await baseApiService.post(
        `/vms/vehicle/${vehicleNumber}/contact-person`,
        contactData
      )
      return response
    } catch (error) {
      console.error('Error adding contact person:', error)
      throw error
    }
  }

  // Remove contact person from vehicle
  async removeContactPerson(vehicleNumber, contactId) {
    try {
      const response = await baseApiService.delete(
        `/vms/vehicle/${vehicleNumber}/contact-person/${contactId}`
      )
      return response
    } catch (error) {
      console.error('Error removing contact person:', error)
      throw error
    }
  }
}

export default new VehicleDriverService()