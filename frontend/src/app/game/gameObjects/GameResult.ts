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

    return resultMessage
  }

  private createVictoryEffects() {
    this.particles = [
      this.scene.add.particles(0, 0, 'spark', {
        speed: { min: 100, max: 300 },
        angle: { min: 80, max: 100 },
        scale: { start: 0.4, end: 0 },
        gravityY: 300,
        lifespan: 4000,
        quantity: 1,
        frequency: 50,
        tint: [0xffd700, 0xffa500, 0xffff00],
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(0, 0, 800, 10),
          quantity: 1,
        },
        x: 0,
        y: 0,
      }),
      this.scene.add.particles(0, 0, 'spark', {
        speed: { min: 50, max: 150 },
        scale: { start: 0.1, end: 2 },
        alpha: { start: 0.6, end: 0 },
        angle: { min: 0, max: 360 },
        lifespan: 2000,
        frequency: 100,
        tint: 0xffd700,
        blendMode: 'ADD',
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Circle(400, 300, 150),
          quantity: 1,
        },
      }),
    ]
  }

  private createDefeatEffects() {
    this.particles = [
      this.scene.add.particles(0, 0, 'spark', {
        speed: { min: 50, max: 150 },
        angle: { min: 230, max: 310 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        gravityY: 100,
        lifespan: 3000,
        quantity: 2,
        frequency: 40,
        tint: [0x990000, 0x660000, 0x330000],
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(0, 0, 800, 100),
          quantity: 1,
        },
      }),
      this.scene.add.particles(0, 0, 'spark', {
        speed: { min: 100, max: 300 },
        scale: { start: 0.4, end: 0 },
        angle: { min: 0, max: 360 },
        lifespan: 1500,
        frequency: 80,
        quantity: 3,
        tint: [0xff0000, 0xff3333, 0xff6666],
        blendMode: 'ADD',
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Circle(400, 300, 100),
          quantity: 1,
        },
      }),
      this.scene.add.particles(0, 0, 'spark', {
        speed: { min: 20, max: 70 },
        scale: { start: 1, end: 0 },
        alpha: { start: 0.3, end: 0 },
        angle: { min: 230, max: 310 },
        rotate: { min: 0, max: 360 },
        lifespan: 4000,
        frequency: 70,
        tint: 0x222222,
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Circle(400, 300, 120),
          quantity: 1,
        },
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
