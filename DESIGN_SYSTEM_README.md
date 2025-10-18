# 🎨 **VMS Design System & Component Library**

> **Central reference for all UI/UX patterns, animations, and reusable components across the VMS application**

---

## 📋 **Table of Contents**

1. [🎭 Modal & Popup Patterns](#-modal--popup-patterns)
2. [🎨 Animation System](#-animation-system)
3. [🎯 Interactive Components](#-interactive-components)
4. [🎨 Visual Design Elements](#-visual-design-elements)
5. [📱 Responsive Patterns](#-responsive-patterns)
6. [🔧 Reusable Components](#-reusable-components)
7. [🎨 Color System](#-color-system)
8. [📐 Layout Patterns](#-layout-patterns)
9. [🚀 Implementation Guidelines](#-implementation-guidelines)
10. [📚 Component API Reference](#-component-api-reference)

---

## 🎭 **Modal & Popup Patterns**

### **1. BaseModal Component**
**Location:** `src/components/common/BaseModal.jsx`

```javascript
// Standard modal structure with consistent animations
<AnimatePresence>
  <motion.div
    className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="bg-black/95 border border-white/20 rounded-3xl p-6 max-w-5xl w-full h-[85vh] flex flex-col"
      initial={{ scale: 0.9, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      exit={{ scale: 0.9, opacity: 0 }} 
      transition={{ duration: 0.3 }}
    >
      {/* Header with close button */}
      {/* Scrollable content */}
    </motion.div>
  </motion.div>
</AnimatePresence>
```

**Props:**
- `isOpen` - Boolean to control visibility
- `onClose` - Function to handle close action
- `title` - Optional modal title
- `maxWidth` - Modal width (default: "max-w-5xl")
- `height` - Modal height (default: "h-[85vh]")
- `showCloseButton` - Show/hide close button (default: true)

### **2. Modal Variants**

#### **A. View All Modal (Large Content)**
```javascript
// For detailed views with extensive content
<motion.div
  className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-[95vw] w-full max-h-[90vh] overflow-hidden border border-orange-200/30 shadow-2xl"
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>
```

#### **B. Confirmation Modal (Compact)**
```javascript
// For confirmations and simple actions
<motion.div
  className="relative bg-slate-900/95 rounded-3xl p-6 max-w-md w-full"
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>
```

#### **C. Detail Modal (Medium)**
```javascript
// For detailed information display
<motion.div
  className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide border border-orange-200/30 shadow-2xl"
  initial={{ scale: 0.8, opacity: 0, y: 50 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  exit={{ scale: 0.8, opacity: 0, y: 50 }}
  transition={{ 
    type: "spring", 
    damping: 20, 
    stiffness: 300,
    duration: 0.4
  }}
>
```

---

## 🎨 **Animation System**

### **1. Entry/Exit Animations**

#### **Standard Fade + Scale**
```javascript
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.9 }}
transition={{ duration: 0.3 }}
```

#### **Spring-Based Animation**
```javascript
transition={{ type: "spring", damping: 25, stiffness: 300 }}
```

#### **Slide Up Animation**
```javascript
initial={{ scale: 0.8, opacity: 0, y: 50 }}
animate={{ scale: 1, opacity: 1, y: 0 }}
exit={{ scale: 0.8, opacity: 0, y: 50 }}
```

### **2. Toast Notifications**
```javascript
<motion.div
  className="fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg"
  initial={{ opacity: 0, y: -50, scale: 0.3 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -50, scale: 0.3 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>
```

### **3. Card Hover Effects**
```javascript
whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

---

## 🎯 **Interactive Components**

### **1. ActionButton Component**
**Location:** `src/components/common/ActionButton.jsx`

```javascript
<ActionButton
  variant="primary" // "primary", "secondary", "success", "danger", "warning"
  size="md"        // "sm", "md", "lg"
  icon={Icon}      // Lucide React icon
  iconPosition="left" // "left", "right"
  onClick={handleClick}
>
  Button Text
</ActionButton>
```

**Variants:**
- `primary` - Teal gradient
- `secondary` - White/10 with border
- `success` - Emerald gradient
- `danger` - Red gradient
- `warning` - Amber gradient

### **2. StatusBadge Component**
**Location:** `src/components/common/StatusBadge.jsx`

```javascript
<StatusBadge
  status="approved" // "approved", "pending", "rejected", "completed", etc.
  text="Approved"
  size="sm"         // "xs", "sm", "md", "lg"
  showIcon={true}
  icon={CheckCircle}
/>
```

**Status Colors:**
- `approved/completed/success` - Emerald
- `pending/in-progress` - Amber
- `rejected/error/failed` - Red
- `not-started/waiting` - Slate

### **3. ProgressBar Component**
**Location:** `src/components/common/ProgressBar.jsx`

```javascript
<ProgressBar
  progress={75}
  height="h-2"
  showLabel={true}
  labelPosition="top" // "top", "bottom", "inside"
  animated={true}
/>
```

---

## 🎨 **Visual Design Elements**

### **1. Glassmorphism Effects**
```css
/* Backdrop blur with transparency */
bg-white/95 backdrop-blur-sm
bg-black/90 backdrop-blur-md
bg-black/95 border border-white/20
```

### **2. Gradient Backgrounds**
```css
/* Teal gradient (primary theme) */
bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900
background: linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)

/* Button gradients */
bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700
```

### **3. Border Radius & Shadows**
```css
/* Consistent rounded corners */
rounded-3xl  /* Large modals */
rounded-xl   /* Buttons */
rounded-full /* Badges */

/* Shadow effects */
shadow-lg
shadow-2xl
boxShadow: "0 25px 50px rgba(0,0,0,0.4)"
```

---

## 📱 **Responsive Patterns**

### **1. Modal Sizing**
```javascript
// Responsive modal widths
max-w-[95vw] w-full  // Large content
max-w-6xl w-full     // Medium content  
max-w-md w-full      // Small content
max-w-5xl w-full     // Default
```

### **2. Height Management**
```javascript
// Flexible height with overflow
max-h-[90vh] overflow-y-auto scrollbar-hide
h-[85vh] flex flex-col
```

### **3. Grid Layouts**
```javascript
// Responsive grids
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
grid grid-cols-2 md:grid-cols-4 gap-4
```

---

## 🔧 **Reusable Components**

### **1. BaseCard Component**
**Location:** `src/components/common/BaseCard.jsx`

```javascript
<BaseCard
  gradient="from-teal-900 via-teal-800 to-teal-900"
  isHoverable={true}
  onClick={handleClick}
>
  Card content
</BaseCard>
```

### **2. Component Exports**
**Location:** `src/components/common/index.js`

```javascript
export { default as BaseCard } from './BaseCard.jsx'
export { default as BaseModal } from './BaseModal.jsx'
export { default as StatusBadge } from './StatusBadge.jsx'
export { default as ActionButton } from './ActionButton.jsx'
export { default as ProgressBar } from './ProgressBar.jsx'
```

---

## 🎨 **Color System**

### **1. Theme Colors**
**Location:** `src/utils/theme.js`

```javascript
// Teal Theme (Primary)
const tealTheme = {
  primary: '#0f766e',
  secondary: '#134e4a',
  accent: '#14b8a6',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc'
}
```

### **2. Status Colors**
```javascript
// Status color mapping
const statusColors = {
  approved: 'text-emerald-400 bg-emerald-500/20',
  pending: 'text-amber-400 bg-amber-500/20',
  rejected: 'text-red-400 bg-red-500/20',
  inTransit: 'text-blue-400 bg-blue-500/20'
}
```

---

## 📐 **Layout Patterns**

### **1. Page Structure**
```javascript
// Standard page layout
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
  {/* Header */}
  <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
    {/* Navigation */}
  </header>
  
  {/* Main Content */}
  <main className="container mx-auto px-4 py-8">
    {/* Page content */}
  </main>
</div>
```

### **2. Card Grid Layout**
```javascript
// Responsive card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => (
    <BaseCard key={item.id} onClick={() => handleClick(item)}>
      {/* Card content */}
    </BaseCard>
  ))}
</div>
```

---

## 🚀 **Implementation Guidelines**

### **1. Component Creation Checklist**
- [ ] Use Framer Motion for animations
- [ ] Follow glassmorphism design patterns
- [ ] Implement responsive design
- [ ] Add proper TypeScript types
- [ ] Include accessibility attributes
- [ ] Test with different themes

### **2. Animation Best Practices**
- Use `AnimatePresence` for enter/exit animations
- Keep animations under 300ms for UI elements
- Use spring animations for interactive elements
- Provide reduced motion alternatives

### **3. Accessibility Guidelines**
- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Provide focus indicators

---

## 📚 **Component API Reference**

### **BaseModal**
```typescript
interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  maxWidth?: string
  height?: string
  showCloseButton?: boolean
  children: React.ReactNode
}
```

### **ActionButton**
```typescript
interface ActionButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  className?: string
}
```

### **StatusBadge**
```typescript
interface StatusBadgeProps {
  status: string
  text: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showIcon?: boolean
  icon?: LucideIcon
}
```

### **ProgressBar**
```typescript
interface ProgressBarProps {
  progress: number
  height?: string
  showLabel?: boolean
  labelPosition?: 'top' | 'bottom' | 'inside'
  className?: string
  animated?: boolean
}
```

---

## 🔄 **Update Log**

### **Version 1.0.0** - Initial Design System
- ✅ Modal patterns documented
- ✅ Animation system defined
- ✅ Component library established
- ✅ Color system standardized
- ✅ Responsive patterns documented

---

## 📝 **Notes for Master Page Implementation**

### **Recommended Modal Types:**
1. **`BaseModal`** - Standard modal with header/close button
2. **`ConfirmationModal`** - For delete/approve actions
3. **`DetailModal`** - For viewing master records
4. **`FormModal`** - For creating/editing masters

### **Animation Variants to Use:**
- **Fade + Scale** - Standard modal entrance
- **Slide Up** - For form modals
- **Spring Bounce** - For interactive elements
- **Toast Slide** - For notifications

### **Visual Consistency:**
- **Teal gradient theme** (modern design preference)
- **Glassmorphism effects**
- **Rounded corners (3xl)**
- **Backdrop blur**
- **White/black transparency layers**

---

**🎯 Ready for Master Page Implementation!**

This design system provides a complete foundation for building consistent, beautiful, and functional components across the VMS application. All patterns are battle-tested from the approval page and ready for reuse in the Master page implementation.