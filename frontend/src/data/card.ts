export type CardElement = 'NONE' | 'FIRE' | 'WATER' | 'EARTH' | 'METAL' | 'WOOD'

export interface CardData {
  name: string
  attack: number
  health: number
  element: CardElement
}

export function getRandomElement(): CardElement {
  const elements = ['FIRE', 'WATER', 'EARTH', 'METAL', 'WOOD']
  return elements[Math.floor(Math.random() * elements.length)] as CardElement
}

export function getCardColor(element: CardElement): number {
  switch (element) {
    case 'FIRE':
      return 0xff4500
    case 'WATER':
      return 0x1e90ff
    case 'EARTH':
      return 0x8b4513
    case 'METAL':
      return 0xc0c0c0
    case 'WOOD':
      return 0x228b22
    case 'NONE':
    default:
      return 0x333333
  }
}

export function getCardColorString(element: CardElement): string {
  return '#' + getCardColor(element).toString(16)
}

export function getElementEmoji(element: CardElement): string {
  switch (element) {
    case 'FIRE':
      return '🔥'
    case 'WATER':
      return '💧'
    case 'EARTH':
      return '🌍'
    case 'METAL':
      return '⚙️'
    case 'WOOD':
      return '🌳'
    case 'NONE':
    default:
      return '❓'
  }
}

export function getCardTexture(element: CardElement): string {
  switch (element) {
    case 'FIRE':
      return 'card-fire'
    case 'WATER':
      return 'card-water'
    case 'EARTH':
      return 'card-earth'
    case 'METAL':
      return 'card-metal'
    case 'WOOD':
      return 'card-wood'
    case 'NONE':
    default:
      return 'cardback'
  }
}
