import { useEffect } from 'react'

/**
 * Custom hook to prevent body scrolling when modal is open
 * This prevents the background page from scrolling while modal is active
 */
export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // Save current scroll position
      const scrollY = window.scrollY
      
      // Lock the body scroll
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      // Prevent keyboard scrolling
      const handleKeyDown = (e) => {
        const scrollKeys = [
          32,  // Space
          33,  // Page Up
          34,  // Page Down
          35,  // End
          36,  // Home
          37,  // Left Arrow
          38,  // Up Arrow
          39,  // Right Arrow
          40   // Down Arrow
        ]
        if (scrollKeys.includes(e.keyCode)) {
          e.preventDefault()
        }
      }
      
      // Prevent wheel scrolling only on body, allow within modals
      const handleWheel = (e) => {
        // Only prevent if the target is not within a modal
        const modalElement = e.target.closest('[role="dialog"]')
        if (!modalElement) {
          e.preventDefault()
        }
      }
      
      // Prevent touch scrolling on mobile only on body, allow within modals
      const handleTouchMove = (e) => {
        // Only prevent if the target is not within a modal
        const modalElement = e.target.closest('[role="dialog"]')
        if (!modalElement) {
          e.preventDefault()
        }
      }
      
      // Add event listeners with passive: false to allow preventDefault
      document.addEventListener('keydown', handleKeyDown, { passive: false })
      document.addEventListener('wheel', handleWheel, { passive: false })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      
      return () => {
        // Restore scroll position and styles
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
        
        // Remove event listeners
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('wheel', handleWheel)
        document.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [isLocked])
}

export default useScrollLock

