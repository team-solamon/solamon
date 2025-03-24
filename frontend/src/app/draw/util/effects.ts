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
  const center = { x, y }

  for (let r = 0; r < rings; r++) {
    setTimeout(() => {
      const ring = scene.add.circle(center.x, center.y, 100 + r * 30, color, 0)
      ring.setStrokeStyle(2, color, 0.7)
      ring.setDepth(depth - 0.05)
      particles.push(ring)

      const rotationDirection = Math.random() > 0.5 ? 1 : -1
      scene.tweens.add({
        targets: ring,
        rotation: rotationDirection * 0.2,
        scale: { from: 0.8, to: 1.8 },
        alpha: { from: 0.7, to: 0 },
        duration: 2000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          ring.destroy()
          particles.splice(particles.indexOf(ring), 1)
        },
      })

      const particleCount = 24
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2
        const radius = 200 + r * 30
        const randomOffset = Math.random() * 15 - 7.5
        const particle = scene.add.circle(
          center.x + Math.cos(angle) * radius + randomOffset,
          center.y + Math.sin(angle) * radius + randomOffset,
          1.5 + Math.random() * 2,
          color,
          0.8
        )
        particle.setBlendMode(Phaser.BlendModes.ADD)
        particles.push(particle)

        const duration = 800 + Math.random() * 400
        const targetRadius = radius * (0.3 + Math.random() * 0.4)
        const startAngle = angle + Math.random() * 0.3 - 0.15

        scene.tweens.add({
          targets: particle,
          x: center.x + Math.cos(startAngle) * targetRadius,
          y: center.y + Math.sin(startAngle) * targetRadius,
          scale: { from: 1, to: 0.2 },
          alpha: { from: 0.8, to: 0 },
          duration: duration,
          delay: i * 20,
          ease: 'Sine.easeOut',
          onComplete: () => {
            particle.destroy()
            particles.splice(particles.indexOf(particle), 1)
          },
        })

        scene.tweens.add({
          targets: particle,
          alpha: { from: 0.8, to: 0.3 },
          yoyo: true,
          repeat: 3,
          duration: duration / 5,
          delay: i * 20,
          ease: 'Sine.easeInOut',
        })
      }

      // 추가 작은 파티클들
      const smallParticleCount = 16
      for (let i = 0; i < smallParticleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = (80 + r * 30) * (0.8 + Math.random() * 0.4)
        const particle = scene.add.circle(
          center.x + Math.cos(angle) * radius,
          center.y + Math.sin(angle) * radius,
          1 + Math.random(),
          color,
          0.6
        )
        particle.setBlendMode(Phaser.BlendModes.ADD)
        particles.push(particle)

        const moveAngle = angle + (Math.random() * 0.8 - 0.4)
        const moveDuration = 600 + Math.random() * 300

        scene.tweens.add({
          targets: particle,
          x: center.x + Math.cos(moveAngle) * (radius * 1.3),
          y: center.y + Math.sin(moveAngle) * (radius * 1.3),
          alpha: 0,
          scale: 0.3,
          duration: moveDuration,
          delay: i * 40,
          ease: 'Quad.easeOut',
          onComplete: () => {
            particle.destroy()
            particles.splice(particles.indexOf(particle), 1)
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
