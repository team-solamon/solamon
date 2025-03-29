import { CardData } from '@/lib/solana-helper'

const noop = () => {
  return undefined
}

export class EventBridge {
  private static cachedCards: CardData[] | null = null
  static onDrawDataLoaded: (cards: CardData[]) => void = noop

  static loadDrawData(cards: CardData[]): void {
    this.cachedCards = cards
    this.onDrawDataLoaded(cards)
  }

  static setOnDrawDataLoaded(callback: (cards: CardData[]) => void): void {
    this.onDrawDataLoaded = callback
    if (this.cachedCards) {
      callback(this.cachedCards)
    }
  }

  static reset(): void {
    this.cachedCards = null
    this.onDrawDataLoaded = noop
  }
}
