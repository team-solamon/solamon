import * as Phaser from 'phaser'

export class Background extends Phaser.GameObjects.Container {
  private stars: Phaser.GameObjects.Shape[] = []
  public backgroundOverlay: Phaser.GameObjects.Rectangle
  public flashOverlay: Phaser.GameObjects.Rectangle

  constructor(scene: Phaser.Scene, x: number = 400, y: number = 300) {
    super(scene, x, y)
    scene.add.existing(this)

    this.backgroundOverlay = scene.add.rectangle(0, 0, 800, 600, 0x000000)
    this.backgroundOverlay.setAlpha(0)
    this.backgroundOverlay.setDepth(-1)
    this.add(this.backgroundOverlay)

    this.flashOverlay = scene.add.rectangle(0, 0, 800, 600, 0xffffff)
    this.flashOverlay.setAlpha(0)
    this.flashOverlay.setDepth(10)
    this.add(this.flashOverlay)

    this.createStarryBackground()
  }

  private createStarryBackground() {
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(-380, 380)
      const y = Phaser.Math.Between(-280, 280)
      const size = Phaser.Math.Between(1, 3)
      const brightness = Phaser.Math.FloatBetween(0.3, 1)

      const star = this.scene.add.circle(x, y, size, 0xffffff)
      star.setAlpha(brightness)
      star.setDepth(-0.5)
      this.add(star)
      this.stars.push(star)

      this.scene.tweens.add({
        targets: star,
        alpha: { from: brightness, to: 0.1 },
        yoyo: true,
        repeat: -1,
        duration: Phaser.Math.Between(1000, 3000),
        ease: 'Sine.easeInOut',
      })
    }
  }

  destroy() {
    this.stars = []
    super.destroy()
  }
}
