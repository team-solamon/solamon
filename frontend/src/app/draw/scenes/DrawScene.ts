import * as Phaser from 'phaser'

import { Button } from '../../../gameObjects/Button'
import { Background } from '../gameObjects/Background'
import { CardPack } from '../gameObjects/CardPack'
import { createElegantRings } from '../utils/effects'
import { getCardColor } from '@/data/card'
import { Card } from '@/gameObjects/Card'
import { EventBridge } from '../utils/EventBridge'
import { CardData, elementToString } from '@/lib/solana-helper'
import { loadAllCardAssets } from '@/lib/phaser-utils'

const LAYOUT = {
  CARD_Y: 250,
  INSTRUCTION_TEXT_Y: 450,
  REDRAW_BUTTON_Y: 520,
  LOADING_TEXT_Y: 300,
} as const

export class DrawScene extends Phaser.Scene {
  private cardPack: CardPack | null = null
  private card: Card | null = null
  private cardRevealed = false
  private instructionText: Phaser.GameObjects.Text | null = null
  private particles: Phaser.GameObjects.Shape[] = []
  private background: Background | null = null
  private redrawButton: Button | null = null
  private drawsCount = 0
  private particleTimers: Phaser.Time.TimerEvent[] = []
  private originalCameraZoom = 1

  private loadingText: Phaser.GameObjects.Text | null = null
  private loadingTween: Phaser.Tweens.Tween | null = null

  private config: { cards: CardData[] } | null = null

  constructor() {
    super({ key: 'CardScene' })
  }

  preload() {
    loadAllCardAssets(this)
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e')

    this.background = new Background(this, 400, 300)

    this.drawsCount = 0
    this.originalCameraZoom = this.cameras.main.zoom

    this.showLoadingAnimation()

    this.loadDrawConfiguration().then(() => {
      this.clearLoadingAnimation()
      this.createCardAndPack()
    })
  }

  private async loadDrawConfiguration() {
    return new Promise<void>((resolve) => {
      if (this.config) {
        resolve()
        return
      }

      EventBridge.setOnDrawDataLoaded((cards: CardData[]) => {
        this.config = { cards }
        resolve()
      })
    })
  }

  createCardAndPack() {
    const cards = this.config?.cards || []
    this.card = new Card(
      this,
      400,
      LAYOUT.CARD_Y,
      cards[this.drawsCount].element,
      cards[this.drawsCount].attack,
      cards[this.drawsCount].health,
      cards[this.drawsCount].element,
      cards[this.drawsCount].species,
      true
    )
    this.card.scaleX = 2.0
    this.card.scaleY = 2.0
    this.card.stopIdleAnimation()

    this.card.setFaceDown(true)
    this.cardPack = new CardPack(this, 400, LAYOUT.CARD_Y, this.card)

    this.cardPack.setOnReveal((card) => {
      if (!this.cardRevealed) {
        this.revealCard()
      }
    })

    this.tweens.add({
      targets: this.card,
      alpha: { from: 0.9, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 1000,
      ease: 'Sine.easeInOut',
    })

    this.instructionText = this.add
      .text(400, LAYOUT.INSTRUCTION_TEXT_Y, 'Click the card pack!', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
  }

  revealCard() {
    this.cardRevealed = true

    if (this.instructionText) {
      this.tweens.add({
        targets: this.instructionText,
        alpha: 0,
        duration: 300,
        ease: 'Sine.easeOut',
      })
    }

    if (this.cardPack) {
      this.cardPack.disableInteraction()
      this.cardPack.startRevealAnimation()

      this.tweens.add({
        targets: this.cameras.main,
        zoom: 1.3,
        duration: 800,
        ease: 'Sine.easeInOut',
      })
    }

    if (this.background) {
      this.tweens.add({
        targets: this.background.backgroundOverlay,
        alpha: 0.4,
        duration: 600,
        ease: 'Sine.easeOut',
      })
    }

    this.time.delayedCall(500, () => {
      this.startCardExtraction()
    })
  }

  startCardExtraction() {
    if (!this.card || !this.cardPack) return

    if (this.cardPack) {
      this.card.x = 400
      this.card.y = LAYOUT.CARD_Y + this.card.height / 2 - 30
      this.card.angle = 0
      this.card.setAlpha(1)
      this.card.setDepth(0.9)
    }

    const extractionSpeed = 0.6
    const extractDistance = 280

    this.cameras.main.startFollow(this.card, true, 0.1, 0.1)

    this.tweens.add({
      targets: this.card,
      y: `-=${extractDistance}`,
      angle: { from: 0, to: -720 },
      scaleX: { from: 2, to: 1.5 },
      scaleY: { from: 2, to: 1.5 },
      duration: 1500 * extractionSpeed,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.cameras.main.stopFollow()
        this.completeCardExtraction()
      },
    })

    this.time.delayedCall(200, () => {
      this.cameras.main.shake(300, 0.005)
    })
  }

  completeCardExtraction() {
    if (!this.card) return

    this.tweens.add({
      targets: this.cameras.main,
      scrollX: 0,
      scrollY: 0,
      zoom: this.originalCameraZoom,
      duration: 1200,
      ease: 'Back.easeOut',
    })

    this.tweens.add({
      targets: this.card,
      scaleX: { from: 1.5, to: 0 },
      duration: 600,
      ease: 'Back.easeIn',
      onComplete: () => {
        if (this.card) {
          this.card.angle = 0
          this.card.y -= 150
        }

        this.tweens.add({
          targets: this.card,
          scaleX: { from: 0, to: 2 },
          scaleY: { from: 1.3, to: 2 },
          y: { from: this.card!.y, to: LAYOUT.CARD_Y },
          duration: 600,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            if (this.card) {
              this.card.scaleX = 2
              this.card.scaleY = 2

              this.cameras.main.shake(300, 0.022)
              this.time.delayedCall(50, () => {
                this.card?.flipCard()
                this.card?.startIdleAnimation()
              })
            }

            this.createEffects()

            if (this.instructionText) {
              this.instructionText.setAlpha(1)
              this.instructionText.setText('Congratulations! You got a card!')
            }

            this.drawsCount++
            if (this.drawsCount < (this.config?.cards.length ?? 0)) {
              this.createRedrawButton()
            }
          },
        })
      },
    })
  }

