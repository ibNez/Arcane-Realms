// client/src/ui/CharacterCustomizationPanel.ts
// In-game character portrait generator with basic appearance options

type Params = {
  hairStyle: string
  hairColor: string
  eyeColor: string
  clothing: string
}

const HAIR_STYLES = ['short','long','braids','mohawk']
const HAIR_COLORS = ['black','brown','blonde','red','white','blue']
const EYE_COLORS = ['brown','blue','green','hazel','violet']
const CLOTHING = ['robe','leather','plate','casual']

export class CharacterCustomizationPanel {
  private root: HTMLDivElement
  private imgEl: HTMLImageElement
  private params: Params
  private onAccept: ((p:Params)=>void) | null
  private selects: Record<string, HTMLSelectElement> = {}

  constructor(onAccept?: (p:Params)=>void) {
    this.onAccept = onAccept || null
    this.params = { hairStyle: HAIR_STYLES[0], hairColor: HAIR_COLORS[0], eyeColor: EYE_COLORS[0], clothing: CLOTHING[0] }
    this.root = document.createElement('div')
    Object.assign(this.root.style, {
      position:'fixed', inset:'0', display:'none',
      alignItems:'center', justifyContent:'center',
      background:'rgba(0,0,0,0.8)', zIndex:10000
    } as CSSStyleDeclaration)

    const panel = document.createElement('div')
    Object.assign(panel.style, {
      display:'flex', gap:'24px', padding:'20px',
      background:'rgba(20,25,38,0.95)',
      border:'1px solid rgba(255,255,255,0.12)',
      borderRadius:'10px', color:'#eaeefb',
      fontFamily:'ui-sans-serif,system-ui'
    } as CSSStyleDeclaration)
    this.root.appendChild(panel)

    this.imgEl = document.createElement('img')
    Object.assign(this.imgEl.style, {
      width:'256px', height:'256px', objectFit:'cover',
      borderRadius:'8px', border:'1px solid rgba(255,255,255,0.15)'
    } as CSSStyleDeclaration)
    panel.appendChild(this.imgEl)

    const opts = document.createElement('div')
    Object.assign(opts.style, { display:'flex', flexDirection:'column', gap:'12px', width:'200px' } as CSSStyleDeclaration)
    panel.appendChild(opts)

    this.addSelect(opts, 'Hair Style', HAIR_STYLES, 'hairStyle')
    this.addSelect(opts, 'Hair Color', HAIR_COLORS, 'hairColor')
    this.addSelect(opts, 'Eye Color', EYE_COLORS, 'eyeColor')
    this.addSelect(opts, 'Clothing', CLOTHING, 'clothing')

    const row = document.createElement('div')
    Object.assign(row.style, { display:'flex', gap:'8px', marginTop:'8px' } as CSSStyleDeclaration)
    opts.appendChild(row)

    const randBtn = document.createElement('button')
    randBtn.textContent = 'Randomize All'
    Object.assign(randBtn.style, {
      flex:'1', padding:'8px 10px', borderRadius:'6px',
      border:'1px solid rgba(255,255,255,0.12)',
      background:'rgba(255,255,255,0.08)', color:'#eaeefb', cursor:'pointer'
    } as CSSStyleDeclaration)
    randBtn.onclick = () => { this.randomizeAll() }
    row.appendChild(randBtn)

    const acceptBtn = document.createElement('button')
    acceptBtn.textContent = 'Accept Character'
    Object.assign(acceptBtn.style, {
      flex:'1', padding:'8px 10px', borderRadius:'6px',
      border:'1px solid rgba(255,255,255,0.12)',
      background:'rgba(255,255,255,0.15)', color:'#eaeefb', cursor:'pointer'
    } as CSSStyleDeclaration)
    acceptBtn.onclick = () => { this.onAccept?.(this.params); this.hide() }
    row.appendChild(acceptBtn)

    document.body.appendChild(this.root)
    this.generate()
  }

  private addSelect(root: HTMLDivElement, label: string, options: string[], key: keyof Params) {
    const wrap = document.createElement('div')
    Object.assign(wrap.style, { display:'flex', flexDirection:'column', gap:'4px' } as CSSStyleDeclaration)
    const lab = document.createElement('label')
    lab.textContent = label
    Object.assign(lab.style, { fontSize:'14px', opacity:0.85 } as CSSStyleDeclaration)
    wrap.appendChild(lab)
    const sel = document.createElement('select')
    options.forEach(o => {
      const op = document.createElement('option')
      op.value = o
      op.textContent = o
      sel.appendChild(op)
    })
    sel.value = this.params[key]
    Object.assign(sel.style, {
      padding:'6px 8px', borderRadius:'6px',
      border:'1px solid rgba(255,255,255,0.12)',
      background:'rgba(255,255,255,0.06)', color:'#eaeefb'
    } as CSSStyleDeclaration)
    sel.onchange = () => {
      this.params[key] = sel.value
      this.generate()
    }
    wrap.appendChild(sel)
    root.appendChild(wrap)
    this.selects[key as string] = sel
  }

  private async generate() {
    try {
      const r = await fetch('/character/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(this.params)
      })
      const data = await r.json()
      const b64 = data?.imagePngBase64 || ''
      if (b64) this.imgEl.src = 'data:image/png;base64,' + b64
    } catch (e) {
      console.warn('character generation failed', e)
    }
  }

  private randomizeAll() {
    this.params = {
      hairStyle: HAIR_STYLES[Math.floor(Math.random()*HAIR_STYLES.length)],
      hairColor: HAIR_COLORS[Math.floor(Math.random()*HAIR_COLORS.length)],
      eyeColor: EYE_COLORS[Math.floor(Math.random()*EYE_COLORS.length)],
      clothing: CLOTHING[Math.floor(Math.random()*CLOTHING.length)]
    }
    for (const k in this.selects) this.selects[k].value = (this.params as any)[k]
    this.generate()
  }

  show() { this.root.style.display = 'flex' }
  hide() { this.root.style.display = 'none' }
}
