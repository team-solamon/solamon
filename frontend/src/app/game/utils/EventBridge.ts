import { BattleReplay } from '@/data/replay'

const noop = () => {
  return undefined
}

export class EventBridge {
  private static cachedReplay: BattleReplay | null = null
  static onLogUpdate: (message: string) => void = noop

  static onScoreUpdate: (playerScore: number, opponentScore: number) => void =
    noop

  static onOnReplayLoaded: (replay: BattleReplay) => void = noop

  static setOnReplayDataLoaded(callback: (cards: BattleReplay) => void): void {
    this.onOnReplayLoaded = callback
    if (this.cachedReplay) {
      callback(this.cachedReplay)
    }
  }

  static addLog(message: string) {
    if (this.onLogUpdate) {
      this.onLogUpdate(message)
    }
  }

  static updateScore(playerScore: number, opponentScore: number): void {
    this.onScoreUpdate(playerScore, opponentScore)
  }

  static loadReplay(replay: BattleReplay): void {
    this.cachedReplay = replay
    this.onOnReplayLoaded(replay)
  }

  static reset(): void {
    this.onLogUpdate = noop
    this.onScoreUpdate = noop
    this.onOnReplayLoaded = noop
  }
}
