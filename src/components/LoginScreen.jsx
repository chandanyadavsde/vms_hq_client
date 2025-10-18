import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LoginScreen = ({ onLoginSuccess }) => {
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(300) // 5 minutes in seconds
  const [otpSentTime, setOtpSentTime] = useState(null)

  // Auto-focus OTP inputs
  const otpRefs = Array(6).fill(0).map(() => React.useRef())

  useEffect(() => {
    if (step === 'otp' && resendTimer === 0) {
      setResendTimer(60) // 1 minute for resend
      setOtpExpiryTimer(300) // 5 minutes for OTP expiry
      setOtpSentTime(Date.now())
    }
  }, [step])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // OTP Expiry Timer
  useEffect(() => {
    if (otpExpiryTimer > 0 && step === 'otp') {
      const timer = setTimeout(() => {
        setOtpExpiryTimer(otpExpiryTimer - 1)
        if (otpExpiryTimer === 1) {
          setError('OTP has expired. Please request a new one.')
          setOtp(['', '', '', '', '', ''])
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [otpExpiryTimer, step])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // const response = await fetch('http://localhost:5000/vms/login', {
      const response = await fetch('http://3.111.57.77:5000/vms/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email
        })
      })

      const data = await response.json()

      if (data.success) {
        setStep('otp')
      } else {
        setError(data.message || 'Login failed. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return
    
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://3.111.57.77:5000/vms/otpverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          otp: otpString
        })
      })

      const data = await response.json()

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('vms_token', data.token)
        localStorage.setItem('vms_user', JSON.stringify(data.user))
        
        onLoginSuccess({
          email: data.user.email,
          user: data.user.name,
          role: data.user.role,
          plant: data.user.plant,
          token: data.token,
          userData: data.user
        })
      } else {
        setError(data.message || 'Invalid OTP. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendTimer(60) // 1 minute
    setOtpExpiryTimer(300) // Reset to 5 minutes
    setOtpSentTime(Date.now())
    setError('')
    setOtp(['', '', '', '', '', '']) // Clear previous OTP
    
    try {
      const response = await fetch('http://3.111.57.77:5000/vms/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email
        })
      })

      const data = await response.json()

      if (data.success) {
        // Show success message briefly
        setError('')
        setSuccess('New OTP sent successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Multi-Layer Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-transparent to-green-100/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/10 via-transparent to-purple-100/10"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-yellow-100/5 via-transparent to-pink-100/5"></div>
      
      {/* Animated Wind Turbines */}
      <div className="absolute top-10 left-10 w-16 h-16 opacity-30">
        <div className="relative w-full h-full">
          {/* Wind Turbine Base */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-orange-400"></div>
          {/* Wind Turbine Blades */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-orange-500 animate-spin" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-orange-500 animate-spin" style={{ animationDuration: '3s', transform: 'rotate(60deg)' }}></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-orange-500 animate-spin" style={{ animationDuration: '3s', transform: 'rotate(120deg)' }}></div>
        </div>
      </div>
      
      <div className="absolute top-20 right-20 w-20 h-20 opacity-25">
        <div className="relative w-full h-full">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-green-400"></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-green-500 animate-spin" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-green-500 animate-spin" style={{ animationDuration: '4s', transform: 'rotate(60deg)' }}></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-green-500 animate-spin" style={{ animationDuration: '4s', transform: 'rotate(120deg)' }}></div>
        </div>
      </div>
      
      <div className="absolute bottom-20 left-1/4 w-12 h-12 opacity-35">
        <div className="relative w-full h-full">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-10 bg-orange-400"></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-orange-500 animate-spin" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-orange-500 animate-spin" style={{ animationDuration: '2.5s', transform: 'rotate(60deg)' }}></div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-orange-500 animate-spin" style={{ animationDuration: '2.5s', transform: 'rotate(120deg)' }}></div>
        </div>
      </div>
      
      {/* Logistics Elements - Trucks */}
      <div className="absolute bottom-10 right-1/3 w-24 h-12 opacity-30">
        <div className="relative w-full h-full">
          {/* Truck Body */}
          <div className="absolute bottom-0 left-0 w-16 h-8 bg-orange-400 rounded-lg"></div>
          {/* Truck Cabin */}
          <div className="absolute bottom-0 right-0 w-8 h-6 bg-orange-500 rounded-l-lg"></div>
          {/* Wheels */}
          <div className="absolute bottom-0 left-2 w-3 h-3 bg-gray-700 rounded-full"></div>
          <div className="absolute bottom-0 right-2 w-3 h-3 bg-gray-700 rounded-full"></div>
          {/* Wind Turbine on Truck */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-green-400"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-green-500 animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>
      </div>
      
      {/* Floating Energy Particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-40"></div>
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-orange-500 rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Grid Pattern for Logistics */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,165,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,165,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Floating Data Points */}
      <div className="absolute top-1/6 left-1/6 w-3 h-3 bg-orange-200/20 rounded-full animate-pulse"></div>
      <div className="absolute top-2/6 right-1/6 w-2 h-2 bg-green-200/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/6 left-2/6 w-2.5 h-2.5 bg-orange-200/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Energy Flow Lines */}
      <div className="absolute top-1/4 left-0 w-1 h-32 bg-gradient-to-b from-orange-400/30 to-transparent animate-pulse"></div>
      <div className="absolute bottom-1/4 right-0 w-1 h-24 bg-gradient-to-t from-green-400/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Floating Clouds */}
      <div className="absolute top-10 left-1/3 w-16 h-8 bg-orange-100/20 rounded-full blur-sm animate-pulse"></div>
      <div className="absolute top-20 right-1/4 w-12 h-6 bg-green-100/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Main Login Container */}
      <motion.div 
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg">Sign in to your VMS account</p>
        </div>

        {/* Login Form */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-orange-200/30 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Enhanced Multi-Layer Texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-green-50/30 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 via-transparent to-purple-50/20 rounded-3xl"></div>
          
          {/* Subtle Animated Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-green-400 to-blue-400 opacity-60 animate-pulse rounded-t-3xl"></div>
          
          {/* Glass Effect Border */}
          <div className="absolute inset-0 rounded-3xl border border-orange-200/40 shadow-inner"></div>
          
          {/* Form Content */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.form
                  key="email"
                  onSubmit={handleEmailSubmit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Email Input */}
                  <div className="space-y-2">
                                         <label className="text-gray-700 text-sm font-medium">Email Address</label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m6.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                         </svg>
                       </div>
                       <input
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-orange-200/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                         placeholder="Enter your email address"
                         disabled={isLoading}
                       />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      {success}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Button Background Texture */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending OTP...
                        </>
                      ) : (
                        'Continue with Email'
                      )}
                    </span>
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp"
                  onSubmit={handleOtpSubmit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* OTP Instructions */}
                  <div className="text-center space-y-2">
                    <p className="text-gray-600">We've sent a 6-digit code to</p>
                    <p className="text-gray-900 font-semibold">{email}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-orange-600 font-medium">
                        OTP expires in {Math.floor(otpExpiryTimer / 60)}:{(otpExpiryTimer % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="text-gray-700 text-sm font-medium">Enter OTP</label>
                    <div className="flex justify-center space-x-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={(e) => {
                            e.preventDefault()
                            const pastedData = e.clipboardData.getData('text').slice(0, 6)
                            if (/^\d{6}$/.test(pastedData)) {
                              const newOtp = [...otp]
                              pastedData.split('').forEach((char, i) => {
                                if (i < 6) newOtp[i] = char
                              })
                              setOtp(newOtp)
                              otpRefs[5].current?.focus()
                            }
                          }}
                          className="w-12 h-12 text-center text-lg font-semibold bg-white/80 backdrop-blur-sm border border-orange-200/40 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          disabled={isLoading || otpExpiryTimer === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      {success}
                    </motion.div>
                  )}

                  {/* Resend OTP */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                    {otpExpiryTimer <= 60 && otpExpiryTimer > 0 && (
                      <div className="mt-2 text-xs text-red-500 font-medium">
                        ⚠️ OTP expiring soon!
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Button Background Texture */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        'Verify & Sign In'
                      )}
                    </span>
                  </motion.button>

                  {/* Back to Email */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
                    >
                      ← Back to email
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            By continuing, you agree to our{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">Privacy Policy</a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginScreen 