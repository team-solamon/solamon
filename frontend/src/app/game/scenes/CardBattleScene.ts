import * as Phaser from 'phaser'

import { BackgroundContainer } from '../gameObjects/Background'
import { Card } from '../../../gameObjects/Card'
import { GameResult } from '../gameObjects/GameResult'
import { performSingleAttack } from '../utils/BattleAnimations'
import { EventBridge } from '../utils/EventBridge'
import { BattleAction, BattleReplay } from '@/data/replay'
import { loadAllCardAssets } from '@/lib/phaser-utils'
import { getCardColor } from '@/data/card'
import { stringToElement } from '@/lib/solana-helper'

export class CardBattleScene extends Phaser.Scene {
  private playerCards: Card[] = []
  private opponentCards: Card[] = []
  private currentPlayerCardIndex = 0
  private currentOpponentCardIndex = 0
  private gameState: 'battling' | 'gameOver' = 'battling'
  private playerScore = 0
  private opponentScore = 0
  private gameResult: GameResult | null = null
  private backgroundContainer: BackgroundContainer | null = null
  private battleConfig: BattleReplay | null = null
  private currentActionIndex = 0

  constructor() {
    super({ key: 'CardBattleScene' })
  }

  preload() {
    this.load.image('battlefield', '/images/game/battlefield.png')

    // bgm
    this.load.audio('bgm-game', '/sounds/bgm-game.mp3')

    // sfx
    this.load.audio('sfx-card_flip', '/sounds/sfx-card_flip.mp3')
    this.load.audio('sfx-prepare_attack', '/sounds/sfx-prepare_attack.mp3')
    this.load.audio('stx-attack', '/sounds/stx-attack.mp3')
    this.load.audio('sfx-dead', '/sounds/sfx-dead.mp3')
    this.load.audio('sfx-hit', '/sounds/sfx-hit.mp3')
    this.load.audio('sfx-critical', '/sounds/sfx-critical.mp3')
    this.load.audio('sfx-halved', '/sounds/sfx-halved.mp3')

    loadAllCardAssets(this)
  }

  create() {
    this.createFadeOverlay()

    this.add
      .graphics()
      .fillStyle(0xffffff)
      .fillCircle(4, 4, 4)
      .generateTexture('spark', 8, 8).visible = false

    this.backgroundContainer = new BackgroundContainer(this)

    this.createPlayAreas()
    this.createEmptyCards()
    this.loadBattleConfiguration().then(() => this.initializeCardData())

    this.gameResult = new GameResult(this, 400, 300)

    this.sound
      .add('bgm-game', {
        volume: 0.7,
        loop: true,
      })
      .play()
  }

  private createFadeOverlay() {
    const fadeOverlay = this.add.rectangle(
      0,
      0,
      this.cameras.main.width * 2,
      this.cameras.main.height * 2,
      0x000000
    )
    fadeOverlay.setDepth(1000)

    this.tweens.add({
      targets: fadeOverlay,
      alpha: 0,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => {
        fadeOverlay.destroy()
      },
    })

    return fadeOverlay
  }

  createPlayAreas() {
    this.add
      .rectangle(400, 450, 700, 120, 0x0a1a2a)
      .setStrokeStyle(1, 0x3498db)
      .setAlpha(0.3)

    this.add
      .rectangle(400, 150, 700, 120, 0x2a0a0a)
      .setStrokeStyle(1, 0xe74c3c)
      .setAlpha(0.3)
  }

  private createEmptyCards() {
    this.playerCards = Array(3)
      .fill(null)
      .map(
        (_, i) =>
          new Card(
            this,
            250 + i * 150,
            450,
            '',
            0,
            0,
            stringToElement('fire'),
            0,
            true
          )
      )

    this.opponentCards = Array(3)
      .fill(null)
      .map(
        (_, i) =>
          new Card(
            this,
            250 + i * 150,
            150,
            '',
            0,
            0,
            stringToElement('fire'),
            0,
            false
          )
      )
    ;[...this.playerCards, ...this.opponentCards].forEach((card) => {
      card.setFaceDown(true)
    })
  }

  private async loadBattleConfiguration() {
    return new Promise<void>((resolve) => {
      if (this.battleConfig) {
        resolve()
        return
      }

      EventBridge.setOnReplayDataLoaded((replay: BattleReplay) => {
        if (this.battleConfig) {
          return
        }

        this.battleConfig = replay

        if (this.backgroundContainer) {
          this.backgroundContainer.fadeIn()
          this.backgroundContainer.animateBattlefield()
          this.backgroundContainer?.updateStatusText(
            'Prepare for battle!',
            true
          )
        }

        this.time.delayedCall(1500, this.startAutomaticBattles, [], this)

        resolve()
      })
    })
  }

  private initializeCardData() {
    if (!this.battleConfig) return

    this.playerCards.forEach((card, i) => {
      const data = this.battleConfig!.playerCards[i]
      card.updateCardData(data)
    })

    this.opponentCards.forEach((card, i) => {
      const data = this.battleConfig!.opponentCards[i]
      card.updateCardData(data)
    })

    this.revealCards()
  }

  private revealCards() {
    this.playerCards.forEach((card, i) => {
      this.time.delayedCall(500 + i * 300, () => {
        this.sound.play('sfx-card_flip', { volume: 0.7 })

        card.flipCard()
      })
    })

    this.opponentCards.forEach((card, i) => {
      this.time.delayedCall(1200 + i * 200, () => {
        this.sound.play('sfx-card_flip', { volume: 0.7 })

        card.flipCard()
      })
    })
  }

