import { BattleReplay } from '@/data/replay'

const noop = () => {
  return undefined
}

export class EventBridge {
  public static mute: boolean = false
  private static cachedReplay: BattleReplay | null = null

  static onLogUpdate: (message: string, color: string) => void = noop

  static onScoreUpdate: (playerScore: number, opponentScore: number) => void =
    noop

  static onGameFinished: (result: 'win' | 'lose') => void = noop

  static onOnReplayLoaded: (replay: BattleReplay) => void = noop

  static setOnReplayDataLoaded(callback: (cards: BattleReplay) => void): void {
    this.onOnReplayLoaded = callback
    if (this.cachedReplay) {
      callback(this.cachedReplay)
    }
  }

  static addLog(message: string, color: string): void {
    if (this.onLogUpdate) {
      this.onLogUpdate(message, color)
    }
  }

  static setGameFinished(result: 'win' | 'lose'): void {
    this.onGameFinished(result)
  }

  static updateScore(playerScore: number, opponentScore: number): void {
    this.onScoreUpdate(playerScore, opponentScore)
  }

  static loadReplay(replay: BattleReplay): void {
    this.cachedReplay = replay
    this.onOnReplayLoaded(replay)
  }

  static reset(): void {
    this.mute = false
    this.cachedReplay = null
    this.onLogUpdate = noop
    this.onScoreUpdate = noop
    this.onOnReplayLoaded = noop
    this.onGameFinished = noop
  }
}
