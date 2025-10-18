/**
 * Custom Hook for Keyboard Shortcuts
 * Handles global keyboard shortcuts for the VMS application
 */

import { useEffect, useCallback, useRef } from 'react'

const useKeyboardShortcuts = (shortcuts = {}, options = {}) => {
  const {
    enabled = true,
    preventDefault = true,
    ignoreInputs = true,
    debug = false
  } = options

  const shortcutsRef = useRef(shortcuts)
  const optionsRef = useRef(options)

  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = shortcuts
    optionsRef.current = options
  }, [shortcuts, options])

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return

    const { key, ctrlKey, metaKey, altKey, shiftKey, target } = event
    
    // For Ctrl+K, we want to allow it even when in input fields
    const isCtrlK = (ctrlKey || metaKey) && key.toLowerCase() === 'k'
    
    // Ignore if typing in input fields (unless specifically disabled or it's Ctrl+K)
    if (ignoreInputs && !isCtrlK && (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.contentEditable === 'true'
    )) {
      return
    }

    // Create a key combination string
    const modifiers = []
    if (ctrlKey || metaKey) modifiers.push('ctrl')
    if (altKey) modifiers.push('alt')
    if (shiftKey) modifiers.push('shift')
    
    const keyCombo = modifiers.length > 0 
      ? `${modifiers.join('+')}+${key.toLowerCase()}`
      : key.toLowerCase()

    // Always log Ctrl+K for debugging
    if (keyCombo === 'ctrl+k') {
      console.log('🎹 Ctrl+K detected!', { ctrlKey, metaKey, altKey, shiftKey, key, target: target.tagName })
    }

    if (debug) {
      console.log('🎹 Key pressed:', keyCombo, { ctrlKey, metaKey, altKey, shiftKey, key, target: target.tagName })
    }

    // Check if this key combination has a handler
    const handler = shortcutsRef.current[keyCombo]
    if (handler && typeof handler === 'function') {
      if (preventDefault) {
        event.preventDefault()
        event.stopPropagation()
      }
      
      if (debug || keyCombo === 'ctrl+k') {
        console.log('🚀 Executing shortcut:', keyCombo)
      }
      
      handler(event)
    } else if (keyCombo === 'ctrl+k') {
      console.log('❌ No handler found for Ctrl+K')
    }
  }, [enabled, preventDefault, ignoreInputs, debug])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [handleKeyDown, enabled])

  return {
    isEnabled: enabled
  }
}

export default useKeyboardShortcuts
