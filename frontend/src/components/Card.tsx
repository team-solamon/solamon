import React from 'react'

import { getElementEmoji } from '@/data/card'

interface CardImageProps {
  species: number
  element?: number
  width?: string | number
  height?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  className?: string
  onClick?: () => void
}

const Card: React.FC<CardImageProps> = ({
  species,
  element,
  width = '100%',
  height = 'auto',
  maxWidth = '300px',
  maxHeight = '400px',
  className = '',
  onClick,
}) => {
  const getImageSrc = (species: number) => {
    return `/images/species/${species}.png`
  }

  return (
    <div
      className={`card-image aspect-[4/5] bg-gray-500 rounded-lg mb-2 relative ${className}`}
      style={{ width, height, maxWidth, maxHeight }}
      onClick={onClick}
    >
      <img
        src={getImageSrc(species)}
        className='w-full h-full object-cover rounded-lg'
      />
      {element !== undefined && (
        <div className='absolute top-1 left-1 bg-white bg-opacity-75 rounded-full p-1 text-sm'>
          {getElementEmoji(element)}
        </div>
      )}
    </div>
  )
}

export default Card
