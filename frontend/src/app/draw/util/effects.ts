import * as Phaser from 'phaser'

export interface ParticleEffect {
  destroy: () => void
}

export function createElegantRings(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth: number,
  color: number,
  rings: number,
  delay = 0
): ParticleEffect {
  const particles: Phaser.GameObjects.Shape[] = []
  const center = { x: x, y: y }

  for (let r = 0; r < rings; r++) {
    setTimeout(() => {
      const ring = scene.add.circle(center.x, center.y, 100 + r * 30, color, 0)
      ring.setStrokeStyle(2, color, 0.7)
      ring.setDepth(depth - 0.05)
      particles.push(ring)

      scene.tweens.add({
        targets: ring,
        scale: { from: 0.8, to: 1.5 },
        alpha: { to: 0 },
        duration: 1500,
        ease: 'Sine.easeOut',
        onComplete: () => {
          ring.destroy()
          const index = particles.indexOf(ring)
          if (index > -1) {
            particles.splice(index, 1)
          }
        },
      })

      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2
        const radius = 100 + r * 30
        const particle = scene.add.circle(
          center.x + Math.cos(angle) * radius,
          center.y + Math.sin(angle) * radius,
          3,
          color,
          0.8
        )
        particle.setBlendMode(Phaser.BlendModes.ADD)
        particles.push(particle)

        scene.tweens.add({
          targets: particle,
          x: center.x,
          y: center.y,
          scale: { from: 1, to: 0.5 },
          alpha: 0,
          duration: 800,
          delay: i * 50,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            particle.destroy()
            const index = particles.indexOf(particle)
            if (index > -1) {
              particles.splice(index, 1)
            }
          },
        })
      }
    }, delay + r * 200)
  }

  return {
    destroy: () => {
      particles.forEach((particle) => particle.destroy())
      particles.length = 0
    },
  }
}
