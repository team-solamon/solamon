import React, { useEffect, useRef } from 'react'

import { DrawScene } from '@/app/draw/scenes/DrawScene'

const createGameConfig = (
  parent: HTMLElement | null
): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parent || undefined,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
      },
    },
    scene: [DrawScene],
  }
}

const DrawGame: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const gameInstanceRef = useRef<any>(null)

  useEffect(() => {
    const initPhaser = async () => {
      if (typeof window !== 'undefined') {
        const Phaser = (await import('phaser')).default

        if (gameInstanceRef.current) {
          gameInstanceRef.current.destroy(true)
        }

        const config = createGameConfig(gameRef.current)
        gameInstanceRef.current = new Phaser.Game(config)
      }
    }

    initPhaser()

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true)
      }
    }
  }, [])

  return (
    <div
      ref={gameRef}
      className='game-container'
      style={{ width: '800px', height: '600px', margin: '0 auto' }}
    />
  )
}

export default DrawGame
