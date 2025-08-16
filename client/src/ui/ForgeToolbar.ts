import { ForgeScene } from '../scenes/ForgeScene'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8080'

export function setupForgeUI(scene: ForgeScene) {
  const library = document.getElementById('component-library')!
  const addBtn = document.getElementById('tool-add')!
  const zoomInBtn = document.getElementById('tool-zoom-in')!
  const zoomOutBtn = document.getElementById('tool-zoom-out')!
  const deleteBtn = document.getElementById('tool-delete')!
  const snapBtn = document.getElementById('tool-snap')!
  const importBtn = document.getElementById('tool-import')!
  const fileInput = document.getElementById('asset-file') as HTMLInputElement
  const importPanel = document.getElementById('import-panel')!
  const nameInput = document.getElementById('asset-name') as HTMLInputElement
  const saveBtn = document.getElementById('asset-save')!
  const cancelBtn = document.getElementById('asset-cancel')!

  function registerComponent(el: HTMLElement) {
    el.addEventListener('dragstart', (ev) => {
      ev.dataTransfer?.setData('component', el.dataset.type || '')
      ev.dataTransfer?.setData('src', el.dataset.src || '')
    })
  }

  function addComponent(asset: { name: string; file: string }) {
    const div = document.createElement('div')
    div.className = 'component'
    div.draggable = true
    div.dataset.type = asset.name
    const src = `${API_BASE}/assets/components/images/${asset.file}`
    div.dataset.src = src
    const img = document.createElement('img')
    img.src = src
    img.width = 64
    img.height = 64
    div.appendChild(img)
    registerComponent(div)
    library.appendChild(div)
  }

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

  importBtn.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      importPanel.classList.remove('hidden')
    }
  })
  cancelBtn.addEventListener('click', () => {
    importPanel.classList.add('hidden')
    fileInput.value = ''
    nameInput.value = ''
  })
  saveBtn.addEventListener('click', () => {
    const file = fileInput.files?.[0]
    const name = nameInput.value.trim()
    if (!file || !name) return
    const fd = new FormData()
    fd.append('image', file)
    fd.append('name', name)
    fetch(`${API_BASE}/api/assets`, { method: 'POST', body: fd })
      .then((r) => {
        if (!r.ok) throw new Error('upload failed')
        return r.json()
      })
      .then((asset) => {
        addComponent(asset)
      })
      .catch((err) => console.error('asset upload failed', err))
      .finally(() => {
        importPanel.classList.add('hidden')
        fileInput.value = ''
        nameInput.value = ''
      })
  })

  document.querySelectorAll('#component-library .component').forEach((el) => {
    registerComponent(el as HTMLElement)
  })

  fetch(`${API_BASE}/api/assets`)
    .then((r) => r.json())
    .then((assets) => assets.forEach(addComponent))
    .catch((err) => console.error('asset list failed', err))
}
