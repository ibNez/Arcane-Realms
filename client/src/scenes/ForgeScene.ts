import Phaser from 'phaser'

export class ForgeScene extends Phaser.Scene {
  snapToGrid = true
  selected: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | null = null

  constructor() {
    super('ForgeScene')
  }

  create() {
    const canvas = this.game.canvas
    canvas.addEventListener('dragover', (e) => e.preventDefault())
    canvas.addEventListener('drop', (e) => this.handleDrop(e))

    this.input.on('gameobjectdown', (_p, obj) => {
      this.select(obj as any)
    })

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      if (pointer.altKey && this.selected) {
        const s = this.selected
        let clone: any
        if (s instanceof Phaser.GameObjects.Rectangle) {
          clone = this.add.rectangle(s.x, s.y, s.width, s.height, s.fillColor)
        } else {
          clone = this.add.image(s.x, s.y, s.texture.key).setOrigin(s.originX, s.originY)
        }
        this.enableDrag(clone)
        this.select(clone)
        ;(pointer as any).dragClone = clone
      }
    })

    this.input.on('drag', (pointer, _obj, dragX, dragY) => {
      const target: any = (pointer as any).dragClone || this.selected
      if (!target) return
      if (this.snapToGrid) {
        dragX = Math.round(dragX / 32) * 32
        dragY = Math.round(dragY / 32) * 32
      }
      target.setPosition(dragX, dragY)
    })

    this.input.on('dragend', (pointer) => {
      if ((pointer as any).dragClone) {
        (pointer as any).dragClone = null
      }
    })
  }

  handleDrop(e: DragEvent) {
    e.preventDefault()
    const type = e.dataTransfer?.getData('component')
    if (!type) return
    const src = e.dataTransfer?.getData('src')
    const rect = this.game.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const world = this.cameras.main.getWorldPoint(x, y)
    this.placeComponent(type, world.x, world.y, src)
  }

  placeComponent(type: string, x: number, y: number, src?: string) {
    if (this.snapToGrid) {
      x = Math.round(x / 32) * 32
      y = Math.round(y / 32) * 32
    }
    if (src) {
      const key = type
      if (!this.textures.exists(key)) {
        this.load.image(key, src)
        this.load.once(Phaser.Loader.Events.COMPLETE, () => {
          const img = this.add.image(x, y, key)
          this.enableDrag(img)
          this.select(img)
        })
        this.load.start()
      } else {
        const img = this.add.image(x, y, key)
        this.enableDrag(img)
        this.select(img)
      }
      return
    }
    let color = 0x88e3ff
    if (type === 'tree') color = 0x228b22
    else if (type === 'rock') color = 0x808080
    const rect = this.add.rectangle(x, y, 32, 32, color)
    this.enableDrag(rect)
    this.select(rect)
  }

  enableDrag(obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
    obj.setInteractive({ draggable: true })
  }

  select(obj: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | null) {
    if (this.selected) {
      if (this.selected instanceof Phaser.GameObjects.Rectangle) this.selected.setStrokeStyle()
      else this.selected.clearTint()
    }
    this.selected = obj
    if (obj) {
      if (obj instanceof Phaser.GameObjects.Rectangle) obj.setStrokeStyle(2, 0xffff00)
      else obj.setTint(0xffff00)
    }
  }

  deleteSelected() {
    if (this.selected) {
      this.selected.destroy()
      this.selected = null
    }
  }

  toggleSnap() {
    this.snapToGrid = !this.snapToGrid
  }
}
