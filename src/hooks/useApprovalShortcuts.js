/**
 * Keyboard Shortcuts Hook for Approval Page
 * Handles status switching and search focus shortcuts
 */

import { useRef } from 'react'
import useKeyboardShortcuts from './useKeyboardShortcuts.js'

const useApprovalShortcuts = ({
  onStatusChange,
  onSearchFocus,
  onSearchClear,
  searchInputRef,
  enabled = true
}) => {
  const lastActiveElement = useRef(null)

  const shortcuts = {
    // Status switching shortcuts
    '1': () => {
      onStatusChange?.('pending')
    },
    '2': () => {
      onStatusChange?.('approved')
    },
    '3': () => {
      onStatusChange?.('rejected')
    },
    '4': () => {
      onStatusChange?.('in-transit')
    },

    // Search shortcuts - Fixed key combination
    'ctrl+k': (event) => {
      console.log('🔍 Ctrl+K handler called!')
      event.preventDefault()
      event.stopPropagation()
      
      // Store the currently focused element
      lastActiveElement.current = document.activeElement
      console.log('📍 Current focused element:', document.activeElement)
      
      // Focus the search input immediately and with delay as backup
      if (searchInputRef?.current) {
        console.log('✅ Search input ref found, focusing...')
        searchInputRef.current.focus()
        searchInputRef.current.select() // Select all text for easy replacement
        
        // Also try with a small delay as backup
        setTimeout(() => {
          if (searchInputRef?.current) {
            searchInputRef.current.focus()
            searchInputRef.current.select()
            console.log('🎯 Search input focused with delay backup')
          }
        }, 10)
      } else {
        console.log('❌ Search input ref not found!')
      }
      
      onSearchFocus?.()
    },

    // Clear search (when search is focused)
    'escape': () => {
      // If search input is focused, clear it and blur
      if (document.activeElement === searchInputRef?.current) {
        onSearchClear?.()
        
        // Return focus to the last active element or blur
        if (lastActiveElement.current && lastActiveElement.current !== searchInputRef.current) {
          lastActiveElement.current.focus()
        } else {
          document.activeElement.blur()
        }
        lastActiveElement.current = null
      }
    },

    // Alternative search shortcut (common in many apps)
    '/': (event) => {
      // Only trigger if not already in an input
      if (document.activeElement.tagName !== 'INPUT') {
        event.preventDefault()
        
        lastActiveElement.current = document.activeElement
        
        if (searchInputRef?.current) {
          searchInputRef.current.focus()
          searchInputRef.current.select()
        }
        
        onSearchFocus?.()
      }
    }
  }

  // Use the keyboard shortcuts hook
  const { isEnabled } = useKeyboardShortcuts(shortcuts, {
    enabled,
    preventDefault: true,
    ignoreInputs: true, // We handle input focus manually for search
    debug: false // Disable debug for clean production
  })

  return {
    isEnabled,
    shortcuts: Object.keys(shortcuts)
  }
}

export default useApprovalShortcuts
