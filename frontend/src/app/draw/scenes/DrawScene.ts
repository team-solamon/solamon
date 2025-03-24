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
  }

  createCardAndPack() {
    this.card = new Card(
      this,
      400,
      280,
      drawData[this.drawsCount].element,
      drawData[this.drawsCount].attack,
      drawData[this.drawsCount].health,
      drawData[this.drawsCount].element,
      true
    )
    this.card.scaleX = 1.5
    this.card.scaleY = 1.5

    this.card.setFaceDown(true)

    this.cardPack = new CardPack(this, 400, 300, this.card)
    this.cardPack.setOnReveal((card) => {
      if (!this.cardRevealed) {
        this.revealCard()
      }
    })
  }

  revealCard() {
    console.log('Revealing card')
    this.cardRevealed = true

    if (this.cardPack) {
      console.log('Disabling card pack interaction')
      this.cardPack.disableInteraction()
      this.cardPack.startRevealAnimation()
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
      console.log('Starting card extraction')
      this.startCardExtraction()
    })
  }

  startCardExtraction() {
    console.log('Starting card extraction animation', this.card)
    if (!this.card || !this.cardPack) return

    if (this.cardPack) {
      this.card.x = 400
      this.card.y = 300 + this.card.height / 2 - 30
      this.card.angle = 0
      this.card.setAlpha(1)
      this.card.setDepth(0.9)
    }

    let hintColor = 0xffffff
    const extractionSpeed = 0.7

    hintColor = getCardColor(this.card.element)

    const extractDistance = 250 + 30

    this.tweens.add({
      targets: this.card,
      y: `-=${extractDistance}`,
      duration: 1500 * extractionSpeed,
      ease: 'Cubic.easeInOut',
      onUpdate: (tween) => {
        const progress = tween.progress

        if (
          this.card &&
          this.cardPack &&
          progress > 0.2 &&
          progress < 0.8 &&
          Math.random() > 0.85
        ) {
          const particleX =
            this.card.x +
            Phaser.Math.Between(-this.card.width / 3, this.card.width / 3)
          const particleY = 300 - 250 / 2 + 10

          const friction = this.add.circle(
            particleX,
            particleY,
            2,
            hintColor,
            0.7
          )
          friction.setBlendMode(Phaser.BlendModes.ADD)
          this.particles.push(friction)

          this.tweens.add({
            targets: friction,
            y: '+=20',
            alpha: 0,
            scale: 0.5,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => {
              friction.destroy()
              this.particles = this.particles.filter((p) => p !== friction)
            },
          })
        }

        if (progress > 0.85 && progress < 0.9 && this.background) {
          this.tweens.add({
            targets: this.background.flashOverlay,
            alpha: { from: 0, to: 0.3 },
            duration: 200,
            yoyo: true,
            ease: 'Cubic.easeOut',
          })
        }
      },
      onComplete: () => {
        this.completeCardExtraction(hintColor)
      },
    })
  }

  completeCardExtraction(hintColor: number) {
    if (!this.card) return

    this.tweens.add({
      targets: this.card,
      angle: { from: 0, to: 360 },
      scaleX: { from: 1, to: 0 },
      duration: 500,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.tweens.add({
          targets: this.card,
          scaleX: { from: 0, to: 1.7 },
          scaleY: 1.3,
          angle: 0,
          y: 300,
          duration: 600,
          ease: 'Back.easeOut',
          onUpdate: (tween) => {
            const progress = tween.progress

            if (this.card && progress > 0.4 && progress < 0.6) {
              const shimmer = this.add.rectangle(
                this.card.x,
                this.card.y,
                this.card.width * 1.2,
                this.card.height * 1.2,
                hintColor,
                0.7
              )
              shimmer.setBlendMode(Phaser.BlendModes.ADD)
              this.particles.push(shimmer)

              this.tweens.add({
                targets: shimmer,
                alpha: 0,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                  shimmer.destroy()
                  this.particles = this.particles.filter((p) => p !== shimmer)
                },
              })

              if (this.background) {
                this.tweens.add({
                  targets: this.background.flashOverlay,
                  alpha: { from: 0, to: 0.4 },
                  duration: 150,
                  yoyo: true,
                  ease: 'Cubic.easeOut',
                })
              }
            }
          },
          onComplete: () => {
            if (this.card) {
              this.card.scaleX = 2
              this.card.scaleY = 2
              this.card.flipCard()
            }

            this.createParticleEffect()
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

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 30 + Math.random() * 60
      const size = 2 + Math.random() * 3

      const particle = this.add.circle(
        this.card.x,
        this.card.y,
        size,
        hintColor,
        0.8
      )
      particle.setBlendMode(Phaser.BlendModes.ADD)
      this.particles.push(particle)

      this.tweens.add({
        targets: particle,
        x: this.card.x + Math.cos(angle) * distance,
        y: this.card.y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.5,
        duration: 700 + Math.random() * 300,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy()
          this.particles = this.particles.filter((p) => p !== particle)
        },
      })
    }
  }

  createEffects() {
    if (!this.card) return

    const aura = this.add.rectangle(
      this.card.x,
      this.card.y,
      this.card.width * 2.2,
      this.card.height * 1.8,
      0xffdd00,
      0.2
    )
    aura.setBlendMode(Phaser.BlendModes.ADD)
    aura.setDepth(this.card.depth - 0.1)
    this.particles.push(aura)

    this.tweens.add({
      targets: aura,
      alpha: { from: 0.2, to: 0.4 },
      scale: { from: 0.9, to: 1.1 },
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: 'Sine.easeInOut',
    })

    if (this.card) {
      createElegantRings(
        this,
        this.card.x,
        this.card.y,
        this.card.depth,
        getCardColor(this.card.element),
        3
      )
      createElegantRings(
        this,
        this.card.x,
        this.card.y,
        this.card.depth,
        getCardColor(this.card.element),
        2,
        500
      )
    }

    this.cameras.main.flash(300, 255, 220, 80, true)
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
    console.log('Resetting card state')
    this.time.delayedCall(400, () => {
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

  createParticleEffect() {
    const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00, 0x0000ff]

    for (let i = 0; i < 100; i++) {
      this.createParticle(
        this.card!.x,
        this.card!.y,
        colors[Math.floor(Math.random() * colors.length)],
        5,
        2000
      )
    }

    const continuousParticleTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.cardRevealed || !this.card) return

        for (let i = 0; i < 3; i++) {
          const x = this.card.x + Phaser.Math.Between(-75, 75)
          const y = this.card.y + Phaser.Math.Between(-110, 110)
          this.createParticle(
            x,
            y,
            colors[Math.floor(Math.random() * colors.length)],
            3,
            800
          )
        }
      },
      repeat: -1,
    })

    this.particleTimers.push(continuousParticleTimer)

    let fireworkCount = 0
    const launchFirework = () => {
      if (fireworkCount >= 6 || !this.card) return

      const x = this.card.x + Phaser.Math.Between(-200, 200)
      const y = this.card.y + Phaser.Math.Between(-200, 100)
      const color = colors[Math.floor(Math.random() * colors.length)]

      for (let i = 0; i < 30; i++) {
        this.createParticle(x, y, color, 4, 1000)
      }

      fireworkCount++
      this.time.delayedCall(300, launchFirework)
    }

    launchFirework()

    if (this.card) {
      const rarityParticleTimer = this.time.addEvent({
        delay: 200,
        callback: () => {
          if (!this.card) return

          const color = 0xffdd00
          const x = this.card.x
          const startY = this.card.y - 110
          const endY = this.card.y + 110

          for (let i = 0; i < 2; i++) {
            const offsetX = Phaser.Math.Between(-60, 60)
            const particle = this.add.circle(x + offsetX, startY, 4, color)
            particle.setAlpha(0.8)
            this.particles.push(particle)

            this.tweens.add({
              targets: particle,
              y: endY,
              alpha: 0,
              scale: 0.5,
              duration: 1500,
              ease: 'Sine.easeIn',
              onComplete: () => {
                particle.destroy()
                this.particles = this.particles.filter((p) => p !== particle)
              },
            })
          }
        },
        repeat: 20,
      })

      this.particleTimers.push(rarityParticleTimer)
    }
  }

  createParticle(
    x: number,
    y: number,
    color: number,
    size: number,
    lifespan: number
  ) {
    const particle = this.add.circle(x, y, size, color)
    particle.setAlpha(0.8)
    this.particles.push(particle)

    this.tweens.add({
      targets: particle,
      alpha: 0,
      scale: 0.5,
      duration: lifespan,
      ease: 'Sine.easeIn',
      onComplete: () => {
        particle.destroy()
        this.particles = this.particles.filter((p) => p !== particle)
      },
    })
  }
}
