import Phaser from 'phaser'

export interface ButtonOptions {
  x: number
  y: number
  width: number
  height: number
  text: string
  backgroundColor?: number
  hoverColor?: number
  textColor?: string
  fontSize?: string
  strokeColor?: number
  strokeWidth?: number
  depth?: number
  textDepth?: number
}

export class Button {
  private scene: Phaser.Scene
  private rectangle: Phaser.GameObjects.Rectangle
  private text: Phaser.GameObjects.Text
  private clickCallback: (() => void) | null = null

  constructor(scene: Phaser.Scene, options: ButtonOptions) {
    this.scene = scene

    const backgroundColor = options.backgroundColor || 0x4a6fa5
    const hoverColor = options.hoverColor || 0x6389c0
    const textColor = options.textColor || '#ffffff'
    const fontSize = options.fontSize || '20px'
    const depth = options.depth || 1
    const textDepth = options.textDepth || depth + 1

    this.rectangle = scene.add.rectangle(
      options.x,
      options.y,
      options.width,
      options.height,
      backgroundColor
    )

    if (options.strokeColor && options.strokeWidth) {
      this.rectangle.setStrokeStyle(options.strokeWidth, options.strokeColor)
    }

    this.rectangle.setInteractive()
    this.rectangle.setDepth(depth)

    this.text = scene.add
      .text(options.x, options.y, options.text, {
        fontSize: fontSize,
        color: textColor,
      })
      .setOrigin(0.5)

    this.text.setDepth(textDepth)

    this.rectangle.on('pointerover', () => {
      this.rectangle.setFillStyle(hoverColor)
    })

    this.rectangle.on('pointerout', () => {
      this.rectangle.setFillStyle(backgroundColor)
    })

    this.rectangle.on('pointerdown', () => {
      if (this.clickCallback) {
        this.clickCallback()
      }
    })
  }

  setOnClick(callback: () => void): Button {
    this.clickCallback = callback
    return this
  }

  setAlpha(alpha: number): Button {
    this.rectangle.setAlpha(alpha)
    this.text.setAlpha(alpha)
    return this
  }

  setPosition(x: number, y: number): Button {
    this.rectangle.setPosition(x, y)
    this.text.setPosition(x, y)
    return this
  }

  setText(text: string): Button {
    this.text.setText(text)
    return this
  }

  animateTo(
    properties: Record<string, unknown>,
    duration: number,
    ease = 'Power2',
    onComplete?: () => void
  ): Button {
    this.scene.tweens.add({
      targets: [this.rectangle, this.text],
      ...properties,
      duration: duration,
      ease: ease,
      onComplete: onComplete,
    })
    return this
  }

  destroy(): void {
    this.rectangle.destroy()
    this.text.destroy()
  }

  getElements(): [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text] {
    return [this.rectangle, this.text]
  }
}
