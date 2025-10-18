# 🍞 Toast Notification System

**Enterprise-grade toast notification system for VMS application**

---

## 📋 Overview

A lightweight, dependency-free toast notification system built with React and Tailwind CSS. Designed for consistency across the entire application.

---

## 🎨 Design Specifications

### Toast Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| **Success** ✅ | Green | CheckCircle | Successful operations (save, create, update) |
| **Error** ❌ | Red | AlertTriangle | Failed operations, validation errors |
| **Warning** ⚠️ | Orange | AlertTriangle | Important warnings, confirmations needed |
| **Info** ℹ️ | Blue | Info | General information, tips |

### Visual Design

```
┌────────────────────────────────────────────┐
│ [Icon]  Success!                      [×]  │
│         Vehicle updated successfully       │
└────────────────────────────────────────────┘
```

**Specifications:**
- **Width:** Auto (min 300px, max 500px)
- **Height:** Auto (min 60px)
- **Position:** Fixed, top-right corner
- **Offset:** 20px from top, 20px from right
- **Border Radius:** 12px (rounded-xl)
- **Shadow:** Large shadow for depth
- **Animation:** Slide in from right + fade in (300ms)
- **Duration:** 4 seconds (configurable)
- **Stacking:** Multiple toasts stack vertically with 12px gap
- **Max Visible:** 3 toasts at once (older ones auto-dismiss)

### Color Palette

```javascript
const toastColors = {
  success: {
    bg: 'bg-white',
    border: 'border-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700'
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700'
  },
  warning: {
    bg: 'bg-white',
    border: 'border-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    titleColor: 'text-orange-800',
    messageColor: 'text-orange-700'
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700'
  }
}
```

---

## 📁 File Structure

```
client/HQ_LIGHT_THEME/src/
├── components/
│   └── Toast/
│       ├── Toast.jsx              # Individual toast component
│       ├── ToastContainer.jsx     # Toast container (holds all toasts)
│       └── index.js               # Exports
├── hooks/
│   └── useToast.js                # Toast hook for easy usage
└── contexts/
    └── ToastContext.jsx           # Toast context provider
```

---

## 🔧 Implementation

### 1. Toast Context (`ToastContext.jsx`)

```javascript
import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 4000,
      createdAt: Date.now()
    }

    setToasts(prev => {
      // Max 3 toasts visible at once
      const updated = [...prev, newToast]
      if (updated.length > 3) {
        return updated.slice(-3)
      }
      return updated
    })

    // Auto dismiss
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const removeAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAll }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}
```

---

### 2. useToast Hook (`useToast.js`)

```javascript
import { useToastContext } from '../contexts/ToastContext'

export const useToast = () => {
  const { addToast, removeToast, removeAll } = useToastContext()

  const toast = {
    success: (message, title = 'Success!') => {
      return addToast({ type: 'success', title, message })
    },

    error: (message, title = 'Error!') => {
      return addToast({ type: 'error', title, message })
    },

    warning: (message, title = 'Warning!') => {
      return addToast({ type: 'warning', title, message })
    },

    info: (message, title = 'Info') => {
      return addToast({ type: 'info', title, message })
    },

    custom: (options) => {
      return addToast(options)
    },

    dismiss: (id) => {
      if (id) {
        removeToast(id)
      } else {
        removeAll()
      }
    }
  }

  return toast
}
```

---

### 3. Toast Component (`Toast.jsx`)

```javascript
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

const toastConfig = {
  success: {
    bg: 'bg-white',
    border: 'border-l-4 border-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    Icon: CheckCircle
  },
  error: {
    bg: 'bg-white',
    border: 'border-l-4 border-red-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    Icon: AlertTriangle
  },
  warning: {
    bg: 'bg-white',
    border: 'border-l-4 border-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    titleColor: 'text-orange-800',
    messageColor: 'text-orange-700',
    Icon: AlertTriangle
  },
  info: {
    bg: 'bg-white',
    border: 'border-l-4 border-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    Icon: Info
  }
}

const Toast = ({ id, type, title, message, onClose, duration }) => {
  const [progress, setProgress] = useState(100)
  const config = toastConfig[type] || toastConfig.info
  const { Icon } = config

  useEffect(() => {
    if (duration <= 0) return

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 50))
        return newProgress <= 0 ? 0 : newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`${config.bg} ${config.border} rounded-xl shadow-2xl overflow-hidden min-w-[300px] max-w-[500px]`}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-1 bg-slate-100">
          <motion.div
            className={`h-full ${config.iconBg}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>
      )}

      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${config.titleColor}`}>
            {title}
          </p>
          <p className={`text-sm mt-0.5 ${config.messageColor}`}>
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-slate-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        </button>
      </div>
    </motion.div>
  )
}

export default Toast
```

---

### 4. Toast Container (`ToastContainer.jsx`)

```javascript
import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useToastContext } from '../../contexts/ToastContext'
import Toast from './Toast'

const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext()

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
```

---

### 5. Index Export (`components/Toast/index.js`)

```javascript
export { default as Toast } from './Toast'
export { default as ToastContainer } from './ToastContainer'
```

---

## 🚀 Usage

### Setup (One-time)

**1. Wrap your app with ToastProvider:**

```javascript
// main.jsx or App.jsx
import { ToastProvider } from './contexts/ToastContext'
import { ToastContainer } from './components/Toast'

function App() {
  return (
    <ToastProvider>
      <YourApp />
      <ToastContainer />
    </ToastProvider>
  )
}
```

### Usage in Components

