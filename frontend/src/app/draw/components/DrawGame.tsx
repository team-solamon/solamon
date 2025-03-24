'use client'

import React from 'react'
import PhaserGame from '@/components/PhaserGame'
import { DrawScene } from '@/app/draw/scenes/DrawScene'

const DrawGame: React.FC = () => {
  return (
    <div className='relative w-full max-w-[1200px] mx-auto'>
      <div className='bg-gradient-to-b from-slate-900 to-indigo-900 rounded-lg overflow-hidden shadow-2xl border'>
        <PhaserGame scenes={[DrawScene]} />
      </div>
    </div>
  )
}

export default DrawGame
