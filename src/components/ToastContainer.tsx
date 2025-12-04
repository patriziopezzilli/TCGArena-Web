import React from 'react'
import { useToast, ToastType } from '../contexts/ToastContext'

const Toast: React.FC<{
  id: string
  message: string
  type: ToastType
  onClose: (id: string) => void
}> = ({ id, message, type, onClose }) => {
  const getToastStyles = (type: ToastType) => {
    const baseStyles = 'flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg transition-all duration-300 ease-in-out transform translate-x-full animate-slide-in'

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-100 text-green-800 border border-green-200`
      case 'error':
        return `${baseStyles} bg-red-100 text-red-800 border border-red-200`
      case 'warning':
        return `${baseStyles} bg-yellow-100 text-yellow-800 border border-yellow-200`
      case 'info':
        return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`
      default:
        return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`
    }
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return 'ℹ'
    }
  }

  return (
    <div className={getToastStyles(type)} role="alert">
      <div className="flex items-center">
        <span className="font-semibold text-lg mr-3">{getIcon(type)}</span>
        <span className="font-medium">{message}</span>
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-opacity-20 focus:ring-2 focus:ring-gray-300"
        onClick={() => onClose(id)}
        aria-label="Chiudi"
      >
        <span className="sr-only">Chiudi</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  )
}

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

export default ToastContainer