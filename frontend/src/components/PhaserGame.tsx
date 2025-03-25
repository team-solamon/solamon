'use client'

import React, { useEffect, useRef, useState } from 'react'

interface PhaserGameProps {
  scenes: any[]
  onGameReady?: () => void
}

const PhaserGame: React.FC<PhaserGameProps> = ({ scenes, onGameReady }) => {
  const gameRef = useRef<HTMLDivElement>(null)
  const gameInstanceRef = useRef<any>(null)
  const [gameStatus, setGameStatus] = useState<'loading' | 'playing'>('loading')

  useEffect(() => {
    const initPhaser = async () => {
      if (typeof window !== 'undefined') {
        const Phaser = (await import('phaser')).default

        if (gameInstanceRef.current) {
          gameInstanceRef.current.destroy(true)
        }

        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: gameRef.current || undefined,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 600,
          },
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { x: 0, y: 0 },
            },
          },
          scene: scenes,
          transparent: true,
        }

        gameInstanceRef.current = new Phaser.Game(config)
        setGameStatus('playing')
        onGameReady?.()
      }
    }

    initPhaser()

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true)
      }
    }
  }, [scenes, onGameReady])

  return (
    <div className='bg-gradient-to-b from-slate-900 to-indigo-900 rounded-lg overflow-hidden shadow-2xl'>
      <div className='relative w-full aspect-[4/3] bg-slate-950'>
        <div ref={gameRef} className='game-container absolute inset-0' />
        {gameStatus === 'loading' && (
          <div className='absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-80 z-10'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4'></div>
              <div className='text-white text-xl'>Loading...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PhaserGame
