import * as Phaser from 'phaser'

export class GameResult extends Phaser.GameObjects.Container {
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = []
  private resultText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)
    scene.add.existing(this)

    this.resultText = scene.add
      .text(0, 0, '', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#000000',
          blur: 5,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setAlpha(0)

    this.add(this.resultText)
  }

  show(playerScore: number, opponentScore: number) {
    let resultMessage = ''
    let color = '#ffffff'

    if (playerScore > opponentScore) {
      resultMessage = '🏆 VICTORY! 🏆'
      color = '#4CAF50'
      this.createVictoryEffects()
      this.scene.cameras.main.flash(1000, 64, 255, 64)
    } else if (playerScore < opponentScore) {
      resultMessage = '❌ DEFEAT! ❌'
      color = '#F44336'
      this.createDefeatEffects()
      this.scene.cameras.main.flash(1000, 200, 0, 0)
      this.scene.cameras.main.shake(1000, 0.01)
    } else {
      resultMessage = '🔄 DRAW! 🔄'
      color = '#FFC107'
      this.createDrawEffects()
      this.scene.cameras.main.flash(1000, 200, 200, 0)
    }

    this.resultText.setText(resultMessage).setColor(color)

    this.scene.tweens.add({
      targets: this.resultText,
      alpha: 1,
      scale: { from: 2, to: 1 },
      duration: 1000,
      ease: 'Back.easeOut',
    })

    this.scene.time.delayedCall(5000, () => {
      this.particles.forEach((p) => p.destroy())
    })

    return resultMessage
  }

  private createVictoryEffects() {
    this.particles = [
      this.scene.add.particles(400, 0, 'spark', {
        speed: { min: 100, max: 300 },
        angle: { min: 80, max: 100 },
        scale: { start: 0.4, end: 0 },
        gravityY: 300,
        lifespan: 4000,
        quantity: 1,
        frequency: 50,
        tint: [0xffd700, 0xffa500, 0xffff00],
      }),
      this.scene.add.particles(400, 300, 'spark', {
        speed: { min: 50, max: 150 },
        scale: { start: 0.1, end: 2 },
        alpha: { start: 0.6, end: 0 },
        angle: { min: 0, max: 360 },
        lifespan: 2000,
        frequency: 100,
        tint: 0xffd700,
        blendMode: 'ADD',
      }),
    ]
  }

  private createDefeatEffects() {
    this.particles = [
      this.scene.add.particles(400, 300, 'spark', {
        speed: { min: 50, max: 100 },
        scale: { start: 1, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 2000,
        frequency: 50,
        tint: 0x333333,
      }),
      this.scene.add.particles(400, 300, 'spark', {
        speed: { min: 100, max: 200 },
        scale: { start: 0.2, end: 0 },
        angle: { min: 0, max: 360 },
        lifespan: 1000,
        frequency: 100,
        tint: 0xff0000,
        blendMode: 'ADD',
      }),
    ]
  }

  private createDrawEffects() {
    this.particles = [
      this.scene.add.particles(400, 300, 'spark', {
        speed: { min: 50, max: 150 },
        scale: { start: 0.3, end: 0 },
        lifespan: 2000,
        frequency: 100,
        tint: [0xffc107, 0xffffff],
        blendMode: 'ADD',
      }),
    ]
  }

  destroy() {
    this.particles.forEach((p) => p.destroy())
    super.destroy()
  }
}
