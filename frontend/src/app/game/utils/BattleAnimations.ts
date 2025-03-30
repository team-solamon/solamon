import * as Phaser from 'phaser'

import { Card } from '../../../gameObjects/Card'
import { AttackEvent } from '@/data/replay'

function createChargeUpEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number
) {
  const chargeParticles = scene.add.particles(x, y, 'spark', {
    scale: { start: 0.2, end: 0 },
    speed: { min: 100, max: 200 },
    quantity: 20,
    lifespan: 500,
    blendMode: 'ADD',
    tint: color,
    gravityY: -50,
    angle: { min: -30, max: 30 },
    radial: true,
    emitZone: {
      type: 'random',
      source: new Phaser.Geom.Circle(0, 0, 50),
      quantity: 12,
    },
  })

  for (let i = 0; i < 3; i++) {
    const ring = scene.add.circle(x, y, 20 + i * 15, color, 0)
    ring.setStrokeStyle(2, color)

    scene.tweens.add({
      targets: ring,
      scale: { from: 0.5, to: 2 },
      alpha: { from: 0.8, to: 0 },
      duration: 500,
      delay: i * 200,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    })
  }

  return chargeParticles
}

function createMotionTrail(
  scene: Phaser.Scene,
  gameObject: Phaser.GameObjects.Container
) {
  const previousPositions: { x: number; y: number }[] = []
  const maxTrails = 5
  const trailSprites: Phaser.GameObjects.Rectangle[] = []

  const updateTrail = () => {
    previousPositions.unshift({ x: gameObject.x, y: gameObject.y })
    if (previousPositions.length > maxTrails) previousPositions.pop()

    trailSprites.forEach((sprite) => sprite.destroy())
    trailSprites.length = 0

    previousPositions.forEach((pos, i) => {
      const alpha = 1 - i / maxTrails
      const trail = scene.add.rectangle(
        pos.x,
        pos.y,
        gameObject.width,
        gameObject.height,
        0xffffff,
        alpha * 0.3
      )
      trailSprites.push(trail)
    })
  }

  return {
    update: updateTrail,
    destroy: () => trailSprites.forEach((sprite) => sprite.destroy()),
  }
}

export function createAttackProjectile(
  scene: Phaser.Scene,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: number,
  onComplete: () => void,
  cardContainer: Phaser.GameObjects.Container
): void {
  const recoilDistance = 40
  const recoilDuration = 250
  const isAttackingRight = endX > startX

  scene.tweens.add({
    targets: cardContainer,
    x: cardContainer.x - (isAttackingRight ? recoilDistance : -recoilDistance),
    y: cardContainer.y - 15,
    angle: isAttackingRight ? -8 : 8,
    ease: 'Power2',
    duration: recoilDuration,
    yoyo: true,
    onComplete: () => {
      scene.tweens.add({
        targets: cardContainer,
        angle: 0,
        duration: 150,
        ease: 'Power1',
      })
    },
  })

  scene.tweens.add({
    targets: cardContainer,
    scaleX: 0.95,
    scaleY: 1.05,
    duration: 100,
    yoyo: true,
    repeat: 1,
  })

  const chargeParticles = createChargeUpEffect(scene, startX, startY, color)

  scene.time.delayedCall(500, () => {
    chargeParticles.destroy()

    const chargeEffect = scene.add.particles(startX, startY, 'spark', {
      scale: { start: 0.4, end: 0 },
      speed: { min: 70, max: 150 },
      quantity: 15,
      lifespan: 600,
      blendMode: 'ADD',
      tint: color,
      rotate: { min: 0, max: 360 },
      radial: true,
      angle: { min: 0, max: 360 },
    })

    for (let i = 0; i < 3; i++) {
      const concentrationRing = scene.add.circle(
        startX,
        startY,
        40 - i * 10,
        color,
        0.3
      )
      scene.tweens.add({
        targets: concentrationRing,
        scale: { from: 0.2, to: 1 },
        alpha: { from: 6, to: 0 },
        duration: 400,
        delay: i * 100,
        onComplete: () => concentrationRing.destroy(),
      })
    }

    scene.time.delayedCall(300, () => {
      const projectile = scene.add.container(startX, startY)

      const coreSize = 12
      const core = scene.add.circle(0, 0, coreSize, color)
      const innerGlow = scene.add.circle(0, 0, coreSize * 0.8, 0xffffff, 0.8)
      const outerGlow = scene.add.circle(0, 0, coreSize * 2, color, 0.4)
      const energyRing = scene.add
        .circle(0, 0, coreSize * 1.5, color, 0.6)
        .setStrokeStyle(3, 0xffffff, 0.4)

      const mainTrail = scene.add.particles(0, 0, 'spark', {
        follow: projectile,
        followOffset: { x: 0, y: 0 },
        speed: { min: 20, max: 50 },
        scale: { start: 0.6, end: 0 },
        lifespan: 600,
        blendMode: 'ADD',
        tint: color,
        frequency: 5,
        quantity: 2,
      })

      const sparkTrail = scene.add.particles(0, 0, 'spark', {
        follow: projectile,
        followOffset: { x: 0, y: 0 },
        speed: { min: 60, max: 100 },
        scale: { start: 0.3, end: 0 },
        lifespan: 400,
        blendMode: 'ADD',
        tint: 0xffffff,
        frequency: 20,
      })

      projectile.add([outerGlow, energyRing, core, innerGlow])

      scene.tweens.add({
        targets: [energyRing, outerGlow],
        scaleX: { from: 0.8, to: 1.4 },
        scaleY: { from: 0.8, to: 1.4 },
        alpha: { from: 0.8, to: 0.2 },
        yoyo: true,
        repeat: -1,
        duration: 150,
      })

      const path = new Phaser.Curves.Path(startX, startY)
      const controlPoint1X = startX + (endX - startX) * 0.5
      const controlPoint1Y = startY - 70
      const controlPoint2X = startX + (endX - startX) * 0.5
      const controlPoint2Y = endY - 70

      path.cubicBezierTo(
        endX,
        endY,
        controlPoint1X,
        controlPoint1Y,
        controlPoint2X,
        controlPoint2Y
      )

      const motionTrail = createMotionTrail(scene, projectile)

      scene.tweens.add({
        targets: projectile,
        z: 1,
        ease: 'Power2',
        duration: 700,
        onUpdate: (tween) => {
          const position = path.getPoint(tween.progress)
          projectile.x = position.x
          projectile.y = position.y
          projectile.rotation += 0.15
          motionTrail.update()
        },
        onComplete: () => {
          mainTrail.destroy()
          sparkTrail.destroy()
          projectile.destroy()
          chargeEffect.destroy()
          motionTrail.destroy()
          onComplete()
        },
      })
    })
  })
}

export function createImpactEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  attackEvent: AttackEvent,
  color: number
) {
  const flash = scene.add.circle(x, y, 40, color, 0.8)
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scale: 3,
    duration: 400,
    ease: 'Power2',
    onComplete: () => flash.destroy(),
  })

  for (let i = 0; i < 4; i++) {
    const ring = scene.add.circle(x, y, 30, color, 0)
    ring.setStrokeStyle(3, color, 1)

    scene.tweens.add({
      targets: ring,
      scale: { from: 0.5, to: 4 },
      alpha: { from: 0.8, to: 0 },
      duration: 800,
      delay: i * 100,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    })
  }

  const afterglowParticles = scene.add.particles(x, y, 'spark', {
    speed: { min: 20, max: 50 },
    scale: { start: 0.3, end: 0 },
    blendMode: 'ADD',
    tint: color,
    alpha: { start: 0.6, end: 0 },
    lifespan: 1000,
    frequency: 50,
    quantity: 2,
  })

  scene.time.delayedCall(1000, () => {
    afterglowParticles.destroy()
  })

  let shakeIntensity = 0.008
  let shakeDuration = 300

  if (attackEvent === 'CRITICAL') {
    shakeIntensity = 0.015
    shakeDuration = 500
  } else if (attackEvent === 'HALVED') {
    shakeIntensity = 0.004
    shakeDuration = 200
  }

  const originalX = scene.cameras.main.scrollX
  const originalY = scene.cameras.main.scrollY

  scene.cameras.main.shake(
    shakeDuration,
    shakeIntensity,
    true,
    (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      const currentIntensity = shakeIntensity * (1 - progress)
      camera.setScroll(
        originalX +
          Phaser.Math.Between(
            -currentIntensity * 1000,
            currentIntensity * 1000
          ),
        originalY +
          Phaser.Math.Between(-currentIntensity * 1000, currentIntensity * 1000)
      )

      if (progress === 1) {
        camera.setScroll(originalX, originalY)
      }
    }
  )

  scene.time.delayedCall(shakeDuration, () => {
    scene.cameras.main.setScroll(originalX, originalY)
  })

  const flashColor = color
  scene.cameras.main.flash(
    200,
    (flashColor >> 16) & 0xff,
    (flashColor >> 8) & 0xff,
    flashColor & 0xff
  )

  scene.time.delayedCall(100, () => {
    scene.cameras.main.flash(300, 255, 255, 255)
  })

  const originalZoom = scene.cameras.main.zoom
  scene.tweens.add({
    targets: scene.cameras.main,
    zoom: originalZoom * 1.025,
    duration: 100,
    yoyo: true,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      scene.cameras.main.zoom = originalZoom
    },
  })
  scene.time.delayedCall(100, () => {
    scene.cameras.main.zoom = originalZoom
  })

  return {
    applyCardRecoil: (cardContainer: Phaser.GameObjects.Container) => {
      scene.tweens.add({
        targets: cardContainer,
        x: cardContainer.x + 20,
        angle: Phaser.Math.Between(-5, 5),
        ease: 'Power2',
        duration: 150,
        yoyo: true,
        repeat: 1,
      })
    },
  }
}

