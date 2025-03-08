'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true
}) {
  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef(null)
  
  useEffect(() => {
    setMounted(true)
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  const handleOverlayClick = (e) => {
    if (overlayRef.current === e.target) {
      onClose()
    }
  }
  
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }
  
  if (!mounted || !isOpen) return null
  
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div 
        className={`relative bg-gray-900 rounded-xl border border-gray-800 shadow-xl w-full ${sizeClasses[size] || sizeClasses.md} overflow-hidden`}
      >
        {title && (
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold">{title}</h2>
            
            {showClose && (
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-800 transition"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}