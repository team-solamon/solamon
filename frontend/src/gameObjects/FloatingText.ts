import * as Phaser from 'phaser'

export class FloatingText {
  private scene: Phaser.Scene
  private text: Phaser.GameObjects.Text

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    content: string,
    color: string,
    stroke: string
  ) {
    this.scene = scene
    this.text = scene.add
      .text(x, y, content, {
        fontSize: '24px',
        color: color,
        stroke: stroke,
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    this.animate()
  }

  private animate() {
    this.scene.tweens.add({
      targets: this.text,
      y: this.text.y - 40,
      alpha: 0.3,
      scale: 1.2,
      duration: 2000,
      onComplete: () => {
        this.text.destroy()
      },
    })
  }
}
