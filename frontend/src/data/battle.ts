import { CardData } from './card'

export type BattleStatus =
  | {
      status: 'pending'
      myCards: CardData[]
      opponentCards?: CardData[]
    }
  | {
      status: 'result'
      myCards: CardData[]
      opponentCards?: CardData[]
      isPlayerWinner: boolean
    }
