'use client'

import React, { useEffect } from 'react'
import PhaserGame from '@/components/PhaserGame'
import { DrawScene } from '@/app/draw/scenes/DrawScene'
import { EventBridge } from '../util/EventBridge'
import { DrawableCards } from '@/game/data/draw'

const drawableCards: DrawableCards = {
  cards: [
    { name: 'FIRE', element: 'FIRE', attack: 5, health: 3 },
    { name: 'WATER', element: 'WATER', attack: 3, health: 6 },
    { name: 'EARTH', element: 'EARTH', attack: 4, health: 5 },
    { name: 'METAL', element: 'METAL', attack: 6, health: 2 },
    { name: 'WOOD', element: 'WOOD', attack: 4, health: 4 },
  ],
}

const DrawGame: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      EventBridge.loadDrawData(drawableCards)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='relative w-full max-w-[1200px] mx-auto'>
      <div className='bg-gradient-to-b from-slate-900 to-indigo-900 rounded-lg overflow-hidden shadow-2xl border'>
        <PhaserGame scenes={[DrawScene]} />
      </div>
    </div>
  )
}

export default DrawGame
