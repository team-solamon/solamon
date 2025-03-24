import {
  CardElement,
  getElementEmoji,
  getRandomElement,
} from '@/game/data/card'
import Phaser from 'phaser'

export class Card {
  public card: Phaser.GameObjects.Rectangle
  public cardNameText: Phaser.GameObjects.Text
  public element: CardElement
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.element = getRandomElement()

    this.cardNameText = scene.add
      .text(x, y, getElementEmoji(this.element), {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(0)
      .setVisible(false)

    this.card = scene.add.rectangle(x, y, 150, 220)
    this.card.setStrokeStyle(2, 0xffd700)
    this.card.setDepth(0)
  }

  reveal() {
    this.cardNameText.setVisible(true)
    this.cardNameText.setDepth(3)

    this.scene.tweens.add({
      targets: this.cardNameText,
      scale: { from: 0.5, to: 1 },
      duration: 400,
      ease: 'Back.easeOut',
    })

    const cardTargets = [this.card]

    this.scene.tweens.add({
      targets: cardTargets,
      angle: { from: -5, to: 5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.scene.tweens.add({
      targets: this.card,
      strokeThickness: { from: 1, to: 5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  setPosition(x: number, y: number) {
    this.card.setPosition(x, y)
    this.cardNameText.setPosition(x, y)
  }

  setScale(scale: number) {
    this.card.setScale(scale)
  }

  setAlpha(alpha: number) {
    this.card.setAlpha(alpha)
    this.cardNameText.setAlpha(alpha)
  }

  destroy() {
    this.card.destroy()
    this.cardNameText.destroy()
  }
}
