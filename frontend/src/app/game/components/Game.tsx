'use client'

import { useEffect, useRef, useState } from 'react'

import GameLogs from './GameLogs'
import ScoreDisplay from './ScoreDisplay'
import { CardBattleScene } from '../scenes/CardBattleScene'
import { EventBridge } from '../utils/EventBridge'
import { CardData } from '../../../game/data/card'
import { BattleReplay } from '@/game/data/replay'

const playerCardData: CardData[] = [
  { name: 'WATER', attack: 4, health: 10, element: 'WATER' },
  { name: 'FIRE', attack: 8, health: 6, element: 'FIRE' },
  { name: 'METAL', attack: 6, health: 12, element: 'METAL' },
]

const opponentCardData: CardData[] = [
  { name: 'EARTH', attack: 4, health: 8, element: 'EARTH' },
  { name: 'WOOD', attack: 7, health: 7, element: 'WOOD' },
  { name: 'METAL', attack: 9, health: 9, element: 'METAL' },
]

const sampleBattleReplay: BattleReplay = {
  id: 'battle-001',
  playerCards: playerCardData,
  opponentCards: opponentCardData,
  actions: [
    { isPlayer: true, atkIdx: 0, defIdx: 0, damage: 4 },
    { isPlayer: false, atkIdx: 0, defIdx: 0, damage: 4 },
    { isPlayer: true, atkIdx: 0, defIdx: 0, damage: 4 },
    { isPlayer: true, atkIdx: 0, defIdx: 1, damage: 4 },
    { isPlayer: false, atkIdx: 1, defIdx: 0, damage: 7 },
    { isPlayer: true, atkIdx: 1, defIdx: 1, damage: 8 },
    { isPlayer: true, atkIdx: 1, defIdx: 2, damage: 8 },
    { isPlayer: false, atkIdx: 2, defIdx: 1, damage: 9 },
    { isPlayer: true, atkIdx: 2, defIdx: 2, damage: 6 },
  ],
}

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const gameInstanceRef = useRef<any>(null)
  const [battleLogs, setBattleLogs] = useState<string[]>([])
  const [scores, setScores] = useState({ player: 0, opponent: 0 })
  const [gameStatus, setGameStatus] = useState<
    'loading' | 'playing' | 'gameover'
  >('loading')

  useEffect(() => {
    const timer = setTimeout(() => {
      EventBridge.loadReplay(sampleBattleReplay)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const initPhaser = async () => {
      if (typeof window !== 'undefined') {
        const Phaser = (await import('phaser')).default

        if (gameInstanceRef.current) {
          gameInstanceRef.current.destroy(true)
        }

        EventBridge.onLogUpdate = (message: string) => {
          setBattleLogs((prevLogs) => [message, ...prevLogs.slice(0, 19)])
        }

        EventBridge.onScoreUpdate = (
          playerScore: number,
          opponentScore: number
        ) => {
          setScores({ player: playerScore, opponent: opponentScore })
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
          scene: [CardBattleScene],
          transparent: true,
        }

        gameInstanceRef.current = new Phaser.Game(config)
        setGameStatus('playing')
      }
    }

    initPhaser()

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true)

        EventBridge.reset()
      }
    }
  }, [])

  return (
    <div className='relative w-full max-w-[1200px] mx-auto'>
      <div className='bg-gradient-to-b from-slate-900 to-indigo-900 rounded-lg overflow-hidden shadow-2xl border border-indigo-700'>
        <div className='relative w-full aspect-[4/3] bg-slate-950'>
          <div ref={gameRef} className='game-container absolute inset-0' />
          {gameStatus === 'loading' && (
            <div className='absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-80 z-10'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4'></div>
                <div className='text-white text-xl'>Loading game...</div>
              </div>
            </div>
          )}
        </div>

        <div className='p-4 border-t border-indigo-700 bg-slate-800'>
          <ScoreDisplay
            playerScore={scores.player}
            opponentScore={scores.opponent}
          />
          <GameLogs logs={battleLogs} />
        </div>
      </div>
    </div>
  )
}

export default Game
