import * as Phaser from 'phaser'

import { Button } from '../../../game/gameObjects/Button'
import { Card, CardRarity } from '../gameObjects/Card'

export class DrawScene extends Phaser.Scene {
  private cardPack: Phaser.GameObjects.Rectangle | null = null
  private card: Card | null = null
  private cardRevealed = false
  private instructionText: Phaser.GameObjects.Text | null = null
  private questionMark: Phaser.GameObjects.Text | null = null
  private particles: Phaser.GameObjects.Shape[] = []
  private backgroundOverlay: Phaser.GameObjects.Rectangle | null = null
  private flashOverlay: Phaser.GameObjects.Rectangle | null = null
  private glowEffect: Phaser.GameObjects.Rectangle | null = null
  private redrawButton: Button | null = null
  private drawsCount = 0
  private maxDraws = 5
  private particleTimers: Phaser.Time.TimerEvent[] = []
  private suspenseTimer: Phaser.Time.TimerEvent | null = null

  constructor() {
    super({ key: 'CardScene' })
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e')

    this.createStarryBackground()

    this.backgroundOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000)
    this.backgroundOverlay.setAlpha(0)
    this.backgroundOverlay.setDepth(-1)

    this.flashOverlay = this.add.rectangle(400, 300, 800, 600, 0xffffff)
    this.flashOverlay.setAlpha(0)
    this.flashOverlay.setDepth(10)

    this.card = new Card(this, 400, 300)
    this.card.card.y = 280

    this.cardPack = this.add.rectangle(400, 300, 180, 250, 0x3282b8)
    this.cardPack.setStrokeStyle(4, 0xbbe1fa)
    this.cardPack.setInteractive()
    this.cardPack.setDepth(1)

