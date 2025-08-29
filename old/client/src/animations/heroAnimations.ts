import Phaser from 'phaser'

/**
 * Hero animation keys:
 * - hero-walk-down
 * - hero-walk-left
 * - hero-walk-right
 * - hero-walk-up
 * - hero-idle-down
 * - hero-idle-left
 * - hero-idle-right
 * - hero-idle-up
 */
export function registerHeroAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims
  if (!anims) return

  const exists = (key: string) => anims.exists(key)

  if (!exists('hero-walk-down')) {
    anims.create({
      key: 'hero-walk-down',
      frames: anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    })
  }
  if (!exists('hero-walk-left')) {
    anims.create({
      key: 'hero-walk-left',
      frames: anims.generateFrameNumbers('hero', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1,
    })
  }
  if (!exists('hero-walk-right')) {
    anims.create({
      key: 'hero-walk-right',
      frames: anims.generateFrameNumbers('hero', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1,
    })
  }
  if (!exists('hero-walk-up')) {
    anims.create({
      key: 'hero-walk-up',
      frames: anims.generateFrameNumbers('hero', { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1,
    })
  }
  if (!exists('hero-idle-down')) {
    anims.create({ key: 'hero-idle-down', frames: [{ key: 'hero', frame: 0 }], frameRate: 1 })
  }
  if (!exists('hero-idle-left')) {
    anims.create({ key: 'hero-idle-left', frames: [{ key: 'hero', frame: 4 }], frameRate: 1 })
  }
  if (!exists('hero-idle-right')) {
    anims.create({ key: 'hero-idle-right', frames: [{ key: 'hero', frame: 8 }], frameRate: 1 })
  }
  if (!exists('hero-idle-up')) {
    anims.create({ key: 'hero-idle-up', frames: [{ key: 'hero', frame: 12 }], frameRate: 1 })
  }
}

