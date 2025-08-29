// client/src/ui/DevConsole.ts
// Lightweight in-game console overlay: toggle with ` (backtick/tilde)
export class DevConsole {
  private root: HTMLDivElement
  private logEl: HTMLDivElement
  private open = false
  private origLog = console.log
  private origWarn = console.warn
  private origErr = console.error

  constructor() {
    this.root = document.createElement('div')
    Object.assign(this.root.style, {
      position: 'fixed', left:'0', right:'0', top:'0',
      maxHeight:'40vh', transform: 'translateY(-100%)',
      background:'rgba(10,15,25,0.96)', color:'#eaeefb',
      borderBottom:'1px solid rgba(255,255,255,0.12)',
      padding:'8px 10px', zIndex:10002,
      fontFamily:'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
      fontSize:'12px', lineHeight:'1.4', display:'flex', flexDirection:'column', gap:'6px'
    } as CSSStyleDeclaration)

    const header = document.createElement('div')
    header.textContent = 'Console — press ` to toggle'
    Object.assign(header.style, { opacity:'0.8' } as CSSStyleDeclaration)
    this.root.appendChild(header)

    this.logEl = document.createElement('div')
    Object.assign(this.logEl.style, {
      overflow:'auto', maxHeight:'30vh', paddingRight:'6px',
      display:'flex', flexDirection:'column', gap:'4px', border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:'6px', background:'rgba(255,255,255,0.03)'
    } as CSSStyleDeclaration)
    this.root.appendChild(this.logEl)

    const row = document.createElement('div')
    const clearBtn = document.createElement('button')
    clearBtn.textContent = 'Clear'
    Object.assign(clearBtn.style, { padding:'6px 10px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)', color:'#eaeefb', cursor:'pointer' } as CSSStyleDeclaration)
    clearBtn.onclick = () => { this.logEl.innerHTML = '' }
    row.appendChild(clearBtn)
    row.style.display = 'flex'
    row.style.gap = '8px'
    this.root.appendChild(row)

    document.body.appendChild(this.root)

    // Patch console
    console.log = (...args:any[]) => { this.append('log', args); this.origLog(...args) }
    console.warn = (...args:any[]) => { this.append('warn', args); this.origWarn(...args) }
    console.error = (...args:any[]) => { this.append('error', args); this.origErr(...args) }

    // Global errors
    window.addEventListener('error', (e) => { this.append('error', [e.message || String(e)]) })
    window.addEventListener('unhandledrejection', (e:any) => { this.append('error', ['Unhandled promise rejection:', e?.reason ?? e]) })
  }

  toggle() {
    this.open = !this.open
    this.root.style.transform = this.open ? 'translateY(0)' : 'translateY(-100%)'
  }

  append(level: 'log' | 'warn' | 'error', args: any[]) {
    const line = document.createElement('div')
    const color = level === 'error' ? '#ff9b9b' : (level === 'warn' ? '#ffe08a' : '#c9e1ff')
    line.style.color = color
    const s = args.map(a => {
      try { return typeof a === 'string' ? a : JSON.stringify(a) }
      catch { return String(a) }
    }).join(' ')
    line.textContent = `[${level}] ${s}`
    this.logEl.appendChild(line)
    this.logEl.scrollTop = this.logEl.scrollHeight
  }
}

// Singleton helper
let _devConsole: DevConsole | null = null
export function getDevConsole() {
  if (!_devConsole) _devConsole = new DevConsole()
  return _devConsole
}
