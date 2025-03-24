import * as Phaser from 'phaser'
import { Card } from './Card'

export class CardPack extends Phaser.GameObjects.Container {
  private card: Card
  private pack!: Phaser.GameObjects.Rectangle
  private questionMark!: Phaser.GameObjects.Text
  private glowEffect!: Phaser.GameObjects.Rectangle
  private onRevealCallback?: (card: Card) => void

  constructor(scene: Phaser.Scene, x: number, y: number, card: Card) {
    super(scene, x, y)
    this.card = card
    scene.add.existing(this)
    this.create()
  }

  private create() {
    this.pack = this.scene.add.rectangle(0, 0, 180, 250, 0x3282b8)
    this.pack.setStrokeStyle(4, 0xbbe1fa).setInteractive().setDepth(1)

    this.questionMark = this.scene.add
      .text(0, 0, '?', { fontSize: '60px', color: '#000000' })
      .setOrigin(0.5)
      .setDepth(2)

    this.glowEffect = this.scene.add.rectangle(0, 0, 200, 270, 0x00ffff)
    this.glowEffect
      .setAlpha(0.2)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(0.5)

    this.add([this.glowEffect, this.pack, this.questionMark])

    this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: { from: 0.1, to: 0.5 },
      scale: { from: 0.95, to: 1.05 },
      yoyo: true,
      repeat: -1,
      duration: 1500,
      ease: 'Sine.easeInOut',
    })

    this.pack.on('pointerdown', () => {
      if (this.onRevealCallback) {
        this.onRevealCallback(this.card)
      }
    })
  }

  public setOnReveal(callback: (card: Card) => void) {
    this.onRevealCallback = callback
  }

  public disableInteraction() {
    this.pack.disableInteractive()
  }

  public startRevealAnimation() {
    const anticipationTween = {
      targets: [this.pack, this.questionMark],
      scaleY: 1.02,
      scaleX: 1.02,
      y: '-=10',
      duration: 500,
      ease: 'Sine.easeInOut',
    }

    this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: 0.6,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      ease: 'Sine.easeOut',
    })

    this.scene.tweens.add(anticipationTween)
  }

  public startCardExtraction(
    extractionDistance: number,
    hintColor: number,
    extractionSpeed: number,
    onComplete: () => void
  ) {
    const extractionDuration = 1500 * extractionSpeed

    this.scene.tweens.add({
      targets: this.pack,
      scaleX: 1.05,
      duration: extractionDuration * 0.2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 0,
    })

    this.scene.tweens.add({
      targets: this.questionMark,
      y: '-=20',
      alpha: 0,
      duration: extractionDuration * 0.3,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.questionMark.destroy()
      },
    })

    const packTopY = this.pack.y - this.pack.height / 2
    const shimmer = this.scene.add.rectangle(
      this.pack.x,
      packTopY,
      this.pack.width * 0.8,
      10,
      hintColor,
      0.7
    )
    shimmer.setBlendMode(Phaser.BlendModes.ADD)

    this.scene.tweens.add({
      targets: shimmer,
      alpha: 0,
      scaleX: 1.2,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        shimmer.destroy()
      },
    })

    this.scene.tweens.add({
      targets: this.pack,
      alpha: 0.7,
      duration: extractionDuration,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.pack,
          alpha: 0,
          scaleY: 0.8,
          duration: 300,
          ease: 'Back.easeIn',
          onComplete: () => {
            this.pack.destroy()
          },
        })
      },
    })

    this.scene.tweens.add({
      targets: this.glowEffect,
      y: `-=${extractionDistance * 0.9}`,
      alpha: 0,
      duration: extractionDuration * 1.1,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.glowEffect.destroy()
        onComplete()
      },
    })
  }

  public destroy() {
    this.pack.destroy()
    this.questionMark.destroy()
    this.glowEffect.destroy()
    super.destroy()
  }
}
