// client/src/ui/SkillBar.ts
export type SkillSlot = {
  keyLabel: string
  name: string
  cooldownMs: number
}

export class SkillBar {
  private root: HTMLDivElement
  private slots: HTMLDivElement[] = []
  private cds: number[] = [] // remaining ms per slot
  private lastTs = performance.now()

  constructor(skills: SkillSlot[]) {
    this.root = document.createElement('div')
      this.root.style.pointerEvents = 'none'
    Object.assign(this.root.style, {
      position: 'fixed', left: '50%', bottom: '14px', transform: 'translateX(-50%)',
      display: 'flex', gap: '10px', padding: '8px 10px',
      background: 'rgba(15,20,30,0.7)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px', color: '#eaeefb', zIndex: 10000,
      fontFamily: 'ui-sans-serif,system-ui', fontSize: '12px', userSelect: 'none'
    } as CSSStyleDeclaration)

    skills.forEach((s, idx) => {
      const slot = document.createElement('div')
      Object.assign(slot.style, {
        position: 'relative', width: '56px', height: '56px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      } as CSSStyleDeclaration)

      const key = document.createElement('div')
      key.textContent = s.keyLabel
      Object.assign(key.style, { position:'absolute', top:'4px', left:'6px', opacity:'0.8', fontSize:'11px' } as CSSStyleDeclaration)

      const name = document.createElement('div')
      name.textContent = s.name
      Object.assign(name.style, { position:'absolute', bottom:'4px', left:'6px', right:'6px', fontSize:'10px', textAlign:'center', opacity:'0.85' } as CSSStyleDeclaration)

      const cd = document.createElement('div')
      Object.assign(cd.style, {
        position: 'absolute', inset: '0', background: 'rgba(0,0,0,0.45)',
        borderRadius: '8px', transformOrigin: 'bottom', transform: 'scaleY(0)', pointerEvents: 'none'
      } as CSSStyleDeclaration)
      cd.setAttribute('data-cd', '1')

      slot.appendChild(key); slot.appendChild(name); slot.appendChild(cd)
      slot.style.pointerEvents = 'auto'
        this.root.appendChild(slot)
      this.slots.push(slot)
      this.cds[idx] = 0
    })

    document.body.appendChild(this.root)
    requestAnimationFrame(this.tick)
  }

  // arrow function to preserve this
  tick = (t: number) => {
    const dt = t - this.lastTs; this.lastTs = t
    for (let i=0;i<this.cds.length;i++) {
      if (this.cds[i] > 0) {
        this.cds[i] = Math.max(0, this.cds[i] - dt)
        const cdEl = this.slots[i].querySelector('[data-cd]') as HTMLDivElement
        const slotCd = Number(this.slots[i].getAttribute('data-cooldown')||'0')
        const frac = slotCd > 0 ? (this.cds[i] / slotCd) : 0
        cdEl.style.transform = `scaleY(${frac})`
      }
    }
    requestAnimationFrame(this.tick)
  }

  setCooldown(slotIndex: number, cooldownMs: number) {
    this.slots[slotIndex].setAttribute('data-cooldown', String(cooldownMs))
  }

  trigger(slotIndex: number) {
    const total = Number(this.slots[slotIndex].getAttribute('data-cooldown')||'0')
    this.cds[slotIndex] = total
  }

  isReady(slotIndex: number) {
    return (this.cds[slotIndex] || 0) <= 0
  }

  flash(slotIndex: number) {
    const el = this.slots[slotIndex]
    el.animate([{ boxShadow:'0 0 0 rgba(0,0,0,0)' }, { boxShadow:'0 0 12px rgba(255,120,120,0.6)' }, { boxShadow:'0 0 0 rgba(0,0,0,0)' }], { duration: 240 })
  }
}
