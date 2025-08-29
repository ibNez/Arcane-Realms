import Phaser from 'phaser'
import { PlayScene } from './scenes/PlayScene'
import { CharacterCreationScreen } from './ui/CharacterCreationScreen'
import { getDevConsole } from './ui/DevConsole'

function startGame() {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    backgroundColor: '#1a2030',
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 540 },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [PlayScene]
  })
}

// show character creation first
new CharacterCreationScreen(() => startGame())

// Prevent accidental back nav and toggle dev console
window.addEventListener('keydown', (e) => {
  if ((e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))) e.preventDefault()
  if (e.code === 'Backquote') getDevConsole().toggle()
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
