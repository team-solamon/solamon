import { DrawableCards } from '@/game/data/draw'

const noop = () => {
  return undefined
}

export class EventBridge {
  private static cachedCards: DrawableCards | null = null
  static onDrawDataLoaded: (cards: DrawableCards) => void = noop

  static loadDrawData(cards: DrawableCards): void {
    this.cachedCards = cards
    this.onDrawDataLoaded(cards)
  }

  static setOnDrawDataLoaded(callback: (cards: DrawableCards) => void): void {
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
