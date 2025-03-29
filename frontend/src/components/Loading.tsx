import React from 'react'

interface LoadingProps {
  text?: string
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
  className?: string
}

const Loading: React.FC<LoadingProps> = ({
  text = 'Loading...',
  size = 'medium',
  fullScreen = false,
  className = '',
}) => {
  // Size mappings
  const sizeMap = {
    small: {
      spinner: 'h-6 w-6',
      text: 'text-sm',
    },
    medium: {
      spinner: 'h-12 w-12',
      text: 'text-xl',
    },
    large: {
      spinner: 'h-16 w-16',
      text: 'text-2xl',
    },
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'
    : 'flex items-center justify-center'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className='text-center'>
        <div
          className={`animate-spin rounded-full border-t-2 border-b-2 border-solamon-green mx-auto mb-4 ${sizeMap[size].spinner}`}
        ></div>
        {text && (
          <div className={`text-white ${sizeMap[size].text}`}>{text}</div>
        )}
      </div>
    </div>
  )
}

export default Loading
