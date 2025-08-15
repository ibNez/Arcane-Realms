// client/src/ui/CharacterCreationScreen.ts
// Simple DOM-based character creation overlay
import { CharacterCustomizationPanel } from './CharacterCustomizationPanel'

export type CharacterData = {
  name: string
  portrait: string
  parameters?: Record<string, any>
}

export class CharacterCreationScreen {
  private root: HTMLDivElement
  private portraitEl: HTMLImageElement
  private nameInput: HTMLInputElement
  private optionsEl: HTMLDivElement
  private customPanel: CharacterCustomizationPanel
  private customParams: Record<string, any> | null = null
  private onStart: (data: CharacterData) => void

  constructor(onStart: (data: CharacterData) => void) {
    this.onStart = onStart

    this.root = document.createElement('div')
    Object.assign(this.root.style, {
      position: 'fixed', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,20,30,0.96)', color: '#eaeefb',
      fontFamily: 'ui-sans-serif,system-ui', zIndex: '10000'
    } as CSSStyleDeclaration)

    const panel = document.createElement('div')
    Object.assign(panel.style, {
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'rgba(255,255,255,0.05)', padding: '20px',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
      alignItems: 'center'
    } as CSSStyleDeclaration)
    this.root.appendChild(panel)

    this.portraitEl = document.createElement('img')
    Object.assign(this.portraitEl.style, {
      width: '128px', height: '128px', borderRadius: '8px',
      background: 'rgba(0,0,0,0.4)', objectFit: 'cover'
    } as CSSStyleDeclaration)
    panel.appendChild(this.portraitEl)

    this.nameInput = document.createElement('input')
    this.nameInput.type = 'text'
    this.nameInput.placeholder = 'Name your hero'
    Object.assign(this.nameInput.style, {
      width: '200px', padding: '6px 8px', borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255,255,255,0.08)', color: '#eaeefb'
    } as CSSStyleDeclaration)
    panel.appendChild(this.nameInput)

    this.optionsEl = document.createElement('div')
    Object.assign(this.optionsEl.style, { fontSize: '12px', opacity: '0.85' } as CSSStyleDeclaration)
    panel.appendChild(this.optionsEl)

    const btnRow = document.createElement('div')
    Object.assign(btnRow.style, { display: 'flex', gap: '8px' } as CSSStyleDeclaration)
    panel.appendChild(btnRow)

    const randBtn = document.createElement('button')
    randBtn.textContent = 'Randomize All'
    Object.assign(randBtn.style, {
      padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255,255,255,0.08)', color: '#eaeefb'
    } as CSSStyleDeclaration)
    randBtn.onclick = () => this.generate(this.customParams || {})
    btnRow.appendChild(randBtn)

    const customBtn = document.createElement('button')
    customBtn.textContent = 'Customize…'
    Object.assign(customBtn.style, {
      padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255,255,255,0.08)', color: '#eaeefb'
    } as CSSStyleDeclaration)
    this.customPanel = new CharacterCustomizationPanel(p => {
      this.customParams = p
      this.generate(p)
      this.updateOptions(p)
    })
    customBtn.onclick = () => this.customPanel.show()
    btnRow.appendChild(customBtn)

    const startBtn = document.createElement('button')
    startBtn.textContent = 'Start Adventure'
    Object.assign(startBtn.style, {
      padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(120,180,255,0.25)', color: '#eaeefb'
    } as CSSStyleDeclaration)
    startBtn.onclick = () => this.start()
    btnRow.appendChild(startBtn)

    document.body.appendChild(this.root)
    this.generate({})
  }

  private async generate(params: Record<string, any>) {
    try {
      const res = await fetch('http://localhost:8080/character/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {})
      })
      const data = await res.json()
      const portrait = data?.portraitUrl || data?.portrait
      if (portrait) this.portraitEl.src = portrait
      if (data?.name) this.nameInput.value = data.name
      if (data?.parameters) {
        this.customParams = data.parameters
        this.updateOptions(data.parameters)
      }
    } catch (err) {
      console.warn('character generation failed', err)
    }
  }

  private updateOptions(params: Record<string, any>) {
    const hair = params.hairStyle || params.hair_style
    const hairColor = params.hairColor || params.hair_color
    const eyes = params.eyeColor || params.eye_color
    const clothing = params.clothing || params.clothing_style
    const accessory = Array.isArray(params.accessories) ? params.accessories[0] : params.accessories
    const expression = params.expression
    const pose = params.pose
    const parts = [] as string[]
    if (hair) parts.push(`Hair: ${hair}`)
    if (hairColor) parts.push(`Hair Color: ${hairColor}`)
    if (eyes) parts.push(`Eyes: ${eyes}`)
    if (clothing) parts.push(`Clothing: ${clothing}`)
    if (accessory) parts.push(`Accessory: ${accessory}`)
    if (expression) parts.push(`Expression: ${expression}`)
    if (pose) parts.push(`Pose: ${pose}`)
    this.optionsEl.textContent = parts.join(', ')
  }

  private async start() {
    const payload = { name: this.nameInput.value.trim(), portrait: this.portraitEl.src, parameters: this.customParams }
    try {
      await fetch('http://localhost:8080/character/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (err) {
      console.warn('character save failed', err)
    }
    this.root.remove()
    this.onStart(payload)
  }
}

