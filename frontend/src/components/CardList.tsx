import React from 'react'

import { CardData, elementToString, stringToElement } from '@/lib/solana-helper'

import { getElementEmoji } from '@/data/card'

import Card from '@/components/Card'

import { useModal } from '@/contexts/ModalContext'

import Button from './Button'
import CardStats from './CardStats'
import Balance from './Balance'
import Typography from './Typography'
import { NEW_CARD_SOL_PRICE } from '@/constant/env'

interface CardListProps {
  cards: CardData[]
  pickedCards?: CardData[]
  showInBattle?: boolean
  onCardPick?: (card: CardData) => void
  onPurchaseCard?: () => void
  onRedeemCard?: (card: CardData) => void
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
  showInBattle,
  onCardPick,
  onRedeemCard,
}) => {
  const { openModal } = useModal()

  return (
    <section className='my-card-section bg-[#978578] p-4 rounded-lg max-w-[1000px] mx-auto'>
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
      {cards.length === 0 ? (
        <div className='text-center py-10'>
          <Typography variant='body-1' color='inverse' outline={false}>
            No card yet.
            <br />
            Draw your cards and start a battle!
          </Typography>
          <div className='flex justify-center mt-4'>
            <Button onClick={() => openModal('purchaseCard')}>
              <div className='flex items-center gap-1'>
                Stake and Draw Card
                <Balance balance={NEW_CARD_SOL_PRICE} />
              </div>
            </Button>
          </div>
        </div>
      ) : (
        <div className='card-list grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'>
          {cards.map((card, index) => (
            <div
              key={index}
              className='card bg-[rgba(202,193,185,1)] p-2 rounded-lg flex flex-col items-center relative hover:bg-[#FFD400] transition-colors'
              onClick={() => {
                if (card.isAvailable) {
                  onCardPick && onCardPick(card)
                }
              }}
            >
              <Card
                species={card.species}
                element={card.element}
                className='mx-auto'
              />
              {pickedCards && pickedCards.includes(card) && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='bg-black opacity-70 w-full h-full absolute rounded-lg'></div>
                  <div className='bg-primary rounded-2xl px-4 py-2 relative'>
                    <Typography
                      variant='body-2'
                      color='default'
                      outline={false}
                    >
                      Picked
                    </Typography>
                  </div>
                </div>
              )}
              {showInBattle && !card.isAvailable && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='bg-black opacity-70 w-full h-full absolute rounded-lg'></div>
                  <div className='bg-black rounded-full px-4 py-2 relative'>
                    <span className='text-yellow-400'>In Battle</span>
                  </div>
                </div>
              )}

              <CardStats attack={card.attack} health={card.health} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default CardList
