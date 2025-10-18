// Color Theme Configuration
// Change these values to easily customize the entire application theme

export const themeColors = {
  // Primary Theme - Change these to change the main theme
  primary: {
    light: 'primary-400',    // Light primary color
    main: 'primary-500',     // Main primary color  
    dark: 'primary-600',     // Dark primary color
    gradient: 'from-primary-500 to-secondary-500', // Primary gradient
  },
  
  // Secondary Theme
  secondary: {
    light: 'secondary-400',
    main: 'secondary-500', 
    dark: 'secondary-600',
    gradient: 'from-secondary-500 to-primary-500',
  },
  
  // Accent Colors
  accent: {
    success: 'accent-green',
    warning: 'accent-yellow',
    error: 'accent-red',
    info: 'accent-blue',
    purple: 'accent-purple',
    orange: 'accent-orange',
  },
  
  // Status Colors
  status: {
    success: 'status-success',
    warning: 'status-warning', 
    error: 'status-error',
    info: 'status-info',
    pending: 'status-pending',
  },
  
  // UI Colors
  ui: {
    background: 'ui-background',
    surface: 'ui-surface',
    border: 'ui-border',
    text: {
      primary: 'ui-text-primary',
      secondary: 'ui-text-secondary',
      accent: 'ui-text-accent',
      muted: 'ui-text-muted',
    },
    glass: {
      background: 'ui-glass-background',
      border: 'ui-glass-border',
    }
  }
}

// Utility functions for easy color application
export const getColorClasses = {
  // Background colors
  bgPrimary: `bg-${themeColors.primary.main}`,
  bgPrimaryLight: `bg-${themeColors.primary.light}`,
  bgPrimaryDark: `bg-${themeColors.primary.dark}`,
  bgPrimaryGradient: `bg-gradient-to-r ${themeColors.primary.gradient}`,
  
  // Text colors
  textPrimary: `text-${themeColors.primary.main}`,
  textPrimaryLight: `text-${themeColors.primary.light}`,
  textPrimaryDark: `text-${themeColors.primary.dark}`,
  
  // Border colors
  borderPrimary: `border-${themeColors.primary.main}`,
  borderPrimaryLight: `border-${themeColors.primary.light}`,
  borderPrimaryDark: `border-${themeColors.primary.dark}`,
  
  // Status colors
  bgSuccess: `bg-${themeColors.status.success}`,
  bgWarning: `bg-${themeColors.status.warning}`,
  bgError: `bg-${themeColors.status.error}`,
  bgInfo: `bg-${themeColors.status.info}`,
  bgPending: `bg-${themeColors.status.pending}`,
  
  textSuccess: `text-${themeColors.status.success}`,
  textWarning: `text-${themeColors.status.warning}`,
  textError: `text-${themeColors.status.error}`,
  textInfo: `text-${themeColors.status.info}`,
  textPending: `text-${themeColors.status.pending}`,
  
  // UI colors
  bgSurface: `bg-${themeColors.ui.surface}`,
  bgGlass: `bg-white/10 backdrop-blur-md`,
  borderGlass: `border-white/20`,
  textMuted: `text-${themeColors.ui.text.muted}`,
  textSecondary: `text-${themeColors.ui.text.secondary}`,
}

// Quick theme change function
export const changeTheme = (newPrimaryColor) => {
  // This function can be used to dynamically change theme colors
  // You would need to implement CSS custom properties for dynamic changes
  console.log(`Theme changed to: ${newPrimaryColor}`)
}

// Predefined themes
export const themes = {
  default: {
    primary: '#0ea5e9', // Cyan
    secondary: '#3b82f6', // Blue
  },
  purple: {
    primary: '#8b5cf6', // Purple
    secondary: '#a855f7', // Violet
  },
  green: {
    primary: '#10b981', // Emerald
    secondary: '#059669', // Green
  },
  orange: {
    primary: '#f97316', // Orange
    secondary: '#ea580c', // Red Orange
  },
  pink: {
    primary: '#ec4899', // Pink
    secondary: '#db2777', // Rose
  },
}

// Usage examples:
// className={getColorClasses.bgPrimary}
// className={getColorClasses.textPrimary}
// className={getColorClasses.bgSuccess}
// className={getColorClasses.bgGlass} 