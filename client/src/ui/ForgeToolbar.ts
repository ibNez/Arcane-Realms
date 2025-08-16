import { ForgeScene } from '../scenes/ForgeScene'

export function setupForgeUI(scene: ForgeScene) {
  const library = document.getElementById('component-library')!
  const addBtn = document.getElementById('tool-add')!
  const zoomInBtn = document.getElementById('tool-zoom-in')!
  const zoomOutBtn = document.getElementById('tool-zoom-out')!
  const deleteBtn = document.getElementById('tool-delete')!
  const snapBtn = document.getElementById('tool-snap')!

  addBtn.addEventListener('click', () => {
    library.classList.toggle('open')
  })

  zoomInBtn.addEventListener('click', () => {
    scene.cameras.main.setZoom(scene.cameras.main.zoom + 0.25)
  })
  zoomOutBtn.addEventListener('click', () => {
    scene.cameras.main.setZoom(Math.max(0.25, scene.cameras.main.zoom - 0.25))
  })

  deleteBtn.addEventListener('click', () => scene.deleteSelected())

  snapBtn.addEventListener('click', () => {
    scene.toggleSnap()
    snapBtn.classList.toggle('active', scene.snapToGrid)
  })

  document.querySelectorAll('#component-library .component').forEach((el) => {
    el.addEventListener('dragstart', (ev) => {
      ev.dataTransfer?.setData('component', (ev.target as HTMLElement).dataset.type || '')
    })
  })
}
