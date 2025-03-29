'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CardData } from '@/data/card'
import Nav from '@/components/Nav'
import PickedCards from '@/components/PickedCards'
import CardList from '@/components/CardList'

const myCards: CardData[] = [
  { name: 'FIRE', element: 'FIRE', attack: 20, health: 20 },
  { name: 'WATER', element: 'WATER', attack: 30, health: 10 },
  { name: 'EARTH', element: 'EARTH', attack: 10, health: 30 },
  { name: 'WOOD', element: 'WOOD', attack: 20, health: 20 },
  { name: 'METAL', element: 'METAL', attack: 10, health: 10 },
  { name: 'FIRE', element: 'FIRE', attack: 20, health: 20 },
  { name: 'WATER', element: 'WATER', attack: 30, health: 10 },
  { name: 'EARTH', element: 'EARTH', attack: 10, health: 30 },
  { name: 'WOOD', element: 'WOOD', attack: 20, health: 20 },
  { name: 'METAL', element: 'METAL', attack: 10, health: 10 },
]

const OpenBattlePage = () => {
  const router = useRouter()
  const [pickedCards, setPickedCards] = useState<CardData[]>([])

  const handleCardPick = (card: CardData) => {
    if (pickedCards.length < 3 && !pickedCards.includes(card)) {
      setPickedCards([...pickedCards, card])
    }
  }

  const handleCardRemove = (card: CardData) => {
    setPickedCards(pickedCards.filter((c) => c !== card))
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
        Open Battle
      </h1>

      <PickedCards
        pickedCards={pickedCards}
        onCardRemove={handleCardRemove}
        buttonLabel='Open Battle'
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

export default OpenBattlePage
