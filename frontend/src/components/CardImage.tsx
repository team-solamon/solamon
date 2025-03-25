import React from 'react'
import { CardData, getCardTexture } from '@/game/data/card'

interface CardImageProps {
  card: CardData
}

const CardImage: React.FC<CardImageProps> = ({ card }) => {
  const getImageSrc = (card: CardData) => {
    return `/images/game/${getCardTexture(card.element)}.png`
  }

  return (
    <div className='card-image w-32 h-40 bg-gray-500 rounded-lg mb-2'>
      <img
        src={getImageSrc(card)}
        alt={`Card ${card.name}`}
        className='w-full h-full object-cover rounded-lg'
      />
    </div>
  )
}

export default CardImage