function createDeathEffect(scene: Phaser.Scene, card: Card, color: number) {
  const x = card.x
  const y = card.y

  scene.tweens.add({
    targets: card,
    angle: { from: -5, to: 5 },
    duration: 50,
    repeat: 3,
    yoyo: true,
    ease: 'Sine.easeInOut',
  })

  const glow = scene.add.circle(x, y, 100, color, 0)
  scene.tweens.add({
    targets: glow,
    alpha: { from: 0.4, to: 0 },
    scale: { from: 0.5, to: 2 },
    duration: 600,
    ease: 'Power2',
    onComplete: () => glow.destroy(),
  })
}

function handleCardDefeat(
  scene: Phaser.Scene,
  defender: Card,
  color: number,
  addBattleLog: (message: string) => void
) {
  addBattleLog(`💀 ${defender.name} was defeated!`)

  scene.time.delayedCall(200, () => {
    scene.cameras.main.shake(300, 0.004)

    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff

    scene.cameras.main.flash(400, r, g, b)

    const originalZoom = scene.cameras.main.zoom
    scene.tweens.add({
      targets: scene.cameras.main,
      zoom: originalZoom * 1.02,
      duration: 300,
      ease: 'Cubic.easeOut',
      yoyo: true,
    })

    createDeathEffect(scene, defender, color)
  })
}

export const performSingleAttack = async (
  scene: Phaser.Scene,
  attackerCard: Card,
  defenderCard: Card,
  damage: number,
  attackEvent: AttackEvent,
  attackColor: number,
  addBattleLog: (message: string) => void
) => {
  const originalZoom = scene.cameras.main.zoom
  scene.tweens.add({
    targets: scene.cameras.main,
    zoom: originalZoom * 1.02,
    duration: 200,
    yoyo: true,
    ease: 'Cubic.easeInOut',
  })

  return new Promise<boolean>((resolveAttack) => {
    const startX = attackerCard.x
    const startY = attackerCard.y
    const endX = defenderCard.x
    const endY = defenderCard.y

    scene.sound.play('stx-attack', { volume: 0.8 })
    addBattleLog(
      `⚔️ ${
        attackerCard.isPlayer ? 'You attack' : 'Opponent attacks'
      } for ${damage} damage!`
    )

    createAttackProjectile(
      scene,
      startX,
      startY,
      endX,
      endY,
      attackColor,
      () => {
        const impactEffect = createImpactEffect(
          scene,
          endX,
          endY,
          attackEvent,
          attackColor
        )
        impactEffect.applyCardRecoil(defenderCard)

        createImpactEffect(scene, endX, endY, attackEvent, attackColor)

        const isDefeated = defenderCard.takeDamage(damage, attackEvent)

        if (isDefeated) {
          handleCardDefeat(scene, defenderCard, attackColor, addBattleLog)
        }

        scene.time.delayedCall(700, () => {
          resolveAttack(isDefeated)
        })
      },
      attackerCard
    )
  })
}
