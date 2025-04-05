'use client'

import React, { ReactNode, useEffect, useRef } from 'react'

import Typography from './Typography'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: string
  maxHeight?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title = 'Modal',
  children,
  maxWidth = '800px',
  maxHeight = '700px',
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      tabIndex={-1}
      ref={modalRef}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className='relative w-full max-w-[1200px] mx-auto bg-[#978578] rounded-lg shadow-2xl overflow-hidden'
        style={{
          maxWidth,
          maxHeight,
        }}
      >
        <div className='bg-[#978578] px-4 py-3 flex justify-center items-center'>
          <Typography variant='title-2'>{title}</Typography>
          <button onClick={onClose} className='absolute right-4 text-black'>
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
