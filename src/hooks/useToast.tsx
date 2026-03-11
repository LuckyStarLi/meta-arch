import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Toast, ToastType, ToastPosition } from '../components/Toast'

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  showSuccess: (title: string, message: string, options?: Partial<Omit<Toast, 'type' | 'title' | 'message'>>) => void
  showError: (title: string, message: string, options?: Partial<Omit<Toast, 'type' | 'title' | 'message'>>) => void
  showWarning: (title: string, message: string, options?: Partial<Omit<Toast, 'type' | 'title' | 'message'>>) => void
  showInfo: (title: string, message: string, options?: Partial<Omit<Toast, 'type' | 'title' | 'message'>>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = { id, ...toast }
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const showSuccess = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<Toast, 'type' | 'title' | 'message'>>
  ) => {
    showToast({
      type: 'success',
      title,
      message,
      duration: 3000,
      position: 'top-right',
      closable: true,
      ...options,
    })
  }, [showToast])

  const showError = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<Toast, 'type' | 'title' | 'message'>>
  ) => {
    showToast({
      type: 'error',
      title,
      message,
      duration: 5000,
      position: 'top-right',
      closable: true,
      ...options,
    })
  }, [showToast])

  const showWarning = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<Toast, 'type' | 'title' | 'message'>>
  ) => {
    showToast({
      type: 'warning',
      title,
      message,
      duration: 4000,
      position: 'top-right',
      closable: true,
      ...options,
    })
  }, [showToast])

  const showInfo = useCallback((
    title: string,
    message: string,
    options?: Partial<Omit<Toast, 'type' | 'title' | 'message'>>
  ) => {
    showToast({
      type: 'info',
      title,
      message,
      duration: 3000,
      position: 'top-right',
      closable: true,
      ...options,
    })
  }, [showToast])

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
