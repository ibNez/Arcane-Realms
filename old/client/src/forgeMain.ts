import Phaser from 'phaser'
import { ForgeScene } from './scenes/ForgeScene'
import { setupForgeUI } from './ui/ForgeToolbar'
import { getDevConsole } from './ui/DevConsole'

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#1a2030',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 540 },
  scene: [ForgeScene],
})

const forgeScene = game.scene.getScene('ForgeScene') as ForgeScene
setupForgeUI(forgeScene)

window.addEventListener('keydown', (e) => {
  if (e.code === 'Backquote') getDevConsole().toggle()
})

