import React from 'react'

const Button = ({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className='bg-[#978578] text-white px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700'
    >
      {children}
    </button>
  )
}

export default Button
