import Phaser from 'phaser'
import { TestScene } from './scenes/TestScene'

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#1a2030',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 540 },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
  scene: [TestScene]
})

// Prevent accidental back nav
window.addEventListener('keydown', (e) => {
  if ((e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) e.preventDefault()
})

// Warn on unload
window.addEventListener('beforeunload', (e) => {
  e.preventDefault()
  e.returnValue = ''
})

// Fullscreen/pointer-lock helpers
;(window as any).enterFullscreen = () => document.documentElement.requestFullscreen?.()
;(window as any).exitFullscreen = () => document.exitFullscreen?.()
;(window as any).lockPointer = () => document.body.requestPointerLock?.()
;(window as any).unlockPointer = () => document.exitPointerLock?.()
