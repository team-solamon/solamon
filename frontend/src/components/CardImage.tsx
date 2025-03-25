import React from 'react'

interface CardImageProps {
  id: string
}

const CardImage: React.FC<CardImageProps> = ({ id }) => {
  const getImageSrc = (id: string) => {
    return `/images/game/card-${id}.png`
  }

  return (
    <div className='card-image w-32 h-40 bg-gray-500 rounded-lg mb-2'>
      <img
        src={getImageSrc(id)}
        alt={`Card ${id}`}
        className='w-full h-full object-cover rounded-lg'
      />
    </div>
  )
}

export default CardImage
