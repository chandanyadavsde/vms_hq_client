import React from 'react'

const TurbineIcon = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-turbine-spin ${className}`}
    >
      {/* Base/Tower */}
      <path d="M12 20v-8" />
      <path d="M12 20v-4" />
      
      {/* Rotor Hub */}
      <circle cx="12" cy="8" r="1" />
      
      {/* Blades */}
      <path d="M12 8l-3-3" />
      <path d="M12 8l3-3" />
      <path d="M12 8l0-3" />
      
      {/* Wind Flow Lines */}
      <path d="M2 6l2 2" />
      <path d="M6 4l2 2" />
      <path d="M10 2l2 2" />
      
      <path d="M20 6l-2 2" />
      <path d="M16 4l-2 2" />
      <path d="M12 2l-2 2" />
    </svg>
  )
}

export default TurbineIcon 