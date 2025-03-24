import * as Phaser from 'phaser'

export class DamageText {
  private scene: Phaser.Scene
  private text: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number) {
    this.scene = scene
    this.text = scene.add
      .text(x, y, `-${damage}`, {
        fontSize: '24px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    this.animate()
  }

  private animate() {
    this.scene.tweens.add({
      targets: this.text,
      y: this.text.y - 40,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      onComplete: () => {
        this.text.destroy()
      },
    })
  }
}
