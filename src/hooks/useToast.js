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
