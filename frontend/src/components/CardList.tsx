import React from 'react'
import Card from '@/components/Card'
import { CardData, elementToString, stringToElement } from '@/lib/solana-helper'
import { getElementEmoji } from '@/data/card'
import Typography from './Typography'

interface CardListProps {
  cards: CardData[]
  pickedCards?: CardData[]
  onCardPick?: (card: CardData) => void
}

const getElementCounts = (cards: CardData[]) => {
  const counts: { [key: string]: number } = {
    fire: 0,
    water: 0,
    earth: 0,
    metal: 0,
    wood: 0,
  }

  cards.forEach((card: CardData) => {
    if (counts[elementToString(card.element)] !== undefined) {
      counts[elementToString(card.element)]++
    }
  })

  return counts
}

const CardList: React.FC<CardListProps> = ({
  cards,
  pickedCards,
  onCardPick,
}) => {
  return (
    <section className='my-card-section bg-[#978578] p-4 rounded-lg'>
      <Typography variant='title-2'>My Card | {cards.length}</Typography>
      <div className='card-stats flex gap-4 text-lg mb-4'>
        {Object.entries(getElementCounts(cards)).map(
          ([element, count]) =>
            count > 0 && (
              <span key={element}>
                {getElementEmoji(stringToElement(element))} {count}
              </span>
            )
        )}
      </div>
      <div className='card-list grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'>
        {cards.map((card, index) => (
          <div
            key={index}
            className='card bg-[rgba(202,193,185,1)]  p-2 rounded-lg flex flex-col items-center relative'
            onClick={() => onCardPick && onCardPick(card)}
          >
            <Card card={card} className='mx-auto' />
            {pickedCards && pickedCards.includes(card) && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='bg-black opacity-70 w-full h-full absolute rounded-lg'></div>
                <div className='bg-black rounded-full px-4 py-2 relative'>
                  <span className='text-yellow-400'>In Battle</span>
                </div>
              </div>
            )}

            <div className='flex items-end gap-8 bg-[rgba(19,19,19,0.7)] p-2 rounded-2xl absolute bottom-8 '>
              <Typography variant='caption-1'>{`⚔️ ${card.attack}`}</Typography>
              <Typography variant='caption-1'>
                {`♥️️ ${card.health}`}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CardList
