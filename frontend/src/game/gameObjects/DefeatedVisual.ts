import Phaser from 'phaser'

export class DefeatedVisual extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0)

    scene.add.existing(this)

    const xSize = 100

    const line1 = scene.add.line(
      xSize / 2,
      xSize / 2,
      -xSize / 2,
      -xSize / 2,
      xSize / 2,
      xSize / 2,
      0xff0000,
      1
    )
    line1.setLineWidth(5)

    const line2 = scene.add.line(
      xSize / 2,
      xSize / 2,
      xSize / 2,
      -xSize / 2,
      -xSize / 2,
      xSize / 2,
      0xff0000,
      1
    )
    line2.setLineWidth(5)

    this.add([line1, line2])

    const defeatedText = scene.add
      .text(0, 0, 'DEFEATED', {
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#ff0000',
        padding: { x: 5, y: 3 },
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)

    this.add(defeatedText)

    this.setDepth(100)
  }
}
