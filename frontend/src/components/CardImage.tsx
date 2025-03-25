import React from 'react'
import { CardData, getCardTexture, getElementEmoji } from '@/game/data/card'

interface CardImageProps {
  card: CardData
}

const CardImage: React.FC<CardImageProps> = ({ card }) => {
  const getImageSrc = (card: CardData) => {
    return `/images/game/${getCardTexture(card.element)}.png`
  }

  return (
    <div className='card-image w-32 h-40 bg-gray-500 rounded-lg mb-2 relative'>
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
