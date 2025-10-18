# Modal Animation System Guide

This guide explains how to use the global modal animation system throughout the app.

## 🎯 **Available Animation Types**

### 1. **Slide In From Right** (Full-Screen Modals)
- **Use case**: Forms, detailed views, full-screen modals
- **Animation**: Slides in from the right side of the screen
- **Preset**: `'fullScreen'`

### 2. **Slide In From Left** (Sidebars)
- **Use case**: Sidebar panels, navigation menus
- **Animation**: Slides in from the left side of the screen
- **Preset**: `'sidebar'`

### 3. **Center Popup** (Small Modals)
- **Use case**: Confirmations, small forms, alerts
- **Animation**: Scales up from center with slight upward movement
- **Preset**: `'popup'`

### 4. **Slide Up From Bottom** (Mobile Modals)
- **Use case**: Mobile-friendly modals, bottom sheets
- **Animation**: Slides up from the bottom of the screen
- **Preset**: `'mobile'`

## 🚀 **How to Use**

### Method 1: Using the AnimatedModal Component (Recommended)

```jsx
import AnimatedModal from '../common/AnimatedModal.jsx'
import { Car } from 'lucide-react'

const MyModal = ({ isOpen, onClose }) => {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Vehicle"
      subtitle="Enter vehicle information"
      icon={<Car className="w-5 h-5 text-orange-600" />}
      preset="fullScreen" // or 'sidebar', 'popup', 'mobile'
    >
      {/* Your modal content here */}
      <div>Modal content goes here</div>
    </AnimatedModal>
  )
}
```

### Method 2: Using Animation Config Directly

```jsx
import { getModalAnimation } from '../utils/modalAnimations.js'
import { motion, AnimatePresence } from 'framer-motion'

const MyModal = ({ isOpen, onClose }) => {
  const animationConfig = getModalAnimation('fullScreen')
  
  return (
    <AnimatePresence>
      <motion.div
        className={animationConfig.container.className}
        initial={animationConfig.container.initial}
        animate={animationConfig.container.animate}
        exit={animationConfig.container.exit}
        transition={animationConfig.container.transition}
      >
        <motion.div
          className={animationConfig.backdrop.className}
          onClick={onClose}
        />
        
        <motion.div
          className={`relative bg-white ${animationConfig.modalClass}`}
          initial={animationConfig.modal.initial}
          animate={animationConfig.modal.animate}
          exit={animationConfig.modal.exit}
          transition={animationConfig.modal.transition}
        >
          {/* Your modal content */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
```

## 📋 **Preset Configurations**

| Preset | Animation | Modal Class | Use Case |
|--------|-----------|-------------|----------|
| `fullScreen` | Slide from right | `w-full h-full` | Forms, detailed views |
| `sidebar` | Slide from left | `w-96 h-full` | Sidebar panels |
| `popup` | Center popup | `max-w-md w-full max-h-[90vh]` | Small modals |
| `mobile` | Slide from bottom | `w-full max-h-[90vh]` | Mobile modals |

## 🎨 **Customization**

### Custom Animation Timing
```jsx
const customConfig = {
  ...getModalAnimation('fullScreen'),
  modal: {
    ...getModalAnimation('fullScreen').modal,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 400,
      duration: 0.4
    }
  }
}
```

### Custom Modal Classes
```jsx
<AnimatedModal
  preset="fullScreen"
  className="custom-modal-class"
  // This will be added to the base modal class
>
```

## 🔄 **Migration Guide**

### Before (Old Modal)
```jsx
<motion.div
  className="fixed inset-0 z-50 flex items-center justify-center"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  <motion.div
    className="relative bg-white max-w-md w-full rounded-xl shadow-2xl"
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
  >
```

### After (New Modal)
```jsx
<AnimatedModal
  isOpen={isOpen}
  onClose={onClose}
  preset="popup"
  title="Modal Title"
>
  {/* Content */}
</AnimatedModal>
```

## ✅ **Best Practices**

1. **Use appropriate presets** for different modal types
2. **Always provide a title** for better UX
3. **Use icons** to make modals more visually appealing
4. **Test animations** on different screen sizes
5. **Keep animations smooth** - avoid jarring transitions
6. **Provide clear close actions** - users should know how to exit

## 🐛 **Troubleshooting**

### Modal not animating
- Check if `isOpen` prop is properly managed
- Ensure `AnimatePresence` is wrapping the modal
- Verify animation config is imported correctly

### Animation too fast/slow
- Adjust `damping` and `stiffness` values
- Modify `duration` in transition config
- Test on different devices for performance

### Modal positioning issues
- Check if parent container has proper positioning
- Ensure z-index is high enough
- Verify backdrop click handling
