import React, { useState, useEffect } from 'react'
import { CardData } from '@/data/card'
import CardImage from './Card'

const TRANSITION_DURATION = 300
const ANIMATION_TIMEOUT = TRANSITION_DURATION

interface CardStackProps {
  cards: CardData[]
  className?: string
}

const CardStack: React.FC<CardStackProps> = ({ cards, className = '' }) => {
  const [displayedCards, setDisplayedCards] = useState<
    { id: number; card: CardData; position: number }[]
  >([])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (cards.length > 0) {
      setDisplayedCards(
        cards.slice(0, 3).map((card, idx) => ({
          id: idx,
          card,
          position: idx,
        }))
      )
    }
  }, [cards])

  const rotateCards = () => {
    if (isAnimating || cards.length <= 1) return

    setIsAnimating(true)

    const nextCardIndex =
      (displayedCards[displayedCards.length - 1].id + 1) % cards.length

    setDisplayedCards((currentCards) => {
      return currentCards.map((cardItem) => {
        if (cardItem.position === 0) {
          return { ...cardItem, position: 3 }
        }
        return { ...cardItem, position: cardItem.position - 1 }
      })
    })

    setTimeout(() => {
      setDisplayedCards((currentCards) => {
        const newCards = currentCards.filter((card) => card.position < 3)

        newCards.push({
          id: nextCardIndex,
          card: cards[nextCardIndex],
          position: 2,
        })

        return newCards
      })

      setIsAnimating(false)
    }, ANIMATION_TIMEOUT)
  }

  return (
    <div
      className={`relative w-[120px] h-[160px] ${className} cursor-pointer`}
      onClick={rotateCards}
    >
      {displayedCards.map((item) => {
        const displayPosition = item.position > 2 ? 2 : item.position

        return (
          <div
            key={item.id}
            className={`absolute top-0 left-0 transition-all duration-${TRANSITION_DURATION} ease-in-out`}
            style={{
              transform: `translate(${displayPosition * 10}px, ${
                displayPosition * 10
              }px)`,
              zIndex: 3 - item.position,
              opacity: item.position === 3 ? 0.4 : 1 - displayPosition * 0.2,
            }}
          >
            <CardImage
              card={item.card}
              width='100px'
              height='auto'
              maxWidth='100px'
              maxHeight='140px'
            />
          </div>
        )
      })}
    </div>
  )
}

export default CardStack
