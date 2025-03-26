'use client'

import { useEffect, useState, useMemo } from 'react'
import PhaserGame from '@/components/PhaserGame'
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
    { isPlayer: true, atkIdx: 0, defIdx: 0, damage: 4, attackType: 'CRITICAL' },
    { isPlayer: false, atkIdx: 0, defIdx: 0, damage: 4, attackType: 'HALVED' },
    { isPlayer: true, atkIdx: 0, defIdx: 0, damage: 4, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 0, defIdx: 1, damage: 4, attackType: 'NONE' },
    { isPlayer: false, atkIdx: 1, defIdx: 0, damage: 7, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 1, defIdx: 1, damage: 8, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 1, defIdx: 2, damage: 8, attackType: 'NONE' },
    { isPlayer: false, atkIdx: 2, defIdx: 1, damage: 9, attackType: 'NONE' },
    { isPlayer: true, atkIdx: 2, defIdx: 2, damage: 6, attackType: 'NONE' },
  ],
}

const Game: React.FC = () => {
  const [battleLogs, setBattleLogs] = useState<string[]>([])
  const [scores, setScores] = useState({ player: 0, opponent: 0 })

  // TODO Test setup
  useEffect(() => {
    const timer = setTimeout(() => {
      EventBridge.loadReplay(sampleBattleReplay)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleGameReady = () => {
    EventBridge.onLogUpdate = (message: string) => {
      setBattleLogs((prevLogs) => [message, ...prevLogs.slice(0, 19)])
    }

    EventBridge.onScoreUpdate = (
      playerScore: number,
      opponentScore: number
    ) => {
      setScores({ player: playerScore, opponent: opponentScore })
    }
  }

  const phaserGame = useMemo(
    () => (
      <PhaserGame scenes={[CardBattleScene]} onGameReady={handleGameReady} />
    ),
    []
  )

  return (
    <div className='relative w-full max-w-[1200px] mx-auto'>
      <div className='bg-gradient-to-b from-slate-900 to-indigo-900 rounded-lg overflow-hidden shadow-2xl border'>
        {phaserGame}
        <div className='p-4 border-t bg-slate-800'>
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
