'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import PickedCards from '@/components/PickedCards'
import CardList from '@/components/CardList'
import Card from '@/components/Card'
import { CardData, stringToElement } from '@/lib/solana-helper'

const myCards: CardData[] = [
  {
    id: 1,
    species: 101,
    element: stringToElement('fire'),
    attack: 20,
    health: 20,
    isAvailable: true,
  },
  {
    id: 2,
    species: 102,
    element: stringToElement('water'),
    attack: 30,
    health: 10,
    isAvailable: true,
  },
  {
    id: 3,
    species: 103,
    element: stringToElement('earth'),
    attack: 10,
    health: 30,
    isAvailable: true,
  },
  {
    id: 4,
    species: 104,
    element: stringToElement('wood'),
    attack: 20,
    health: 20,
    isAvailable: true,
  },
  {
    id: 5,
    species: 105,
    element: stringToElement('metal'),
    attack: 10,
    health: 10,
    isAvailable: true,
  },
  {
    id: 6,
    species: 101,
    element: stringToElement('fire'),
    attack: 20,
    health: 20,
    isAvailable: true,
  },
  {
    id: 7,
    species: 102,
    element: stringToElement('water'),
    attack: 30,
    health: 10,
    isAvailable: true,
  },
  {
    id: 8,
    species: 103,
    element: stringToElement('earth'),
    attack: 10,
    health: 30,
    isAvailable: true,
  },
  {
    id: 9,
    species: 104,
    element: stringToElement('wood'),
    attack: 20,
    health: 20,
    isAvailable: true,
  },
  {
    id: 10,
    species: 105,
    element: stringToElement('metal'),
    attack: 10,
    health: 10,
    isAvailable: true,
  },
]

const enemyCards: CardData[] = [
  {
    id: 11,
    species: 201,
    element: stringToElement('water'),
    attack: 20,
    health: 20,
    isAvailable: true,
  },
  {
    id: 12,
    species: 202,
    element: stringToElement('earth'),
    attack: 20,
    health: 20,
    isAvailable: true,
  },
  {
    id: 13,
    species: 203,
    element: stringToElement('fire'),
    attack: 20,
    health: 20,
    isAvailable: true,
  },
]

const PrepareBattlePage = () => {
  const router = useRouter()
  const [pickedCards, setPickedCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(false)

  const handleCardPick = (card: CardData) => {
    if (pickedCards.includes(card)) {
      setPickedCards(pickedCards.filter((c) => c !== card))
    } else if (pickedCards.length < 3) {
      setPickedCards([...pickedCards, card])
    }
  }

  const handleCardRemove = (card: CardData) => {
    setPickedCards(pickedCards.filter((c) => c !== card))
  }

  const handleFight = async () => {
    if (pickedCards.length < 3) {
      console.log('Please pick 3 cards')
      return
    }

    setLoading(true)
    try {
      console.log('Starting battle with cards:', pickedCards)
    } catch (error) {
      console.error('Battle error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='prepare-battle-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <button
        className='text-yellow-400 text-2xl mb-4'
        onClick={() => router.back()}
      >
        &lt;
      </button>
      <h1 className='text-2xl font-semibold text-yellow-400 mb-4 text-center'>
        Pick Squad
      </h1>

      <div className='enemy-cards bg-gray-800 p-4 rounded-lg mb-4'>
        <h2 className='text-yellow-400 text-xl mb-2'>Enemy Card</h2>
        <div className='flex space-x-4'>
          {enemyCards.map((card, index) => (
            <Card key={index} card={card} />
          ))}
        </div>
      </div>

      <PickedCards
        pickedCards={pickedCards}
        onCardRemove={handleCardRemove}
        buttonLabel='Fight!'
        onButtonClick={handleFight}
        loading={loading}
        buttonDisabled={pickedCards.length < 3}
      />

      <CardList
        cards={myCards}
        pickedCards={pickedCards}
        onCardPick={handleCardPick}
      />
    </div>
  )
}

export default PrepareBattlePage
