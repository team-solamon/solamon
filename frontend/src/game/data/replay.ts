import { CardData } from './card'

export interface BattleAction {
  isPlayer: boolean
  atkIdx: number
  defIdx: number
  damage: number
}

export interface BattleReplay {
  id: string
  playerCards: CardData[]
  opponentCards: CardData[]
  actions: BattleAction[]
}
