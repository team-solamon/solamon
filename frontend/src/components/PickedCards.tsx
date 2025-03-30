import React from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { CardData } from '@/lib/solana-helper'
import Typography from './Typography'
import CardStats from './CardStats'

interface PickedCardsProps {
  pickedCards: CardData[]
  onCardRemove: (card: CardData) => void
  buttonLabel: string
  buttonDisabled: boolean
  loading?: boolean
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
    <section className='picked-section bg-[#978578] p-4 rounded-lg mb-8 max-w-[1000px] mx-auto'>
      <Typography variant='title-2'>Picked</Typography>
      <Typography
        variant='body-2'
        color='inverse'
        className='text-center mb-4'
        outline={false}
      >
        Select 3 cards from My Cards.
      </Typography>
      <div className='picked-cards flex gap-4 mb-4 justify-center'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='card-slot bg-[rgba(202,193,185,1)] p-4 rounded-lg flex items-center justify-center w-[210px] h-[280px]'
          >
            {pickedCards[index] ? (
              <div className='relative w-full h-full flex flex-col items-center justify-center'>
                <Card
                  species={pickedCards[index].species}
                  element={pickedCards[index].element}
                  onClick={() => onCardRemove(pickedCards[index])}
                />
                <CardStats
                  attack={pickedCards[index].attack}
                  health={pickedCards[index].health}
                />
              </div>
            ) : (
              <Typography variant='display-title-1'>?</Typography>
            )}
          </div>
        ))}
      </div>
      <div className='flex justify-center'>
        <Button
          disabled={buttonDisabled}
          onClick={onButtonClick}
          loading={loading}
        >
          {buttonLabel}
        </Button>
      </div>
    </section>
  )
}

export default PickedCards