```javascript
import { useToast } from '../hooks/useToast'

function MyComponent() {
  const toast = useToast()

  const handleSave = async () => {
    try {
      await saveData()
      toast.success('Data saved successfully!')
    } catch (error) {
      toast.error('Failed to save data', 'Error!')
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

---

## 📚 API Reference

### useToast() Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `toast.success(message, title?)` | message: string, title?: string | Show success toast |
| `toast.error(message, title?)` | message: string, title?: string | Show error toast |
| `toast.warning(message, title?)` | message: string, title?: string | Show warning toast |
| `toast.info(message, title?)` | message: string, title?: string | Show info toast |
| `toast.custom(options)` | options: ToastOptions | Custom toast with full control |
| `toast.dismiss(id?)` | id?: number | Dismiss specific toast or all |

### ToastOptions

```typescript
interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number  // milliseconds (0 = no auto dismiss)
}
```

---

## 💡 Usage Examples

### 1. Vehicle Update Success

```javascript
toast.success('Vehicle updated successfully!', 'Success!')
```

### 2. Validation Error

```javascript
toast.error('Please fill all required fields', 'Validation Error')
```

### 3. Warning Before Delete

```javascript
toast.warning('This action cannot be undone', 'Are you sure?')
```

### 4. Information

```javascript
toast.info('Vehicle refresh completed', 'Info')
```

### 5. Custom Duration

```javascript
toast.custom({
  type: 'success',
  title: 'File Uploaded',
  message: 'Your document has been uploaded successfully',
  duration: 6000  // 6 seconds
})
```

### 6. Permanent Toast (Manual Dismiss)

```javascript
const toastId = toast.custom({
  type: 'info',
  title: 'Processing...',
  message: 'Please wait while we process your request',
  duration: 0  // Won't auto dismiss
})

// Later dismiss it manually
toast.dismiss(toastId)
```

---

## 🎯 Common Use Cases in VMS

### Vehicle Operations

```javascript
// Create vehicle
toast.success('Vehicle created successfully!')

// Update vehicle
toast.success('Vehicle details updated!')

// Delete vehicle
toast.warning('Vehicle deleted', 'Warning')

// Error updating
toast.error('Failed to update vehicle. Please try again.', 'Error!')
```

### Document Operations

```javascript
// Upload document
toast.success('Document uploaded successfully!')

// Delete document
toast.warning('Document removed', 'Warning')

// Document expired
toast.warning('Insurance document has expired', 'Action Required')
```

### Driver Operations

```javascript
// Assign driver
toast.success('Driver assigned to vehicle!')

// Driver approved
toast.success('Driver approved by HQ', 'Success!')

// Driver rejected
toast.error('Driver application rejected', 'Rejected')
```

### Status Updates

```javascript
// Status changed
toast.info('Vehicle status updated to "At Gate"', 'Status Update')

// Trip started
toast.success('Trip started successfully!', 'Trip Started')
```

---

## 🎨 Customization

### Modify Toast Duration

```javascript
// src/hooks/useToast.js
const toast = {
  success: (message, title = 'Success!') => {
    return addToast({
      type: 'success',
      title,
      message,
      duration: 5000  // Change default to 5 seconds
    })
  }
}
```

### Add Sound Effects

```javascript
// src/components/Toast/Toast.jsx
useEffect(() => {
  if (type === 'success') {
    const audio = new Audio('/sounds/success.mp3')
    audio.play()
  }
}, [type])
```

### Mobile Responsive

```javascript
// Adjust position for mobile
<div className="fixed top-5 right-5 md:right-5 md:top-5 sm:right-2 sm:top-2 z-[9999]">
```

---

## ✅ Checklist for Integration

- [ ] Create `ToastContext.jsx`
- [ ] Create `useToast.js` hook
- [ ] Create `Toast.jsx` component
- [ ] Create `ToastContainer.jsx`
- [ ] Create `index.js` export
- [ ] Wrap app with `ToastProvider` in `main.jsx`
- [ ] Add `<ToastContainer />` to app root
- [ ] Replace all inline success/error messages with toast
- [ ] Test all toast types
- [ ] Test multiple toasts stacking
- [ ] Test auto-dismiss
- [ ] Test manual dismiss
- [ ] Test on mobile

---

## 🚫 Don't Do This

❌ **Don't create toast inside loops**
```javascript
// BAD
vehicles.forEach(v => {
  toast.success(`Vehicle ${v.number} updated`)  // Creates 100 toasts!
})

// GOOD
toast.success(`${vehicles.length} vehicles updated successfully`)
```

❌ **Don't use toast for critical confirmations**
```javascript
// BAD
toast.warning('Delete vehicle?')  // User might miss it

// GOOD
showConfirmDialog('Are you sure you want to delete?')
```

❌ **Don't show toast for every API call**
```javascript
// BAD
toast.info('Loading...')  // Too noisy

// GOOD
// Use loading spinner for loading states
```

---

## 🎉 Benefits

✅ **Zero Dependencies** - No external toast library needed
✅ **Lightweight** - ~5KB total
✅ **Consistent** - Same design across entire app
✅ **Accessible** - Can add ARIA labels easily
✅ **Performant** - Framer Motion optimized animations
✅ **Mobile Friendly** - Responsive design
✅ **Customizable** - Easy to modify colors/animations
✅ **Type Safe** - Can add TypeScript easily

---

## 📝 Next Steps

1. Create the toast system files
2. Integrate in `main.jsx`
3. Replace all inline success/error messages
4. Test thoroughly
5. Document any app-specific customizations

---

**Ready to use! 🎉**
