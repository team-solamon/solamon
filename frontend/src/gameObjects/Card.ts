import * as Phaser from 'phaser'

import { DefeatedVisual } from './DefeatedVisual'
import { HealthBar } from './HealthBar'
import { getCardColor, getCardColorString, getElementEmoji } from '@/data/card'
import { FloatingText } from './FloatingText'
import { AttackEvent } from '../data/replay'
import { CardData, Element } from '@/lib/solana-helper'

export class Card extends Phaser.GameObjects.Container {
  public name: string
  public health: number
  public attack: number
  public initialHealth: number
  public element: Element
  public species: number
  public isPlayer: boolean
  public originalX: number
  public originalY: number
  public isActive = false

  private cardFront!: Phaser.GameObjects.Sprite
  private cardBack!: Phaser.GameObjects.Sprite
  private nameText!: Phaser.GameObjects.Text
  private attackText!: Phaser.GameObjects.Text
  private healthText!: Phaser.GameObjects.Text
  private elementText!: Phaser.GameObjects.Text
  private healthBar!: HealthBar
  private glow!: Phaser.GameObjects.Rectangle
  private cardBorder!: Phaser.GameObjects.Rectangle
  private isFaceDown = false
  private cardWidth = 100
  private cardHeight = 140
  private idleAnimation?: Phaser.Tweens.Tween
  private healthBarVisible = true
  private statsBackground!: Phaser.GameObjects.Rectangle

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
    element: Element,
    species: number,
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
    this.species = species
    this.isPlayer = isPlayer

    this.createCard()
  }

  createCard() {
    this.cardFront = this.scene.add
      .sprite(0, 0, `species-${this.species}`)
      .setDisplaySize(this.cardWidth, this.cardHeight)

    this.cardBack = this.scene.add
      .sprite(0, 0, 'cardback')
      .setDisplaySize(this.cardWidth, this.cardHeight)

    this.glow = this.scene.add
      .rectangle(0, 0, this.cardWidth + 10, this.cardHeight + 10, 0xffff00, 0)
      .setStrokeStyle(2, 0xffff00, 0)

    this.cardBorder = this.scene.add
      .rectangle(0, 0, this.cardWidth - 3, this.cardHeight - 3, 0x000000, 0)
      .setStrokeStyle(3, getCardColor(this.element), 1)

    /*
    this.nameText = this.scene.add
      .text(0, -50, this.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      */
    this.statsBackground = this.scene.add
      .rectangle(0, 40, 80, 25, 0x000000, 0.7)
      .setOrigin(0.5)

    this.attackText = this.scene.add
      .text(-20, 40, `⚔️${this.attack}`, {
        fontSize: '16px',
        color: '#ff5555',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.healthText = this.scene.add
      .text(20, 40, `❤️${this.health}`, {
        fontSize: '16px',
        color: '#55ff55',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.elementText = this.scene.add
      .text(0, -50, getElementEmoji(this.element), {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.healthBar = new HealthBar(this.scene, 80)

    this.add([
      this.glow,
      this.cardFront,
      this.cardBack,
      this.cardBorder,
      this.statsBackground,
      this.attackText,
      this.healthText,
      this.elementText,
      this.healthBar,
    ])

    this.cardBack.setVisible(false)

    this.updateHealthBar()

    if (this.health > 0) {
      this.startIdleAnimation()
    }
  }

  setFaceDown(isFaceDown: boolean) {
    this.isFaceDown = isFaceDown
    this.cardFront.setVisible(!isFaceDown)
    this.cardBack.setVisible(isFaceDown)
    this.statsBackground.setVisible(!isFaceDown)
    this.attackText.setVisible(!isFaceDown)
    this.healthText.setVisible(!isFaceDown)
    this.elementText.setVisible(!isFaceDown)
    this.healthBar.setVisible(!isFaceDown && this.healthBarVisible)
    this.cardBorder.setVisible(!isFaceDown)
  }

  flipCard() {
    const previousScaleX = this.scaleX

    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 200,
      ease: 'Power1',
      onComplete: () => {
        this.setFaceDown(!this.isFaceDown)

        this.scene.tweens.add({
          targets: this,
          scaleX: previousScaleX,
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

  takeDamage(amount: number, attackEvent: AttackEvent): boolean {
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

    new FloatingText(
      this.scene,
      this.x,
      this.y,
      `-${amount}`,
      '#ff0000',
      '#000000'
    )

    this.scene.sound.play('sfx-hit', { volume: 0.6 })

    if (attackEvent === 'CRITICAL') {
      this.scene.sound.play('sfx-critical', { volume: 0.6 })
      new FloatingText(
        this.scene,
        this.x,
        this.y - 20,
        `🔥CRITICAL!`,
        '#ff0000',
        '#000000'
      )
    } else if (attackEvent === 'HALVED') {
      this.scene.sound.play('sfx-halved', { volume: 0.6 })
      new FloatingText(
        this.scene,
        this.x,
        this.y - 20,
        `🛡️HALVED!`,
        '#00ff00',
        '#000000'
      )
    }

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

    this.stopIdleAnimation()

    this.idleAnimation = this.scene.tweens.add({
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

  stopIdleAnimation() {
    if (this.idleAnimation) {
      this.scene.tweens.killTweensOf(this)
      this.rotation = 0
      this.y = this.originalY
      this.glow.setAlpha(this.isActive ? 0.5 : 0)
      this.idleAnimation = undefined
    }
  }

  toggleHealthBar(visible: boolean) {
    this.healthBarVisible = visible
    this.healthBar.setVisible(visible && !this.isFaceDown)
  }

  updateCardData(data: CardData) {
    //this.name = data.name
    this.attack = data.attack
    this.health = data.health
    this.initialHealth = data.health
    this.element = data.element
    this.species = data.species

    //this.nameText.setText(this.name)
    this.attackText.setText(`⚔️${data.attack}`)
    this.healthText.setText(`❤️${this.health}`)

    this.elementText.setText(getElementEmoji(this.element))
    this.elementText.setColor(getCardColorString(this.element))
    this.cardBorder.setStrokeStyle(3, getCardColor(this.element), 1)

    this.cardFront
      .setTexture(`species-${this.species}`)
      .setDisplaySize(this.cardWidth, this.cardHeight)

    this.healthBar.update(this.health, this.initialHealth)

    if (this.isFaceDown) {
      this.healthBar.setVisible(false)
    }
  }
}
