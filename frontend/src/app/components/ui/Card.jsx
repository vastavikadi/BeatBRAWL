export default function Card({ children, className = '', ...props }) {
    return (
      <div 
        className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
  
  export function CardHeader({ children, className = '', ...props }) {
    return (
      <div 
        className={`px-6 py-4 border-b border-gray-800 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
  
  export function CardTitle({ children, className = '', ...props }) {
    return (
      <h3 
        className={`text-xl font-bold ${className}`}
        {...props}
      >
        {children}
      </h3>
    )
  }
  
  export function CardContent({ children, className = '', ...props }) {
    return (
      <div 
        className={`p-6 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
  
  export function CardFooter({ children, className = '', ...props }) {
    return (
      <div 
        className={`px-6 py-4 border-t border-gray-800 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }