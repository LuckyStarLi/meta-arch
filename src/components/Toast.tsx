import { useEffect, useState } from 'react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  position?: ToastPosition
  closable?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface Props {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  const [exitingToasts, setExitingToasts] = useState<string[]>([])

  const handleRemove = (id: string) => {
    setExitingToasts(prev => [...prev, id])
    setTimeout(() => {
      onRemove(id)
      setExitingToasts(prev => prev.filter(toastId => toastId !== id))
    }, 300)
  }

  // 按位置分组 toasts
  const toastsByPosition: Record<ToastPosition, Toast[]> = {
    'top-right': [],
    'top-center': [],
    'top-left': [],
    'bottom-right': [],
    'bottom-center': [],
    'bottom-left': [],
  }

  toasts.forEach(toast => {
    const position = toast.position || 'top-right'
    toastsByPosition[position].push(toast)
  })

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        positionToasts.length > 0 && (
          <div
            key={position}
            className={`toast-container toast-container--${position}`}
          >
            {positionToasts.map(toast => (
              <ToastItem
                key={toast.id}
                toast={toast}
                isExiting={exitingToasts.includes(toast.id)}
                onClose={() => handleRemove(toast.id)}
              />
            ))}
          </div>
        )
      ))}
    </>
  )
}

interface ToastItemProps {
  toast: Toast
  isExiting: boolean
  onClose: () => void
}

function ToastItem({ toast, isExiting, onClose }: ToastItemProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, onClose])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div
      className={`toast toast--${toast.type} ${toast.closable !== false ? 'toast--closable' : ''} ${isExiting ? 'toast--exit' : ''}`}
      style={{
        animationDuration: '0.3s',
      }}
    >
      <div className="toast__icon">
        {getIcon(toast.type)}
      </div>
      
      <div className="toast__content">
        {toast.title && <div className="toast__title">{toast.title}</div>}
        <div className="toast__message">{toast.message}</div>
        {toast.action && (
          <button className="toast__action" onClick={toast.action.onClick}>
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.closable !== false && (
        <button className="toast__close" onClick={onClose}>
          ✕
        </button>
      )}

      {toast.duration && toast.duration > 0 && (
        <div className="toast__progress">
          <div
            className="toast__progress-bar"
            style={{
              animationDuration: `${toast.duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  )
}
