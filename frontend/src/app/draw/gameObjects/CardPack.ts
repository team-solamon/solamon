import { Card } from '@/gameObjects/Card'
import * as Phaser from 'phaser'

export class CardPack extends Phaser.GameObjects.Container {
  private card: Card
  private pack!: Phaser.GameObjects.Image
  private glowEffect!: Phaser.GameObjects.Rectangle
  private onRevealCallback?: (card: Card) => void

  constructor(scene: Phaser.Scene, x: number, y: number, card: Card) {
    super(scene, x, y)
    this.card = card
    scene.add.existing(this)
    this.create()
  }

  private create() {
    this.pack = this.scene.add.image(0, 0, 'cardpack')
    this.pack.setDisplaySize(220, 300).setInteractive().setDepth(1)

    this.glowEffect = this.scene.add.rectangle(0, 0, 240, 320, 0x00ffff)
    this.glowEffect
      .setAlpha(0.2)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(0.5)

    this.add([this.glowEffect, this.pack])

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
    const fadeOutTween = {
      targets: [this.pack, this.glowEffect],
      alpha: 0,
      duration: 800,
      ease: 'Power1.easeOut',
      onComplete: () => {
        this.destroy()
      },
    }

    this.scene.tweens.add(fadeOutTween)
  }

  public destroy() {
    this.pack.destroy()
    this.glowEffect.destroy()
    super.destroy()
  }
}
