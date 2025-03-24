export type CardElement = 'NONE' | 'FIRE' | 'WATER' | 'EARTH' | 'METAL' | 'WOOD'

export interface CardData {
  name: string
  attack: number
  health: number
  element: CardElement
}
