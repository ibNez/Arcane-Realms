import Phaser from 'phaser'

export function registerHeroAnimations(scene: Phaser.Scene) {
  scene.anims.create({
    key: 'hero-idle-down',
    frames: [{ key: 'hero', frame: 0 }],
    frameRate: 1,
    repeat: -1,
  })

  scene.anims.create({
    key: 'hero-walk-down',
    frames: scene.anims.generateFrameNumbers('hero', { start: 0, end: 2 }),
    frameRate: 8,
    repeat: -1,
  })

  scene.anims.create({
    key: 'hero-walk-left',
    frames: scene.anims.generateFrameNumbers('hero', { start: 3, end: 5 }),
    frameRate: 8,
    repeat: -1,
  })

  scene.anims.create({
    key: 'hero-walk-up',
    frames: scene.anims.generateFrameNumbers('hero', { start: 6, end: 8 }),
    frameRate: 8,
    repeat: -1,
  })
}
