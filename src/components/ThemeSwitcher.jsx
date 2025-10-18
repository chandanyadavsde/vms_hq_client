import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { themes, changeTheme } from '../utils/colors.js'

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('default')

  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName)
    changeTheme(themeName)
    
    // Here you would typically update CSS custom properties
    // or trigger a theme change in your app state
    console.log(`Switched to ${themeName} theme`)
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h3 className="text-white font-bold text-sm mb-3">Theme Switcher</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(themes).map(([name, colors]) => (
            <motion.button
              key={name}
              onClick={() => handleThemeChange(name)}
              className={`p-3 rounded-xl border-2 transition-all ${
                currentTheme === name 
                  ? 'border-white/50 bg-white/20' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className="w-full h-4 rounded-lg mb-2"
                style={{ 
                  background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)` 
                }}
              />
              <span className="text-white text-xs font-medium capitalize">
                {name}
              </span>
            </motion.button>
          ))}
        </div>
        
        <div className="mt-3 p-2 bg-white/5 rounded-lg">
          <p className="text-white/70 text-xs">
            💡 <strong>Tip:</strong> To change the entire theme, modify the primary colors in <code className="bg-white/10 px-1 rounded">tailwind.config.js</code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ThemeSwitcher 