'use client'

import React, { useEffect } from 'react'
import PhaserGame from '@/components/PhaserGame'
import { DrawScene } from '@/app/draw/scenes/DrawScene'
import { EventBridge } from '../util/EventBridge'
import { DrawableCards } from '@/game/data/draw'

interface DrawGameProps {
  onClose?: () => void
  drawableCards: DrawableCards
}

const DrawGame: React.FC<DrawGameProps> = ({ onClose, drawableCards }) => {
  const handleGameReady = () => {
    console.log('Game is ready, setting draw data', drawableCards)
    EventBridge.loadDrawData(drawableCards)
  }

  return (
    <div className='relative w-full max-w-[1200px] mx-auto'>
      <PhaserGame scenes={[DrawScene]} onGameReady={handleGameReady} />
    </div>
  )
}

export default DrawGame
