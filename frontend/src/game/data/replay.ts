import { CardData } from './card'

export type AttackType = 'NONE' | 'CRITICAL' | 'HALVED'

export interface BattleAction {
  isPlayer: boolean
  atkIdx: number
  defIdx: number
  damage: number
  attackType: AttackType
}

export interface BattleReplay {
  id: string
  playerCards: CardData[]
  opponentCards: CardData[]
  actions: BattleAction[]
}