    this.questionMark = this.add
      .text(this.cardPack.x, this.cardPack.y, '?', {
        fontSize: '60px',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setDepth(2)

    this.cardPack.on('pointerdown', () => {
      if (!this.cardRevealed) {
        this.revealCard()
      }
    })

    this.instructionText = this.add
      .text(400, 500, 'Click the card pack!', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: this.card.card,
      alpha: { from: 0.9, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 1000,
      ease: 'Sine.easeInOut',
    })

    this.glowEffect = this.add.rectangle(
      this.cardPack.x,
      this.cardPack.y,
      200,
      270,
      0x00ffff
    )
    this.glowEffect.setAlpha(0.2)
    this.glowEffect.setBlendMode(Phaser.BlendModes.ADD)
    this.glowEffect.setDepth(0.5)

    this.tweens.add({
      targets: this.glowEffect,
      alpha: { from: 0.1, to: 0.5 },
      scale: { from: 0.95, to: 1.05 },
      yoyo: true,
      repeat: -1,
      duration: 1500,
      ease: 'Sine.easeInOut',
    })

    this.drawsCount = 0
  }

  revealCard() {
    this.cardRevealed = true

    if (this.cardPack) {
      this.cardPack.disableInteractive()
    }

    const anticipationTween = {
      targets: [this.cardPack, this.questionMark],
      scaleY: 1.02,
      scaleX: 1.02,
      y: '-=10',
      duration: 500,
      ease: 'Sine.easeInOut',
      onComplete: () => this.startCardExtraction(),
    }

    if (this.glowEffect) {
      this.tweens.add({
        targets: this.glowEffect,
        alpha: 0.6,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 600,
        ease: 'Sine.easeOut',
      })
    }

    this.tweens.add(anticipationTween)
  }

  startCardExtraction() {
    if (!this.card) {
      this.card = new Card(this, 400, 300)
    }

    if (this.cardPack) {
      this.card.card.x = this.cardPack.x

      this.card.card.y = this.cardPack.y + this.cardPack.height / 2 - 30
      this.card.card.angle = 0

      this.card.card.setAlpha(1)
      this.card.card.setDepth(0.9)
    }

    if (this.backgroundOverlay) {
      this.tweens.add({
        targets: this.backgroundOverlay,
        alpha: 0.4,
        duration: 600,
        ease: 'Sine.easeOut',
      })
    }

    let hintColor = 0xffffff
    let extractionSpeed = 1

    switch (this.card.rarity) {
      case CardRarity.LEGENDARY: {
        hintColor = 0xffdd00
        extractionSpeed = 0.7
        break
      }
      case CardRarity.EPIC: {
        hintColor = 0xa335ee
        extractionSpeed = 0.8
        break
      }
      case CardRarity.RARE: {
        hintColor = 0x0070dd
        extractionSpeed = 0.9
        break
      }
      default: {
        extractionSpeed = 1
      }
    }

    this.extractCardFromPack(extractionSpeed, hintColor)
  }

  extractCardFromPack(speedFactor: number, hintColor: number) {
    if (!this.card || !this.cardPack) return

    const extractionDuration = 1500 * speedFactor

    this.tweens.add({
      targets: this.cardPack,
      scaleX: 1.05,
      duration: extractionDuration * 0.2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 0,
    })

    if (this.questionMark) {
      this.tweens.add({
        targets: this.questionMark,
        y: '-=20',
        alpha: 0,
        duration: extractionDuration * 0.3,
        ease: 'Sine.easeIn',
        onComplete: () => {
          if (this.questionMark) {
            this.questionMark.destroy()
            this.questionMark = null
          }
        },
      })
    }

    const packTopY = this.cardPack.y - this.cardPack.height / 2
    const shimmer = this.add.rectangle(
      this.cardPack.x,
      packTopY,
      this.cardPack.width * 0.8,
      10,
      hintColor,
      0.7
    )
    shimmer.setBlendMode(Phaser.BlendModes.ADD)
    this.particles.push(shimmer)

    this.tweens.add({
      targets: shimmer,
      alpha: 0,
      scaleX: 1.2,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        shimmer.destroy()
        this.particles = this.particles.filter((p) => p !== shimmer)
      },
    })

    const extractDistance = this.cardPack.height + 30

    this.tweens.add({
      targets: this.card.card,
      y: `-=${extractDistance}`,
      duration: extractionDuration,
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
            this.card.card.x +
            Phaser.Math.Between(
              -this.card.card.width / 3,
              this.card.card.width / 3
            )
          const particleY = this.cardPack.y - this.cardPack.height / 2 + 10

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

        if (progress > 0.85 && progress < 0.9 && this.flashOverlay) {
          this.tweens.add({
            targets: this.flashOverlay,
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

    this.tweens.add({
      targets: this.cardPack,
      alpha: 0.7,
      duration: extractionDuration,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.tweens.add({
          targets: this.cardPack,
          alpha: 0,
          scaleY: 0.8,
          duration: 300,
          ease: 'Back.easeIn',
          onComplete: () => {
            if (this.cardPack) {
              this.cardPack.destroy()
              this.cardPack = null
            }
          },
        })
      },
    })

    if (this.glowEffect) {
      this.tweens.add({
        targets: this.glowEffect,
        y: `-=${extractDistance * 0.9}`,
        alpha: 0,
        duration: extractionDuration * 1.1,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.glowEffect?.destroy()
          this.glowEffect = null
        },
      })
    }
  }

  completeCardExtraction(hintColor: number) {
    if (!this.card) return

    // After card is fully pulled out, add a quick showcase spin
    this.tweens.add({
      targets: this.card.card,
      angle: { from: 0, to: 360 },
      scaleX: { from: 1, to: 0 },
      duration: 500,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        // After the spin, show the card front (flipped)
        this.tweens.add({
          targets: this.card?.card,
          scaleX: { from: 0, to: 1.5 },
          scaleY: 1.5,
          angle: 0,
          y: 300, // Center position
          duration: 600,
          ease: 'Back.easeOut',
          onUpdate: (tween) => {
            const progress = tween.progress

            // Mid-flip shimmer effect
            if (this.card && progress > 0.4 && progress < 0.6) {
              const shimmer = this.add.rectangle(
                this.card.card.x,
                this.card.card.y,
                this.card.card.width * 1.2,
                this.card.card.height * 1.2,
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

              // Add flash effect during flip
              if (this.flashOverlay) {
                this.tweens.add({
                  targets: this.flashOverlay,
                  alpha: { from: 0, to: 0.4 },
                  duration: 150,
                  yoyo: true,
                  ease: 'Cubic.easeOut',
                })
              }
            }
          },
          onComplete: () => {
            // Show card details
            if (this.card) {
              this.card.reveal()
            }

            // Add after-reveal effects
            this.createParticleEffect()
            this.createRarityBasedEffects()

            if (this.instructionText) {
              this.instructionText.setText('Congratulations! You got a card!')
            }

            // Update draw counter and show redraw button if needed
            this.drawsCount++
            if (this.drawsCount < this.maxDraws) {
              this.createRedrawButton()
            }
          },
        })
      },
    })

    // Add "pop" particles when card is fully extracted
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 30 + Math.random() * 60
      const size = 2 + Math.random() * 3

      const particle = this.add.circle(
        this.card.card.x,
        this.card.card.y,
        size,
        hintColor,
        0.8
      )
      particle.setBlendMode(Phaser.BlendModes.ADD)
      this.particles.push(particle)

      this.tweens.add({
        targets: particle,
        x: this.card.card.x + Math.cos(angle) * distance,
        y: this.card.card.y + Math.sin(angle) * distance,
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

  createRarityBasedEffects() {
    if (!this.card) return

    // More elegant effects based on rarity
    switch (this.card.rarity) {
      case CardRarity.LEGENDARY: {
        const legendaryAura = this.add.rectangle(
          this.card.card.x,
          this.card.card.y,
          this.card.card.width * 2.2,
          this.card.card.height * 1.8,
          0xffdd00,
          0.2
        )
        legendaryAura.setBlendMode(Phaser.BlendModes.ADD)
        legendaryAura.setDepth(this.card.card.depth - 0.1)
        this.particles.push(legendaryAura)

        this.tweens.add({
          targets: legendaryAura,
          alpha: { from: 0.2, to: 0.4 },
          scale: { from: 0.9, to: 1.1 },
          yoyo: true,
          repeat: -1,
          duration: 2000,
          ease: 'Sine.easeInOut',
        })

        // Gold light circles
        this.createElegantRings(0xffdd00, 3)
        this.createElegantRings(0xffffff, 2, 500)

        // Soft camera effect
        this.cameras.main.flash(300, 255, 220, 80, true)
        break
      }

      case CardRarity.EPIC: {
        // Purple aura
        const epicAura = this.add.rectangle(
          this.card.card.x,
          this.card.card.y,
          this.card.card.width * 1.8,
          this.card.card.height * 1.6,
          0xa335ee,
          0.15
        )
        epicAura.setBlendMode(Phaser.BlendModes.ADD)
        epicAura.setDepth(this.card.card.depth - 0.1)
        this.particles.push(epicAura)

        this.tweens.add({
          targets: epicAura,
          alpha: { from: 0.15, to: 0.3 },
          scale: { from: 0.95, to: 1.05 },
          yoyo: true,
          repeat: -1,
          duration: 1800,
          ease: 'Sine.easeInOut',
        })

        // Epic rings
        this.createElegantRings(0xa335ee, 2)

        // Subtle flash
        this.cameras.main.flash(200, 163, 53, 238, true)
        break
      }

      case CardRarity.RARE: {
        // Blue aura
        const rareAura = this.add.rectangle(
          this.card.card.x,
          this.card.card.y,
          this.card.card.width * 1.6,
          this.card.card.height * 1.4,
          0x0070dd,
          0.1
        )
        rareAura.setBlendMode(Phaser.BlendModes.ADD)
        rareAura.setDepth(this.card.card.depth - 0.1)
        this.particles.push(rareAura)

        this.tweens.add({
          targets: rareAura,
          alpha: { from: 0.1, to: 0.2 },
          scale: { from: 0.97, to: 1.03 },
          yoyo: true,
          repeat: -1,
          duration: 1500,
          ease: 'Sine.easeInOut',
        })

        // Rare ring
        this.createElegantRings(0x0070dd, 1)
        break
      }

      default: {
        // Subtle glow for common
        const commonGlow = this.add.rectangle(
          this.card.card.x,
          this.card.card.y,
          this.card.card.width * 1.4,
          this.card.card.height * 1.2,
          0xffffff,
          0.05
        )
        commonGlow.setBlendMode(Phaser.BlendModes.ADD)
        commonGlow.setDepth(this.card.card.depth - 0.1)
        this.particles.push(commonGlow)

        this.tweens.add({
          targets: commonGlow,
          alpha: { from: 0.05, to: 0.1 },
          yoyo: true,
          repeat: -1,
          duration: 1200,
          ease: 'Sine.easeInOut',
        })
        break
      }
    }
  }

  createElegantRings(color: number, rings: number, delay = 0) {
    if (!this.card) return

    const center = { x: this.card.card.x, y: this.card.card.y }

    for (let r = 0; r < rings; r++) {
      setTimeout(() => {
        if (!this.card) return

        // Create a ring of particles
        const ring = this.add.circle(center.x, center.y, 100 + r * 30, color, 0)
        ring.setStrokeStyle(2, color, 0.7)
        ring.setDepth(this.card.card.depth - 0.05)
        this.particles.push(ring)

        // Expand and fade ring
        this.tweens.add({
          targets: ring,
          scale: { from: 0.8, to: 1.5 },
          alpha: { to: 0 },
          duration: 1500,
          ease: 'Sine.easeOut',
          onComplete: () => {
            ring.destroy()
            this.particles = this.particles.filter((p) => p !== ring)
          },
        })

        // Create elegant light particles along the ring
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2
          const radius = 100 + r * 30
          const particle = this.add.circle(
            center.x + Math.cos(angle) * radius,
            center.y + Math.sin(angle) * radius,
            3,
            color,
            0.8
          )
          particle.setBlendMode(Phaser.BlendModes.ADD)
          this.particles.push(particle)

          this.tweens.add({
            targets: particle,
            x: center.x,
            y: center.y,
            scale: { from: 1, to: 0.5 },
            alpha: 0,
            duration: 800,
            delay: i * 50,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              particle.destroy()
              this.particles = this.particles.filter((p) => p !== particle)
            },
          })
        }
      }, delay + r * 200)
    }
  }

  createRedrawButton() {
    this.redrawButton = new Button(this, {
      x: 400,
      y: 500,
      width: 200,
      height: 50,
      text: `Redraw (${this.maxDraws - this.drawsCount} left)`,
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
        y: 500,
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

    this.cleanupCardEffects()

    this.resetCardState()
  }

  cleanupCardEffects() {
    // Stop all particle timers
    this.particleTimers.forEach((timer) => {
      if (timer) {
        timer.remove()
      }
    })
    this.particleTimers = []

    // Stop suspense timer if it exists
    if (this.suspenseTimer) {
      this.suspenseTimer.remove()
      this.suspenseTimer = null
    }

    // Clean up particles
    this.particles.forEach((p) => p.destroy())
    this.particles = []

    // Gather targets that exist
    const targetsToRemove = []
    if (this.card) {
      targetsToRemove.push(this.card.card)
      if (this.card.cardNameText) {
        targetsToRemove.push(this.card.cardNameText)
      }
    }

    // Elegant fade out
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
          }
        },
      })
    } else {
      // If there are no targets, clean up directly
      if (this.card) {
        this.card.destroy()
        this.card = null
      }
    }
  }

  resetCardState() {
    this.time.delayedCall(400, () => {
      if (this.backgroundOverlay) {
        this.tweens.add({
          targets: this.backgroundOverlay,
          alpha: 0,
          duration: 300,
        })
      }

      this.cardRevealed = false

      this.card = new Card(this, 400, 300)

      this.cardPack = this.add.rectangle(400, 300, 180, 250, 0x3282b8)
      this.cardPack.setStrokeStyle(4, 0xbbe1fa)
      this.cardPack.setInteractive()
      this.cardPack.setDepth(1)

      this.card.card.y = this.cardPack.y - 20
      this.card.card.setDepth(0)

      this.questionMark = this.add
        .text(this.cardPack.x, this.cardPack.y, '?', {
          fontSize: '60px',
          color: '#000000',
        })
        .setOrigin(0.5)
        .setDepth(2)

      this.cardPack.on('pointerdown', () => {
        if (!this.cardRevealed) {
          this.revealCard()
        }
      })

      if (this.instructionText) {
        this.instructionText.setText('Click the card pack!')
      }

      this.glowEffect = this.add.rectangle(
        this.cardPack.x,
        this.cardPack.y,
        200,
        270,
        0x00ffff
      )
      this.glowEffect.setAlpha(0.2)
      this.glowEffect.setBlendMode(Phaser.BlendModes.ADD)
      this.glowEffect.setDepth(0.5)

      this.tweens.add({
        targets: this.glowEffect,
        alpha: { from: 0.1, to: 0.5 },
        scale: { from: 0.95, to: 1.05 },
        yoyo: true,
        repeat: -1,
        duration: 1500,
        ease: 'Sine.easeInOut',
      })

      this.cardPack.setScale(0)
      this.card.setScale(0)
      this.questionMark.setScale(0)

      this.tweens.add({
        targets: [this.cardPack, this.card.card, this.questionMark],
        scale: 1,
        duration: 400,
        ease: 'Back.easeOut',
      })
    })
  }

  createParticleEffect() {
    const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00, 0x0000ff]

    for (let i = 0; i < 100; i++) {
      this.createParticle(
        this.card!.card.x,
        this.card!.card.y,
        colors[Math.floor(Math.random() * colors.length)],
        5,
        2000
      )
    }

    // Store the timer reference so we can clean it up later
    const continuousParticleTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.cardRevealed || !this.card) return

