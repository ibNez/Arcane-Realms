// client/src/ui/ChatPanel.ts
// DOM chat overlay; press C to toggle from the scene. Enter to send.
type SendHandler = (text: string) => void

export class ChatPanel {
  private root: HTMLDivElement
  private logEl: HTMLDivElement
  private inputEl: HTMLInputElement
  private open = false
  private onSend: SendHandler | null = null

  constructor() {
    this.root = document.createElement('div')
    Object.assign(this.root.style, {
      position: 'fixed', left: '16px', bottom: '16px', width: '420px', maxHeight: '45vh',
      display: 'none', flexDirection: 'column',
      background: 'rgba(15,20,30,0.9)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
      padding: '10px', color: '#eaeefb',
      fontFamily: 'ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial',
      fontSize: '14px', boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(4px)', gap: '8px', zIndex: '10000'
    } as CSSStyleDeclaration)

    this.logEl = document.createElement('div')
    Object.assign(this.logEl.style, {
      overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '6px',
      maxHeight: '32vh', paddingRight: '4px'
    } as CSSStyleDeclaration)
    this.root.appendChild(this.logEl)

    const row = document.createElement('div')
    Object.assign(row.style, { display: 'flex', gap: '8px' } as CSSStyleDeclaration)
    this.root.appendChild(row)

    this.inputEl = document.createElement('input')
    this.inputEl.type = 'text'
    this.inputEl.placeholder = 'Talk to the guide… (Enter to send)'
    Object.assign(this.inputEl.style, {
      flex: '1', padding: '8px 10px', borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.06)', color: '#eaeefb'
    } as CSSStyleDeclaration)
    // Capture ALL keydowns while focused so Phaser doesn't see them
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const text = this.inputEl.value.trim()
        if (text && this.onSend) { this.onSend(text); this.inputEl.value = '' }
      }
      e.stopPropagation()
    }, true) // capture

    row.appendChild(this.inputEl)

    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Close'
    Object.assign(closeBtn.style, {
      padding: '8px 10px', borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.08)', color: '#eaeefb', cursor: 'pointer'
    } as CSSStyleDeclaration)
    closeBtn.onclick = () => this.hide()
    row.appendChild(closeBtn)

    document.body.appendChild(this.root)

    this.addSystem('Press C to toggle chat. Ask for a quest or hint!')
  }

  setOnSend(handler: SendHandler) { this.onSend = handler }
  show() { this.open = true; this.root.style.display = 'flex'; setTimeout(() => this.inputEl.focus(), 0) }
  hide() { this.open = false; this.root.style.display = 'none' }
  isOpen() { return this.open }

  addUser(text: string) { this.addBubble(text, true) }
  addNpc(text: string) { this.addBubble(text, false) }
  addSystem(text: string) {
    const line = document.createElement('div')
    Object.assign(line.style, { alignSelf: 'center', opacity: '0.8', fontSize: '12px' } as CSSStyleDeclaration)
    line.textContent = text
    this.logEl.appendChild(line); this.logEl.scrollTop = this.logEl.scrollHeight
  }

  private addBubble(text: string, isUser: boolean) {
    const line = document.createElement('div')
    if (isUser) {
      Object.assign(line.style, {
        alignSelf: 'flex-end', background: 'rgba(120,180,255,0.15)',
        border: '1px solid rgba(120,180,255,0.25)', borderRadius: '6px', padding: '6px 8px'
      } as CSSStyleDeclaration)
    } else {
      Object.assign(line.style, {
        alignSelf: 'flex-start', background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 8px'
      } as CSSStyleDeclaration)
    }
    line.textContent = text
    this.logEl.appendChild(line); this.logEl.scrollTop = this.logEl.scrollHeight
  }
}
