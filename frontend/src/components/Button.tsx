import React, { useState } from 'react'

import Typography from '@/components/Typography'

const Button = ({
  children,
  onClick,
  disabled,
  size = 'M',
  loading = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  size?: 'L' | 'M' | 'S'
  loading?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)

  // Determine the background image and dimensions based on size
  const bgImage =
    size === 'L' ? 'btn_primary_big_m.png' : 'btn_primary_medium_m.png'
  const height = size === 'L' ? '64px' : '48px'

  const opacity = disabled ? 0.3 : isHovered ? 0.7 : 1

  const variant = size === 'L' ? 'body-1' : 'body-2'

  if (size === 'S') {
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className='flex items-center justify-center bg-primary rounded-md px-3 py-1'
      >
        <Typography variant='body-3' color='default' outline={false}>
          {children}
        </Typography>
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundImage: `url('/images/${bgImage}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        width: '240px',
        height: height,
        opacity,
      }}
      className='flex items-center justify-center'
    >
      {loading ? (
        <div className='flex items-center'>
          <svg
            className='animate-spin -ml-1 mr-3 h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='#333333'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='#333333'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        </div>
      ) : (
        <Typography variant={variant}>{children}</Typography>
      )}
    </button>
  )
}

export default Button
