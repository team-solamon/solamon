import React from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { CardData } from '@/lib/solana-helper'
import Typography from './Typography'

interface PickedCardsProps {
  pickedCards: CardData[]
  onCardRemove: (card: CardData) => void
  buttonLabel: string
  buttonDisabled: boolean
  loading: boolean
  onButtonClick: () => void
}

const PickedCards: React.FC<PickedCardsProps> = ({
  pickedCards,
  onCardRemove,
  buttonLabel,
  buttonDisabled,
  loading,
  onButtonClick,
}) => {
  return (
    <section className='picked-section bg-[#978578] p-4 rounded-lg mb-8'>
      <Typography variant='title-2'>Picked</Typography>
      <div className='picked-cards flex gap-4 mb-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='card-slot bg-gray-700 p-4 rounded-lg flex items-center justify-center'
          >
            {pickedCards[index] ? (
              <Card
                card={pickedCards[index]}
                onClick={() => onCardRemove(pickedCards[index])}
              />
            ) : (
              <span className='text-gray-400'>?</span>
            )}
          </div>
        ))}
      </div>
      <Button
        disabled={buttonDisabled}
        onClick={onButtonClick}
        loading={loading}
      >
        {buttonLabel} <span className='text-blue-400'>0.1</span>
      </Button>
    </section>
  )
}

export default PickedCards
