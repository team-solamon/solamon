import * as Phaser from 'phaser'

import { DamageText } from './DamageText'
import { DefeatedVisual } from './DefeatedVisual'
import { HealthBar } from './HealthBar'
import { CardElement } from '@/game/data/card'

export class Card extends Phaser.GameObjects.Container {
  public name: string
  public health: number
  public attack: number
  public initialHealth: number
  public element: CardElement
  public isPlayer: boolean
  public originalX: number
  public originalY: number
  public isActive = false

  private cardFront!: Phaser.GameObjects.Sprite
  private cardBack!: Phaser.GameObjects.Sprite
  private nameText!: Phaser.GameObjects.Text
  private attackText!: Phaser.GameObjects.Text
  private healthText!: Phaser.GameObjects.Text
  private rarityText!: Phaser.GameObjects.Text
  private healthBar!: HealthBar
  private glow!: Phaser.GameObjects.Rectangle
  private isFaceDown = false
  private cardWidth = 100
  private cardHeight = 140
  private glowShader!: Phaser.GameObjects.Shader
  private idleAnimation?: Phaser.Tweens.Tween

  isDragging = false
  zIndex = 0
  depth = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    attack: number,
    health: number,
    element: CardElement,
    isPlayer: boolean
  ) {
    super(scene, x, y)
    scene.add.existing(this)

    this.originalX = x
    this.originalY = y
    this.name = name
    this.attack = attack
    this.health = health
    this.initialHealth = health
    this.element = element
    this.isPlayer = isPlayer

    this.createCard()
  }

  createCard() {
    const cardTexture = this.getCardTexture()

    this.cardFront = this.scene.add
      .sprite(0, 0, cardTexture)
      .setDisplaySize(this.cardWidth, this.cardHeight)

    this.cardBack = this.scene.add
      .sprite(0, 0, 'cardback')
      .setDisplaySize(this.cardWidth, this.cardHeight)

    this.glow = this.scene.add
      .rectangle(0, 0, this.cardWidth + 10, this.cardHeight + 10, 0xffff00, 0)
      .setStrokeStyle(2, 0xffff00, 0)

    this.nameText = this.scene.add
      .text(0, -50, this.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.rarityText = this.scene.add
      .text(0, -30, this.element, {
        fontSize: '10px',
        color: this.getRarityColor(),
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.attackText = this.scene.add
      .text(-35, 40, `⚔️`, {
        fontSize: '16px',
        color: '#ff5555',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.healthText = this.scene.add
      .text(35, 40, `❤️`, {
        fontSize: '16px',
        color: '#55ff55',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.healthBar = new HealthBar(this.scene, 80)

    this.glowShader = this.scene.add
      .shader('CardGlow', 0, 0, this.cardWidth + 20, this.cardHeight + 20)
      .setVisible(false)

    this.add([
      this.glow,
      this.cardFront,
      this.cardBack,
      this.nameText,
      this.rarityText,
      this.attackText,
      this.healthText,
      this.healthBar,
      this.glowShader,
    ])

    this.cardBack.setVisible(false)

    this.updateHealthBar()

    if (this.health > 0) {
      this.startIdleAnimation()
    }
  }

  getCardColor(): number {
    switch (this.element) {
      case 'FIRE':
        return 0xff4500
      case 'WATER':
        return 0x1e90ff
      case 'EARTH':
        return 0x8b4513
      case 'METAL':
        return 0xc0c0c0
      case 'WOOD':
        return 0x228b22
      case 'NONE':
      default:
        return 0x333333
    }
  }

  getCardTexture(): string {
    switch (this.element) {
      case 'FIRE':
        return 'card-fire'
      case 'WATER':
        return 'card-water'
      case 'EARTH':
        return 'card-earth'
      case 'METAL':
        return 'card-metal'
      case 'WOOD':
        return 'card-wood'
      case 'NONE':
      default:
        return 'cardback'
    }
  }

  getRarityColor(): string {
    switch (this.element) {
      case 'FIRE':
        return '#FF4500'
      case 'WATER':
        return '#1E90FF'
      case 'EARTH':
        return '#8B4513'
      case 'METAL':
        return '#C0C0C0'
      case 'WOOD':
        return '#228B22'
      case 'NONE':
      default:
        return '#AAAAAA'
    }
  }

  setFaceDown(isFaceDown: boolean) {
    this.isFaceDown = isFaceDown
    this.cardFront.setVisible(!isFaceDown)
    this.cardBack.setVisible(isFaceDown)
    this.nameText.setVisible(!isFaceDown)
    this.attackText.setVisible(!isFaceDown)
    this.healthText.setVisible(!isFaceDown)
    this.rarityText.setVisible(!isFaceDown)
    this.healthBar.setVisible(!isFaceDown)
  }

  flipCard() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 200,
      ease: 'Power1',
      onComplete: () => {
        this.setFaceDown(!this.isFaceDown)

        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 200,
          ease: 'Power1',
        })
      },
    })
  }

  setActiveCard(isActive: boolean) {
    this.isActive = isActive
    this.glow.setAlpha(isActive ? 0.5 : 0)
    this.glow.setStrokeStyle(2, 0xffff00, isActive ? 0.8 : 0)

    if (!isActive) {
      this.scene.tweens.killTweensOf(this)
      this.y = this.originalY
    }
  }

  updateHealthBar() {
    this.healthBar.update(this.health, this.initialHealth)
    this.healthText.setText(`❤️${Math.max(0, this.health)}`)
  }

  takeDamage(amount: number): boolean {
    const startHealth = this.health
    this.health = Math.max(0, this.health - amount)

    this.updateHealthBar()

    this.scene.cameras.main.flash(150, 100, 0, 0)

    this.scene.tweens.add({
      targets: this,
      alpha: 0.8,
      yoyo: true,
      duration: 100,
      repeat: 2,
    })

    new DamageText(this.scene, this.x, this.y, amount)

    if (startHealth > 0 && this.health <= 0) {
      this.idleAnimation?.destroy()

      this.scene.tweens.add({
        targets: this,
        alpha: 0.3,
        angle: Phaser.Math.Between(-25, 25),
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 800,
        ease: 'Back.easeIn',
      })

      const shockwave = this.scene.add.circle(this.x, this.y, 10, 0xff0000, 0.7)
      this.scene.tweens.add({
        targets: shockwave,
        radius: 100,
        alpha: 0,
        duration: 500,
        onComplete: () => shockwave.destroy(),
      })

      const defeatedVisual = new DefeatedVisual(this.scene)
      this.add(defeatedVisual)

      return true
    }

    return false
  }

  async moveToPosition(x: number, y: number, duration: number) {
    this.idleAnimation?.pause()

    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this,
        x: x,
        y: y,
        duration: duration,
        ease: 'Power2',
        onUpdate: () => {
          this.x = this.x
          this.y = this.y
        },
        onComplete: () => {
          if (this.health > 0) {
            this.startIdleAnimation()
          }
          resolve()
        },
      })
    })
  }

  async returnToOriginalPosition(duration: number) {
    return this.moveToPosition(this.originalX, this.originalY, duration)
  }

  startIdleAnimation() {
    const rotationFactor = 0.08
    const floatHeight = 5

    this.idleAnimation?.destroy()

    this.scene.tweens.add({
      targets: this,
      rotation: { from: -rotationFactor, to: rotationFactor },
      y: this.y - floatHeight,
      yoyo: true,
      repeat: -1,
      duration: 1500 + Math.random() * 500,
      ease: 'Sine.easeInOut',
    })

    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.1, to: 0.3 },
      yoyo: true,
      repeat: -1,
      duration: 1000 + Math.random() * 500,
      ease: 'Sine.easeInOut',
    })
  }

  toggleHealthBar(visible: boolean) {
    this.healthBar.setVisible(visible)
  }

  updateCardData(data: {
    name: string
    attack: number
    health: number
    element: CardElement
  }) {
    this.name = data.name
    this.attack = data.attack
    this.health = data.health
    this.initialHealth = data.health
    this.element = data.element

    this.nameText.setText(this.name)
    this.attackText.setText(`⚔️${data.attack}`)
    this.healthText.setText(`❤️${this.health}`)
    this.rarityText.setText(this.element)
    this.rarityText.setColor(this.getRarityColor())

    this.cardFront.setTexture(this.getCardTexture())

    this.healthBar.update(this.health, this.initialHealth)

    if (this.isFaceDown) {
      this.healthBar.setVisible(false)
    }
  }
}