  createEffects() {
    if (!this.card) return

    const color = getCardColor(this.card.element)
    const brighterColor =
      Phaser.Display.Color.ValueToColor(color).brighten(30).color
    const blendedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(color),
      Phaser.Display.Color.ValueToColor(0xffffff),
      100,
      20
    ).color

    createElegantRings(
      this,
      this.card.x,
      this.card.y,
      this.card.depth,
      brighterColor,
      3
    )

    createElegantRings(
      this,
      this.card.x,
      this.card.y,
      this.card.depth,
      blendedColor,
      2,
      500
    )

    const flashColor = Phaser.Display.Color.ValueToColor(color)
    this.cameras.main.flash(
      300,
      flashColor.red,
      flashColor.green,
      flashColor.blue,
      true
    )
    this.cameras.main.shake(300, 0.003)
  }

  createRedrawButton() {
    this.redrawButton = new Button(this, {
      x: 400,
      y: LAYOUT.REDRAW_BUTTON_Y,
      width: 200,
      height: 50,
      text: `Redraw (${this.config?.cards.length ?? 0 - this.drawsCount} left)`,
      backgroundColor: 0x4a6fa5,
      hoverColor: 0x6389c0,
      strokeColor: 0xffffff,
      strokeWidth: 2,
      depth: 5,
      textDepth: 6,
    })

    this.redrawButton.setOnClick(() => {
      this.redrawCard()
    })

    this.redrawButton.setAlpha(0)

    this.redrawButton.animateTo(
      {
        alpha: 1,
        y: LAYOUT.REDRAW_BUTTON_Y,
      },
      500,
      'Back.easeOut'
    )
  }

  redrawCard() {
    if (this.redrawButton) {
      this.redrawButton.animateTo(
        {
          alpha: 0,
          y: LAYOUT.REDRAW_BUTTON_Y,
        },
        300,
        'Back.easeIn',
        () => {
          if (this.redrawButton) {
            this.redrawButton.destroy()
            this.redrawButton = null
          }
        }
      )
    }

    if (this.instructionText) {
      this.tweens.add({
        targets: this.instructionText,
        alpha: 0,
        duration: 300,
        ease: 'Sine.easeOut',
      })
    }

    this.cleanupCardEffects(() => {
      this.resetCardState()
    })
  }

  cleanupCardEffects(callback?: () => void) {
    this.particleTimers.forEach((timer) => {
      if (timer) {
        timer.remove()
      }
    })
    this.particleTimers = []

    this.particles.forEach((p) => p.destroy())
    this.particles = []

    const targetsToRemove = []
    if (this.card) {
      targetsToRemove.push(this.card)
    }

    if (targetsToRemove.length > 0) {
      this.tweens.add({
        targets: targetsToRemove,
        alpha: 0,
        y: '+=30',
        scale: 0.9,
        duration: 400,
        ease: 'Back.easeIn',
        onComplete: () => {
          if (this.card) {
            this.card.destroy()
            this.card = null

            if (callback) {
              callback()
            }
          }
        },
      })
    } else {
      if (this.card) {
        this.card.destroy()
        this.card = null

        if (callback) {
          callback
        }
      }
    }
  }

  resetCardState() {
    this.time.delayedCall(400, () => {
      this.cameras.main.setScroll(0, 0)
      this.cameras.main.setZoom(this.originalCameraZoom)

      if (this.background) {
        this.tweens.add({
          targets: this.background.backgroundOverlay,
          alpha: 0,
          duration: 300,
        })
      }

      this.cardRevealed = false

      this.createCardAndPack()

      if (this.instructionText) {
        this.instructionText.setText('Click the card pack!')
      }
    })
  }

  private showLoadingAnimation() {
    this.loadingText = this.add
      .text(400, LAYOUT.LOADING_TEXT_Y, 'Loading cards', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(10)

    this.loadingTween = this.tweens.add({
      targets: this.loadingText,
      alpha: { from: 0.4, to: 1 },
      scale: { from: 0.95, to: 1.05 },
      yoyo: true,
      repeat: -1,
      duration: 700,
      ease: 'Sine.easeInOut',
    })
  }

  private clearLoadingAnimation() {
    if (this.loadingTween) {
      this.loadingTween.stop()
      this.loadingTween = null
    }

    if (this.loadingText) {
      this.loadingText.destroy()
      this.loadingText = null
    }
  }
}
