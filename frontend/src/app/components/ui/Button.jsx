import { forwardRef } from 'react'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  ...props
}, ref) => {
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-500 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-400 text-black',
    info: 'bg-blue-600 hover:bg-blue-500 text-white',
    outline: 'bg-transparent border border-gray-600 hover:border-white text-white hover:bg-gray-800',
    ghost: 'bg-transparent hover:bg-gray-800 text-white'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  const disabledClasses = 'opacity-60 cursor-not-allowed'
  
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e)
    }
  }
  
  return (
    <button
      ref={ref}
      className={`
        rounded-md font-medium transition duration-200
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${(disabled || loading) ? disabledClasses : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{typeof loading === 'string' ? loading : 'Loading...'}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button