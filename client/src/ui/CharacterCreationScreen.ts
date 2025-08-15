// client/src/ui/CharacterCreationScreen.ts
// Simple DOM-based character creation overlay

export type CharacterData = {
  name: string
  portrait: string
}

export class CharacterCreationScreen {
  private root: HTMLDivElement
  private portraitEl: HTMLImageElement
  private nameInput: HTMLInputElement
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
    randBtn.onclick = () => this.generate()
    btnRow.appendChild(randBtn)

    const customBtn = document.createElement('button')
    customBtn.textContent = 'Customize…'
    Object.assign(customBtn.style, {
      padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255,255,255,0.08)', color: '#eaeefb'
    } as CSSStyleDeclaration)
    customBtn.onclick = () => alert('Customization coming soon')
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
    this.generate()
  }

  private async generate() {
    try {
      const res = await fetch('http://localhost:8080/character/generate')
      const data = await res.json()
      if (data?.portrait) this.portraitEl.src = data.portrait
      if (data?.name) this.nameInput.value = data.name
    } catch (err) {
      console.warn('character generation failed', err)
    }
  }

  private async start() {
    const payload = { name: this.nameInput.value.trim(), portrait: this.portraitEl.src }
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

