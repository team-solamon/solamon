import Phaser from 'phaser'

export enum CardRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export class Card {
  public card: Phaser.GameObjects.Rectangle
  public cardNameText: Phaser.GameObjects.Text
  public rarity: CardRarity
  private scene: Phaser.Scene
  private rarityColors: Record<CardRarity, number> = {
    [CardRarity.COMMON]: 0x808080,
    [CardRarity.RARE]: 0x0070dd,
    [CardRarity.EPIC]: 0xa335ee,
    [CardRarity.LEGENDARY]: 0xff8000,
  }

  constructor(scene: Phaser.Scene, x: number, y: number, rarity?: CardRarity) {
    this.scene = scene
    this.rarity = rarity || this.getRandomRarity()

    this.card = scene.add.rectangle(
      x,
      y,
      150,
      220,
      this.rarityColors[this.rarity]
    )
    this.card.setStrokeStyle(2, 0xffd700)
    this.card.setDepth(0)

    this.cardNameText = scene.add
      .text(x, y, this.rarity + ' CARD', {
        fontSize: this.rarity === CardRarity.LEGENDARY ? '28px' : '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(0)
      .setVisible(false)
  }

  getRandomRarity(): CardRarity {
    const rarities = [
      CardRarity.COMMON,
      CardRarity.RARE,
      CardRarity.EPIC,
      CardRarity.LEGENDARY,
    ]
    const weights = [60, 25, 10, 5]
    return this.getWeightedRandom(rarities, weights)
  }

  getWeightedRandom<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    const randomValue = Math.random() * totalWeight
    let weightSum = 0

    for (let i = 0; i < items.length; i++) {
      weightSum += weights[i]
      if (randomValue <= weightSum) {
        return items[i]
      }
    }

    return items[0]
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
