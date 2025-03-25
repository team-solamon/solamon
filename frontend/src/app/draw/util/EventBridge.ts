import { DrawableCards } from '@/game/data/draw'

const noop = () => {
  return undefined
}

export class EventBridge {
  static onDrawDataLoaded: (cards: DrawableCards) => void = noop

  static loadDrawData(cards: DrawableCards): void {
    this.onDrawDataLoaded(cards)
  }

  static reset(): void {
    this.onDrawDataLoaded = noop
  }
}
