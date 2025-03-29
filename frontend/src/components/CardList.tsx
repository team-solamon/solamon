import React from 'react'
import Card from '@/components/Card'
import { CardData, CardElement, getElementEmoji } from '@/data/card'

interface CardListProps {
  cards: CardData[]
  pickedCards: CardData[]
  onCardPick: (card: CardData) => void
}

const CardList: React.FC<CardListProps> = ({
  cards,
  pickedCards,
  onCardPick,
}) => {
  const elementCounts = cards.reduce((counts, card) => {
    counts[card.element] = (counts[card.element] || 0) + 1
    return counts
  }, {} as { [key in CardElement]?: number })

  return (
    <section className='my-card-section bg-[#978578] p-4 rounded-lg'>
      <h2 className='text-xl font-semibold text-yellow-400 mb-4'>
        My Card | {cards.length}
      </h2>
      <div className='card-stats flex gap-4 text-lg mb-4'>
        {Object.entries(elementCounts).map(([element, count]) => (
          <span key={element}>
            {getElementEmoji(element as CardElement)} {count}
          </span>
        ))}
      </div>
      <div className='card-list grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {cards.map((card, index) => (
          <div
            key={index}
            className={`card bg-gray-700 p-4 rounded-lg flex flex-col items-center ${
              pickedCards.includes(card) ? 'opacity-50' : ''
            }`}
            onClick={() => onCardPick(card)}
          >
            <Card card={card} />
            {pickedCards.includes(card) && (
              <span className='text-black bg-yellow-400 px-2 py-1 rounded mt-2'>
                In Battle
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default CardList