        for (let i = 0; i < 3; i++) {
          const x = this.card.card.x + Phaser.Math.Between(-75, 75)
          const y = this.card.card.y + Phaser.Math.Between(-110, 110)
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

      const x = this.card.card.x + Phaser.Math.Between(-200, 200)
      const y = this.card.card.y + Phaser.Math.Between(-200, 100)
      const color = colors[Math.floor(Math.random() * colors.length)]

      for (let i = 0; i < 30; i++) {
        this.createParticle(x, y, color, 4, 1000)
      }

      fireworkCount++
      this.time.delayedCall(300, launchFirework)
    }

    launchFirework()

    if (
      this.card &&
      (this.card.rarity === CardRarity.LEGENDARY ||
        this.card.rarity === CardRarity.EPIC)
    ) {
      const rarityParticleTimer = this.time.addEvent({
        delay: 200,
        callback: () => {
          if (!this.card) return

          const color =
            this.card.rarity === CardRarity.LEGENDARY ? 0xffdd00 : 0xa335ee
          const x = this.card.card.x
          const startY = this.card.card.y - 110
          const endY = this.card.card.y + 110

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

  createStarryBackground() {
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(20, 780)
      const y = Phaser.Math.Between(20, 580)
      const size = Phaser.Math.Between(1, 3)
      const brightness = Phaser.Math.FloatBetween(0.3, 1)

      const star = this.add.circle(x, y, size, 0xffffff)
      star.setAlpha(brightness)
      star.setDepth(-0.5)

      this.tweens.add({
        targets: star,
        alpha: { from: brightness, to: 0.1 },
        yoyo: true,
        repeat: -1,
        duration: Phaser.Math.Between(1000, 3000),
        ease: 'Sine.easeInOut',
      })
    }
  }
}
