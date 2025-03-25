import React from 'react'
import { CardData, getCardTexture, getElementEmoji } from '@/game/data/card'

interface CardImageProps {
  card: CardData
  width?: string | number
  height?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  className?: string
}

const CardImage: React.FC<CardImageProps> = ({
  card,
  width = '100%',
  height = 'auto',
  maxWidth = '300px',
  maxHeight = '400px',
  className = '',
}) => {
  const getImageSrc = (card: CardData) => {
    return `/images/game/${getCardTexture(card.element)}.png`
  }

  return (
    <div
      className={`card-image aspect-[4/5] bg-gray-500 rounded-lg mb-2 relative ${className}`}
      style={{ width, height, maxWidth, maxHeight }}
    >
      <img
        src={getImageSrc(card)}
        alt={`Card ${card.name}`}
        className='w-full h-full object-cover rounded-lg'
      />
      <div className='absolute top-1 left-1 bg-white bg-opacity-75 rounded-full p-1 text-sm'>
        {getElementEmoji(card.element)}
      </div>
    </div>
  )
}

export default CardImage
