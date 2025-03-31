import Phaser from 'phaser'

export function loadCardAssets(scene: Phaser.Scene): void {
  scene.load.image('cardpack', '/images/game/cardpack.png')
  scene.load.image('cardback', '/images/game/cardback.png')
  scene.load.image('starburst', '/images/game/starburst.png')
}

export function loadSpeciesAssets(
  scene: Phaser.Scene,
  speciesCount: number
): void {
  for (let i = 0; i < speciesCount; i++) {
    scene.load.image(`species-${i}`, `/images/species/${i}.png`)
  }
}

export function loadAllCardAssets(scene: Phaser.Scene): void {
  loadCardAssets(scene)
  loadSpeciesAssets(scene, 10)
}
