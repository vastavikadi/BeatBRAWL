'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// Event emitter for toast management
let toastEventTarget

if (typeof window !== 'undefined') {
  if (!window.toastEventTarget) {
    window.toastEventTarget = new EventTarget()
  }
  toastEventTarget = window.toastEventTarget
}

export function toast(message, options = {}) {
  if (typeof window === 'undefined' || !toastEventTarget) return
  
  const event = new CustomEvent('toast', {
    detail: {
      id: Date.now(),
      message,
      ...options
    }
  })
  
  toastEventTarget.dispatchEvent(event)
}

// Toast variants
toast.success = (message, options = {}) => {
  toast(message, { ...options, variant: 'success' })
}

toast.error = (message, options = {}) => {
  toast(message, { ...options, variant: 'error' })
}

toast.info = (message, options = {}) => {
  toast(message, { ...options, variant: 'info' })
}

toast.warning = (message, options = {}) => {
  toast(message, { ...options, variant: 'warning' })
}

export function Toaster() {
  const [toasts, setToasts] = useState([])
  const [mounted, setMounted] = useState(false)
  
  const addToast = useCallback((event) => {
    const toast = event.detail
    
    setToasts((prevToasts) => [
      ...prevToasts, 
      { 
        ...toast,
        duration: toast.duration || 5000
      }
    ])
    
    // Auto-dismiss after duration
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration || 5000)
  }, [])
  
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])
  
  useEffect(() => {
    setMounted(true)
    
    if (toastEventTarget) {
      toastEventTarget.addEventListener('toast', addToast)
    }
    
    return () => {
      if (toastEventTarget) {
        toastEventTarget.removeEventListener('toast', addToast)
      }
    }
  }, [addToast])
  
  if (!mounted) return null
  
  const variantStyles = {
    default: 'bg-gray-800 border-gray-700',
    success: 'bg-green-900/70 border-green-700',
    error: 'bg-red-900/70 border-red-700',
    warning: 'bg-yellow-900/70 border-yellow-700',
    info: 'bg-blue-900/70 border-blue-700'
  }
  
  const variantIcons = {
    default: null,
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />
  }
  
  return createPortal(
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-slideIn ${
            variantStyles[toast.variant || 'default']
          }`}
          role="alert"
        >
          <div className="flex items-start">
            {variantIcons[toast.variant || 'default'] && (
              <div className="flex-shrink-0 mr-3">
                {variantIcons[toast.variant || 'default']}
              </div>
            )}
            
            <div className="flex-1">
              {toast.title && (
                <h3 className="font-semibold">{toast.title}</h3>
              )}
              <div className="text-sm text-gray-300">{toast.message}</div>
            </div>
            
            <button
              className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-gray-700 transition"
              onClick={() => removeToast(toast.id)}
              aria-label="Close toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  )
}