import * as Phaser from 'phaser'

export class HealthBar extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle
  private bar: Phaser.GameObjects.Rectangle

  constructor(scene: Phaser.Scene, width: number) {
    super(scene, 0, 15)
    this.width = width

    this.background = scene.add.rectangle(0, 0, width, 8, 0x000000)
    this.bar = scene.add.rectangle(0, 0, width, 8, 0x00ff00)

    this.add([this.background, this.bar])
    this.setSize(width, 8)

    scene.add.existing(this)
  }

  update(current: number, max: number) {
    const healthPercent = Math.max(0, current) / max
    const barWidth = this.width * healthPercent

    this.bar.setSize(barWidth, 8)
    this.bar.setX(-this.width / 2 + barWidth / 2)

    const barColor = this.getHealthColor(healthPercent)
    this.bar.setFillStyle(barColor)
  }

  private getHealthColor(percent: number): number {
    if (percent > 0.6) return 0x00ff00
    if (percent > 0.3) return 0xffff00
    return 0xff0000
  }

  setVisible(value: boolean) {
    super.setVisible(value)
    return this
  }
}
