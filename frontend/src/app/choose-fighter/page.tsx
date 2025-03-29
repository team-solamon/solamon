'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { CardData } from '@/lib/solana-helper'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Nav from '@/components/Nav'

const fighters: { myCards: CardData[]; cost: number }[] = [
  {
    myCards: [
      { name: 'FIRE', element: 'FIRE', attack: 20, health: 20 },
      { name: 'WATER', element: 'WATER', attack: 10, health: 30 },
      { name: 'EARTH', element: 'EARTH', attack: 10, health: 10 },
    ],
    cost: 0.15,
  },
  {
    myCards: [
      { name: 'WATER', element: 'WATER', attack: 20, health: 20 },
      { name: 'WATER', element: 'WATER', attack: 10, health: 30 },
      { name: 'WATER', element: 'WATER', attack: 30, health: 10 },
    ],
    cost: 0.15,
  },
  {
    myCards: [
      { name: 'FIRE', element: 'FIRE', attack: 30, health: 10 },
      { name: 'WATER', element: 'WATER', attack: 20, health: 20 },
      { name: 'EARTH', element: 'EARTH', attack: 20, health: 30 },
    ],
    cost: 0.15,
  },
]

const ChooseFighterPage = () => {
  const router = useRouter()

  return (
    <div className='choose-fighter-page bg-black text-white min-h-screen p-4'>
      <Nav />
      <button
        className='text-yellow-400 text-2xl mb-4'
        onClick={() => router.back()}
      >
        &lt;
      </button>
      <h1 className='text-2xl font-semibold text-yellow-400 mb-2 text-center'>
        Choose Your Fighter
      </h1>
      <p className='text-center text-yellow-400 mb-6'>
        Pick a squad to fight. You'll choose your own next.
      </p>
      <div className='fighters-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {fighters.map((fighter, index) => (
          <div
            key={index}
            className='fighter-card bg-[#978578] p-4 rounded-lg flex flex-col items-center'
          >
            <div className='cards flex gap-2 mb-4'>
              {fighter.myCards.map((card, cardIndex) => (
                <Card key={cardIndex} card={card} />
              ))}
            </div>
            <Button>
              Choose Fighter{' '}
              <span className='text-blue-400'>{fighter.cost}</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChooseFighterPage
