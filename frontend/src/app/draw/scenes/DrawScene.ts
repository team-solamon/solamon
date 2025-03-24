import * as Phaser from 'phaser'

import { Button } from '../../../game/gameObjects/Button'
import { Background } from '../gameObjects/Background'
import { CardPack } from '../gameObjects/CardPack'
import { createElegantRings } from '../util/effects'
import { CardElement, getCardColor } from '@/game/data/card'
import { Card } from '@/game/gameObjects/Card'

interface CardData {
  element: CardElement
  attack: number
  health: number
}

const drawData: CardData[] = [
  { element: 'FIRE', attack: 5, health: 3 },
  { element: 'WATER', attack: 3, health: 6 },
  { element: 'EARTH', attack: 4, health: 5 },
  { element: 'METAL', attack: 6, health: 2 },
  { element: 'WOOD', attack: 4, health: 4 },
]

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

  constructor() {
    super({ key: 'CardScene' })
  }

  preload() {
    this.load.image('cardpack', '/images/game/cardpack.png')
    this.load.image('cardback', '/images/game/cardback.png')

    this.load.image('card-fire', '/images/game/card-fire.png')
    this.load.image('card-water', '/images/game/card-water.png')
    this.load.image('card-earth', '/images/game/card-earth.png')
    this.load.image('card-metal', '/images/game/card-metal.png')
    this.load.image('card-wood', '/images/game/card-wood.png')
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e')

    this.background = new Background(this, 400, 300)

    this.createCardAndPack()

    this.instructionText = this.add
      .text(400, 500, 'Click the card pack!', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: this.card,
      alpha: { from: 0.9, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 1000,
      ease: 'Sine.easeInOut',
    })

    this.drawsCount = 0
    this.originalCameraZoom = this.cameras.main.zoom
  }

  createCardAndPack() {
    this.card = new Card(
      this,
      400,
      300,
      drawData[this.drawsCount].element,
      drawData[this.drawsCount].attack,
      drawData[this.drawsCount].health,
      drawData[this.drawsCount].element,
      true
    )
    this.card.scaleX = 2.0
    this.card.scaleY = 2.0
    this.card.stopIdleAnimation()

    this.card.setFaceDown(true)
    this.cardPack = new CardPack(this, 400, 300, this.card)

    this.cardPack.setOnReveal((card) => {
      if (!this.cardRevealed) {
        this.revealCard()
      }
    })
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
      this.card.y = 300 + this.card.height / 2 - 30
      this.card.angle = 0
      this.card.setAlpha(1)
      this.card.setDepth(0.9)
    }

    const extractionSpeed = 0.7
    const extractDistance = 250 + 30

    this.cameras.main.startFollow(this.card, true, 0.1, 0.1)

    this.tweens.add({
      targets: this.card,
      y: `-=${extractDistance}`,
      duration: 1500 * extractionSpeed,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.cameras.main.stopFollow()
        this.completeCardExtraction()
      },
    })
  }

  completeCardExtraction() {
    if (!this.card) return

    this.tweens.add({
      targets: this.cameras.main,
      scrollX: 0,
      scrollY: 0,
      zoom: this.originalCameraZoom,
      duration: 1000,
      ease: 'Sine.easeInOut',
    })

    this.tweens.add({
      targets: this.card,
      angle: { from: 0, to: 360 },
      scaleX: { from: 1, to: 0 },
      duration: 500,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.tweens.add({
          targets: this.card,
          scaleX: { from: 0, to: 2 },
          scaleY: { from: 1.3, to: 2 },
          angle: 0,
          y: { from: this.card!.y, to: 300 },
          duration: 1200,
          ease: 'Back.easeOut',
          easeParams: [1.7],
          onComplete: () => {
            if (this.card) {
              this.card.scaleX = 2
              this.card.scaleY = 2
              this.card.flipCard()
              this.card.startIdleAnimation()
            }

            this.createEffects()

            if (this.instructionText) {
              this.instructionText.setText('Congratulations! You got a card!')
            }

            this.drawsCount++
            if (this.drawsCount < drawData.length) {
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
      y: 550,
      width: 200,
      height: 50,
      text: `Redraw (${drawData.length - this.drawsCount} left)`,
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
        y: 550,
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
          y: 550,
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
}
