import { BattleReplay } from '@/game/data/replay'

const noop = () => {
  return undefined
}

export class EventBridge {
  static onLogUpdate: (message: string) => void = noop

  static onScoreUpdate: (playerScore: number, opponentScore: number) => void =
    noop

  static onReplayLoaded: (replay: BattleReplay) => void = noop

  static addLog(message: string) {
    if (this.onLogUpdate) {
      this.onLogUpdate(message)
    }
  }

  static updateScore(playerScore: number, opponentScore: number): void {
    this.onScoreUpdate(playerScore, opponentScore)
  }

  static loadReplay(replay: BattleReplay): void {
    this.onReplayLoaded(replay)
  }

  static reset(): void {
    this.onLogUpdate = noop
    this.onScoreUpdate = noop
    this.onReplayLoaded = noop
  }
}
