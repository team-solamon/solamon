import { CardData } from '@/lib/solana-helper'

export type AttackEvent = 'NONE' | 'CRITICAL' | 'HALVED'

export interface BattleAction {
  isPlayer: boolean
  atkIdx: number
  defIdx: number
  damage: number
  attackType: AttackEvent
}

export interface BattleReplay {
  id: string
  playerCards: CardData[]
  opponentCards: CardData[]
  actions: BattleAction[]
}