  async startAutomaticBattles() {
    if (this.gameState === 'battling') {
      const battlefieldElements =
        this.backgroundContainer?.getBattlefieldElements()

      if (battlefieldElements) {
        this.tweens.add({
          targets: [battlefieldElements.glow, battlefieldElements.particles],
          alpha: { from: 0.2, to: 1 },
          duration: 1000,
          ease: 'Power2',
        })
      }

      this.addBattleLog('⚔️ Battle begins! ⚔️')

      await this.startBattle()
    }
  }

  async startBattle() {
    if (this.gameState !== 'battling' || !this.battleConfig) return

    if (this.currentActionIndex >= this.battleConfig.actions.length) {
      await this.checkAndHandleGameEnd()
      return
    }

    const currentAction = this.battleConfig.actions[this.currentActionIndex++]

    const battleCards = this.findCardsForBattleAction(currentAction)
    const { attackerCard, defenderCard } = battleCards

    const isPlayerAttacking = currentAction.isPlayer
    const playerCard = isPlayerAttacking ? attackerCard : defenderCard
    const opponentCard = isPlayerAttacking ? defenderCard : attackerCard

    this.backgroundContainer?.updateStatusText(
      `Battle: ${playerCard.name} vs ${opponentCard.name}`,
      false
    )

    await this.positionCardsOnBattlefield(
      attackerCard,
      defenderCard,
      isPlayerAttacking
    )

    const damage = currentAction.damage
    const attackColor = getCardColor(attackerCard.element)

    this.sound.play('sfx-prepare_attack', { volume: 0.7 })
    await performSingleAttack(
      this,
      attackerCard,
      defenderCard,
      damage,
      currentAction.attackType,
      attackColor,
      this.addBattleLog.bind(this)
    )

    await this.delay(200)

    if (defenderCard.health <= 0) {
      this.sound.play('sfx-dead', { volume: 0.6 })
      await this.handleDefeatedCard(defenderCard, !isPlayerAttacking)
    }

    this.updateScore()
    this.time.delayedCall(1000, () => this.startBattle())
  }

  private findCardsForBattleAction(action: BattleAction) {
    const attackerCard = action.isPlayer
      ? this.playerCards[action.atkIdx]
      : this.opponentCards[action.atkIdx]

    const defenderCard = action.isPlayer
      ? this.opponentCards[action.defIdx]
      : this.playerCards[action.defIdx]

    return { attackerCard, defenderCard }
  }

  private async positionCardsOnBattlefield(
    attackerCard: Card,
    defenderCard: Card,
    isPlayerAttacking: boolean
  ) {
    const centerX = 400
    const battleY = 300
    const cardOffset = 120

    if (!attackerCard.isActive) {
      attackerCard.setActiveCard(true)
      this.addBattleLog(`🗡️ ${attackerCard.name} enters the battlefield!`)
      this.sound.play('sfx-card_flip', { volume: 0.7 })
      await attackerCard.moveToPosition(
        isPlayerAttacking ? centerX - cardOffset : centerX + cardOffset,
        battleY,
        600
      )
    }

    if (!defenderCard.isActive) {
      defenderCard.setActiveCard(true)
      this.addBattleLog(`⚔️ ${defenderCard.name} enters the battlefield!`)
      this.sound.play('sfx-card_flip', { volume: 0.7 })
      await defenderCard.moveToPosition(
        isPlayerAttacking ? centerX + cardOffset : centerX - cardOffset,
        battleY,
        600
      )
    }

    await this.delay(200)
  }

  private async checkAndHandleGameEnd() {
    const allOpponentCardsDefeated = this.opponentCards.every(
      (card) => card.health <= 0
    )
    const allPlayerCardsDefeated = this.playerCards.every(
      (card) => card.health <= 0
    )

    if (allOpponentCardsDefeated || allPlayerCardsDefeated) {
      const activeCards = [...this.playerCards, ...this.opponentCards].filter(
        (card) => card.isActive && card.health > 0
      )
      await Promise.all(
        activeCards.map((card) => card.returnToOriginalPosition(600))
      )
      this.endGame()
    }
  }

  private async handleDefeatedCard(card: Card, isPlayer: boolean) {
    await card.returnToOriginalPosition(600)
    card.setActiveCard(false)

    const cards = isPlayer ? this.playerCards : this.opponentCards
    const currentIndex = isPlayer
      ? this.currentPlayerCardIndex
      : this.currentOpponentCardIndex
    let nextIndex = currentIndex

    do {
      nextIndex = (nextIndex + 1) % cards.length
      if (cards[nextIndex].health > 0) {
        if (isPlayer) {
          this.currentPlayerCardIndex = nextIndex
        } else {
          this.currentOpponentCardIndex = nextIndex
        }
        break
      }
    } while (nextIndex !== currentIndex)
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  updateScore() {
    this.playerScore = this.playerCards.reduce((score, card) => {
      return score + (card.health > 0 ? 1 : 0)
    }, 0)

    this.opponentScore = this.opponentCards.reduce((score, card) => {
      return score + (card.health > 0 ? 1 : 0)
    }, 0)

    EventBridge.updateScore(this.playerScore, this.opponentScore)
  }

  addBattleLog(message: string) {
    EventBridge.addLog(message)
  }

  endGame() {
    this.gameState = 'gameOver'
    this.backgroundContainer?.hideStatusText()

    const resultMessage =
      this.gameResult?.show(this.playerScore, this.opponentScore) || ''
    this.addBattleLog('Battle ended: ' + resultMessage)
  }
}
