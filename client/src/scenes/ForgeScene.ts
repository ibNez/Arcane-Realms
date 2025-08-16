import Phaser from 'phaser'

export class ForgeScene extends Phaser.Scene {
  snapToGrid = true
  selected: Phaser.GameObjects.Rectangle | null = null

  constructor() {
    super('ForgeScene')
  }

  create() {
    const canvas = this.game.canvas
    canvas.addEventListener('dragover', (e) => e.preventDefault())
    canvas.addEventListener('drop', (e) => this.handleDrop(e))

    this.input.on('gameobjectdown', (_p, obj) => {
      this.select(obj as Phaser.GameObjects.Rectangle)
    })

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      if (pointer.altKey && this.selected) {
        const r = this.selected
        const clone = this.add.rectangle(r.x, r.y, r.width, r.height, r.fillColor)
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
    const rect = this.game.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const world = this.cameras.main.getWorldPoint(x, y)
    this.placeComponent(type, world.x, world.y)
  }

  placeComponent(type: string, x: number, y: number) {
    let color = 0x88e3ff
    if (type === 'tree') color = 0x228b22
    else if (type === 'rock') color = 0x808080
    if (this.snapToGrid) {
      x = Math.round(x / 32) * 32
      y = Math.round(y / 32) * 32
    }
    const rect = this.add.rectangle(x, y, 32, 32, color)
    this.enableDrag(rect)
    this.select(rect)
  }

  enableDrag(obj: Phaser.GameObjects.Rectangle) {
    obj.setInteractive({ draggable: true })
  }

  select(obj: Phaser.GameObjects.Rectangle | null) {
    if (this.selected) this.selected.setStrokeStyle()
    this.selected = obj
    if (obj) obj.setStrokeStyle(2, 0xffff00)
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
