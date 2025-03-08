import { forwardRef } from 'react'

const Input = forwardRef(({
  id,
  label,
  error,
  required,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-300"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={id}
        className={`
          w-full px-4 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
          ${error ? 'border-red-500' : 'border-gray-700'}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input