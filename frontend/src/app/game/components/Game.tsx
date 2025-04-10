'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { getProgram } from '@/lib/helper'
import { ROUTES } from '@/lib/routes'
import {
  BattleAccount,
  getBattleAccount,
  getBattleAccountPDA,
  getBattleActions,
  ParsedBattleAction,
} from '@/lib/solana-helper'

import { AttackEvent, BattleReplay } from '@/data/replay'

import ResultModal from '@/components/modals/ResultModal'
import StoryModal from '@/components/modals/StoryModal'
import PhaserGame from '@/components/PhaserGame'

import { useModal } from '@/contexts/ModalContext'

import GameLogs from './GameLogs'
import ScoreDisplay from './ScoreDisplay'
import { CardBattleScene } from '../scenes/CardBattleScene'
import { EventBridge } from '../utils/EventBridge'

const Game: React.FC = () => {
  const searchParams = useSearchParams()
  const battleId = searchParams.get('battleId')
  const router = useRouter()
  const { connection } = useConnection()
  const program = getProgram(connection)
  const { publicKey } = useWallet()
  const [battleLogs, setBattleLogs] = useState<
    { message: string; color: string }[]
  >([])
  const [battleActions, setBattleActions] = useState<ParsedBattleAction[]>([])
  const [scores, setScores] = useState({ player: 0, opponent: 0 })
  const [battleAccount, setBattleAccount] = useState<BattleAccount | null>(null)
  const { openModal } = useModal()

  useEffect(() => {
    if (!battleId) {
      return
    }
    fetchBattleAccount(battleId)
    fetchBattleActions(battleId)
  }, [battleId])

  useEffect(() => {
    if (!publicKey) {
      alert('Please connect wallet first')
      router.push('/')
      return
    }

    const isPlayer1 = battleAccount?.player1.toString() === publicKey.toString()

    if (battleAccount && battleActions) {
      const battleReplay: BattleReplay = {
        id: battleAccount.battleId,
        playerCards: isPlayer1
          ? battleAccount.player1Solamons
          : battleAccount.player2Solamons,
        opponentCards: isPlayer1
          ? battleAccount.player2Solamons
          : battleAccount.player1Solamons,
        actions: battleActions.map((action) => ({
          isPlayer:
            action.player ===
            (isPlayer1
              ? battleAccount.player1.toString()
              : battleAccount.player2.toString()),
          atkIdx: action.atkIdx,
          defIdx: action.defIdx,
          damage: action.damage,
          attackType: action.event as AttackEvent,
        })),
      }
      const playerInitialHealth = battleReplay.playerCards.reduce(
        (acc, card) => acc + card.health,
        0
      )
      const opponentInitialHealth = battleReplay.opponentCards.reduce(
        (acc, card) => acc + card.health,
        0
      )
      setScores({
        player: playerInitialHealth,
        opponent: opponentInitialHealth,
      })
      const timer = setTimeout(() => {
        EventBridge.loadReplay(battleReplay)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [battleAccount, battleActions])

  const fetchBattleAccount = async (battleId: string) => {
    const battleAccount = await getBattleAccount(program, parseInt(battleId))
    console.log({ battleAccount })
    setBattleAccount(battleAccount)
  }

  const fetchBattleActions = async (battleId: string) => {
    const battleActions = await getBattleActions(
      connection,
      getBattleAccountPDA(program, parseInt(battleId))
    )
    if (battleActions) {
      setBattleActions(battleActions)
    }
  }

  const handleGameReady = () => {
    EventBridge.onLogUpdate = (message: string, color: string) => {
      setBattleLogs((prevLogs) => [{ message, color }, ...prevLogs])
    }

    EventBridge.onScoreUpdate = (
      playerScore: number,
      opponentScore: number
    ) => {
      setScores({ player: playerScore, opponent: opponentScore })
    }

    EventBridge.onGameFinished = (result: 'win' | 'lose') => {
      setTimeout(() => {
        fetchBattleAccount(battleId!).then(() => {
          openModal('result')
        })
      }, 3000)
    }
  }

  const phaserGame = useMemo(
    () => (
      <PhaserGame scenes={[CardBattleScene]} onGameReady={handleGameReady} />
    ),
    []
  )

  useEffect(() => {
    return () => {
      EventBridge.reset()
    }
  }, [])

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
      <ResultModal
        selectedBattle={battleAccount}
        showReplay={false}
        onClaim={() => {
          router.push(ROUTES.HOME)
        }}
      />
      <StoryModal selectedBattle={battleAccount} />
    </div>
  )
}

export default Game
