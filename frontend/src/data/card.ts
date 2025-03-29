import { Element, stringToElement, elementToString } from '@/lib/solana-helper'

export function getRandomElement(): Element {
  const elements = ['fire', 'water', 'earth', 'metal', 'wood']
  return stringToElement(elements[Math.floor(Math.random() * elements.length)])
}

export function getCardColor(element: Element): number {
  switch (elementToString(element)) {
    case 'fire':
      return 0xff4500
    case 'water':
      return 0x1e90ff
    case 'earth':
      return 0x8b4513
    case 'metal':
      return 0xc0c0c0
    case 'wood':
      return 0x228b22
    case 'none':
    default:
      return 0x333333
  }
}

export function getCardColorString(element: Element): string {
  return '#' + getCardColor(element).toString(16)
}

export function getElementEmoji(element: Element): string {
  switch (elementToString(element)) {
    case 'fire':
      return '🔥'
    case 'water':
      return '💧'
    case 'earth':
      return '🌍'
    case 'metal':
      return '⚙️'
    case 'wood':
      return '🌳'
    case 'none':
    default:
      return '❓'
  }
}

export function getCardTexture(element: Element): string {
  switch (elementToString(element)) {
    case 'fire':
      return 'card-fire'
    case 'water':
      return 'card-water'
    case 'earth':
      return 'card-earth'
    case 'metal':
      return 'card-metal'
    case 'wood':
      return 'card-wood'
    case 'none':
    default:
      return 'cardback'
  }
}
