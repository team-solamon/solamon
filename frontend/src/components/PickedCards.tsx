import React from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { CardData } from '@/data/card'

interface PickedCardsProps {
  pickedCards: CardData[]
  onCardRemove: (card: CardData) => void
  buttonLabel: string
  buttonDisabled: boolean
}

const PickedCards: React.FC<PickedCardsProps> = ({
  pickedCards,
  onCardRemove,
  buttonLabel,
  buttonDisabled,
}) => {
  return (
    <section className='picked-section bg-[#978578] p-4 rounded-lg mb-8'>
      <h2 className='text-xl font-semibold text-yellow-400 mb-4'>Picked</h2>
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
      <Button disabled={buttonDisabled}>
        {buttonLabel} <span className='text-blue-400'>0.1</span>
      </Button>
    </section>
  )
}

export default PickedCards
