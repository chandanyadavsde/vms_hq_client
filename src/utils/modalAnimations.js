// Global Modal Animation Utilities
// This file provides consistent animation patterns for all modals in the app

export const modalAnimations = {
  // Slide in from right (for full-screen modals)
  slideInFromRight: {
    container: {
      className: "fixed inset-0 z-50 flex items-end justify-end",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    },
    backdrop: {
      className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
    },
    modal: {
      initial: { x: "100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "100%", opacity: 0 },
      transition: { 
        type: "spring", 
        damping: 30, 
        stiffness: 300,
        duration: 0.3
      }
    }
  },

  // Slide in from left (for sidebars)
  slideInFromLeft: {
    container: {
      className: "fixed inset-0 z-50 flex items-start justify-start",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    },
    backdrop: {
      className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
    },
    modal: {
      initial: { x: "-100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "-100%", opacity: 0 },
      transition: { 
        type: "spring", 
        damping: 30, 
        stiffness: 300,
        duration: 0.3
      }
    }
  },

  // Center popup (for small modals)
  centerPopup: {
    container: {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    },
    backdrop: {
      className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
    },
    modal: {
      initial: { scale: 0.95, opacity: 0, y: 20 },
      animate: { scale: 1, opacity: 1, y: 0 },
      exit: { scale: 0.95, opacity: 0, y: 20 },
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        duration: 0.3
      }
    }
  },

  // Slide up from bottom (for mobile-friendly modals)
  slideUpFromBottom: {
    container: {
      className: "fixed inset-0 z-50 flex items-end justify-center",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    },
    backdrop: {
      className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
    },
    modal: {
      initial: { y: "100%", opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: "100%", opacity: 0 },
      transition: { 
        type: "spring", 
        damping: 30, 
        stiffness: 300,
        duration: 0.3
      }
    }
  }
}

// Animation presets for different modal types
export const modalPresets = {
  // Full-screen modals (like forms)
  fullScreen: {
    animation: 'slideInFromRight',
    modalClass: 'w-full h-full overflow-y-auto border border-slate-200 shadow-2xl'
  },
  
  // Sidebar modals
  sidebar: {
    animation: 'slideInFromLeft',
    modalClass: 'w-96 h-full overflow-y-auto border border-slate-200 shadow-2xl'
  },
  
  // Popup modals (small)
  popup: {
    animation: 'centerPopup',
    modalClass: 'max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-2xl'
  },
  
  // Mobile modals
  mobile: {
    animation: 'slideUpFromBottom',
    modalClass: 'w-full max-h-[90vh] overflow-y-auto bg-white rounded-t-xl border border-slate-200 shadow-2xl'
  }
}

// Helper function to get animation config
export const getModalAnimation = (preset = 'fullScreen') => {
  const presetConfig = modalPresets[preset]
  const animationConfig = modalAnimations[presetConfig.animation]
  
  return {
    ...animationConfig,
    modalClass: presetConfig.modalClass
  }
}
