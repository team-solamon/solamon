import * as Phaser from 'phaser'

export class BackgroundContainer extends Phaser.GameObjects.Container {
  private statusText: Phaser.GameObjects.Text | null = null
  private bg: Phaser.GameObjects.Image
  private battlefieldLabel: Phaser.GameObjects.Text
  private playerLabel: Phaser.GameObjects.Text
  private opponentLabel: Phaser.GameObjects.Text
  private battlefieldGlow!: Phaser.GameObjects.Graphics
  private battlefieldParticles!: Phaser.GameObjects.Particles.ParticleEmitter

  constructor(scene: Phaser.Scene) {
    super(scene)

    this.bg = scene.add
      .image(400, 300, 'battlefield')
      .setAlpha(0.5)
      .setDepth(-100)

    this.createBattlefield()

    this.battlefieldLabel = scene.add
      .text(400, 300, 'BATTLE FIELD', {
        fontSize: '15px',
        color: '#ffdd00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000',
          blur: 2,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(0)

    this.playerLabel = scene.add
      .text(400, 550, 'YOUR CARDS', {
        fontSize: '16px',
        color: '#3498db',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0)

    this.opponentLabel = scene.add
      .text(400, 60, 'OPPONENT', {
        fontSize: '16px',
        color: '#e74c3c',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0)

    this.initializeStatusText()

    this.add([
      this.bg,
      this.battlefieldGlow,
      this.battlefieldLabel,
      this.playerLabel,
      this.opponentLabel,
    ])

    if (this.statusText) {
      this.statusText.setDepth(9999)
    }

    scene.add.existing(this)
  }

  private createBattlefield() {
    const centerY = 300

    this.battlefieldGlow = this.scene.add.graphics()

    this.scene.add
      .rectangle(400, centerY, 750, 160, 0x1a2b3c)
      .setStrokeStyle(2, 0x4488cc)
      .setAlpha(0.7)

    this.scene.add.rectangle(400, centerY + 80, 750, 2, 0x4488cc).setAlpha(0.6)
    this.scene.add.rectangle(400, centerY - 80, 750, 2, 0x4488cc).setAlpha(0.6)

    this.battlefieldParticles = this.scene.add.particles(
      400,
      centerY,
      'starburst',
      {
        scale: { start: 0.2, end: 0.1 },
        speed: 20,
        lifespan: 2000,
        blendMode: 'ADD',
        frequency: 200,
        alpha: { start: 0.5, end: 0 },
        emitZone: {
          type: 'edge',
          source: new Phaser.Geom.Rectangle(-375, -80, 750, 160),
          quantity: 48,
          yoyo: false,
        },
      }
    )
  }

  private initializeStatusText() {
    this.statusText = this.scene.add
      .text(400, 25, 'Battle starting soon...', {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#000',
          blur: 5,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(1000)
  }

  updateStatusText(message: string, animate: boolean) {
    if (!this.statusText) {
      return
    }

    this.statusText.setText(message)

    if (animate) {
      this.scene.tweens.add({
        targets: this.statusText,
        scale: { from: 1.5, to: 1 },
        duration: 1000,
        ease: 'Back.easeOut',
      })
    }
  }

  hideStatusText() {
    if (this.statusText) {
      this.statusText.visible = false
    }
  }

  animateBattlefield() {
    let glowIntensity = 0
    let increasing = true

    this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        if (increasing) {
          glowIntensity += 0.02
          if (glowIntensity >= 1) increasing = false
        } else {
          glowIntensity -= 0.02
          if (glowIntensity <= 0.2) increasing = true
        }

        this.battlefieldGlow.clear()
        this.battlefieldGlow.fillStyle(0x4488cc, glowIntensity * 0.2)
        this.battlefieldGlow.fillRect(25, 270, 750, 60)
      },
      loop: true,
    })
  }

  getBattlefieldElements() {
    return {
      glow: this.battlefieldGlow,
      particles: this.battlefieldParticles,
    }
  }

  fadeIn() {
    this.scene.tweens.add({
      targets: [this.battlefieldLabel, this.playerLabel, this.opponentLabel],
      alpha: { from: 0, to: 0.8 },
      duration: 800,
      delay: this.scene.tweens.stagger(200, { start: 200 }),
      ease: 'Power2',
    })
  }
}
