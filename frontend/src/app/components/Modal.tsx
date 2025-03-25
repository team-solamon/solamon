'use client'

import React, { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title = 'Modal',
  children,
}) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='relative w-full max-w-[1200px] mx-auto bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden'>
        <div className='bg-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700'>
          <h2 className='text-white font-semibold'>{title}</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white focus:outline-none'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='p-4'>{children}</div>
      </div>
    </div>
  )
}

export default Modal
