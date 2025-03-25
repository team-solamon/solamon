import React from 'react'

const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className='bg-[#978578] text-white px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700'
    >
      {children}
    </button>
  )
}

export default Button
