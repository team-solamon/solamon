'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Nav from '@/components/Nav'
import { BattleStatus } from '@/data/battle'

const fighters: BattleStatus[] = [
  {
    status: 'pending',
    myCards: [
      { name: 'FIRE', element: { fire: {} }, attack: 5, health: 3, species: 1 },
      {
        name: 'WATER',
        element: { water: {} },
        attack: 3,
        health: 6,
        species: 2,
      },
      {
        name: 'EARTH',
        element: { earth: {} },
        attack: 4,
        health: 5,
        species: 3,
      },
    ],
  },
  {
    status: 'pending',
    myCards: [
      {
        name: 'WATER',
        element: { water: {} },
        attack: 3,
        health: 6,
        species: 1,
      },
      {
        name: 'WATER',
        element: { water: {} },
        attack: 3,
        health: 6,
        species: 2,
      },
      {
        name: 'WATER',
        element: { water: {} },
        attack: 3,
        health: 6,
        species: 3,
      },
    ],
  },
  {
    status: 'pending',
    myCards: [
      {
        name: 'METAL',
        element: { metal: {} },
        attack: 6,
        health: 2,
        species: 1,
      },
      { name: 'WOOD', element: { wood: {} }, attack: 4, health: 4, species: 2 },
      { name: 'FIRE', element: { fire: {} }, attack: 5, health: 3, species: 3 },
    ],
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
                <Card
                  key={cardIndex}
                  species={card.species}
                  element={card.element}
                />
              ))}
            </div>
            <Button>
              Choose Fighter <span className='text-blue-400'>0.15</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChooseFighterPage
