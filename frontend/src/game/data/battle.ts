import { CardData } from './card'

export type BattleStatus = {
  status: 'pending' | 'result'
  myCards: CardData[]
  opponentCards?: CardData[]
}
