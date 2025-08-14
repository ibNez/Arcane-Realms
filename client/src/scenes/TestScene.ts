import Phaser from 'phaser'
import { ChatPanel } from '../ui/ChatPanel'
import { SkillBar } from '../ui/SkillBar'
import { getDevConsole } from '../ui/DevConsole'

type Enemy = { id:number; node:Phaser.GameObjects.Arc; hp:number; maxHp:number; speed:number; hpBg: Phaser.GameObjects.Rectangle; hpFg: Phaser.GameObjects.Rectangle }
type Loot  = { id:number; node:Phaser.GameObjects.Rectangle; value:number }

export class TestScene extends Phaser.Scene {
  // input
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  wasd!: { up:Phaser.Input.Keyboard.Key; down:Phaser.Input.Keyboard.Key; left:Phaser.Input.Keyboard.Key; right:Phaser.Input.Keyboard.Key }
  fireKey!: Phaser.Input.Keyboard.Key
  skillQ!: Phaser.Input.Keyboard.Key
  skill1!: Phaser.Input.Keyboard.Key
    skill2!: Phaser.Input.Keyboard.Key
    skillE!: Phaser.Input.Keyboard.Key
  cycleKey!: Phaser.Input.Keyboard.Key
  toggleChatKey!: Phaser.Input.Keyboard.Key

  // net (minimal)
  ws!: WebSocket
  id: string | null = null
  reconnectAttempts = 0

  // player
  me!: Phaser.GameObjects.Arc
  hp = 100; maxHp = 100; score = 0
  targetPos: Phaser.Math.Vector2 | null = null
  lastMoveDir: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1,0)

  // chat
  chat!: ChatPanel

  // world
  arena!: Phaser.GameObjects.Rectangle
  walls!: Phaser.GameObjects.Rectangle[]
  testMarker!: Phaser.GameObjects.Arc
  aiEnabled = true

  // entities
  bullets!: Phaser.GameObjects.Arc[]
  enemies: Enemy[] = []
  loots: Map<number, Loot> = new Map()
  nextEnemyId = 1
  nextLootId = 1

  // lock/target
  lockedEnemy: Enemy | null = null
  lockRing!: Phaser.GameObjects.Arc
  lockHpBg!: Phaser.GameObjects.Rectangle
  lockHpFg!: Phaser.GameObjects.Rectangle

  // skills/cooldown UI
  skillBar!: SkillBar
  cdSkill1 = 500 // ms
    cdSkill2 = 1500 // ms

    // nova visuals
    novaTelegraph!: Phaser.GameObjects.Arc | null

  // toggles
  invincible = false
  slowmo = false

  create() {
    // input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys({ up:'W', left:'A', down:'S', right:'D' }) as any
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.skillQ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    this.skill1 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE)
      this.skill2 = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO)
      this.skillE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.cycleKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB) as Phaser.Input.Keyboard.Key
    this.cycleKey.preventDefault = true
    this.toggleChatKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C)

      // Dev console toggle
      const backtick = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK)
      backtick.on('down', () => getDevConsole().toggle())
      console.log('Dev console ready (press `)')

    // world + player
    this.buildArena()
    this.me = this.add.circle(this.scale.width*0.5, this.scale.height*0.5, 10, 0x77c0ff).setDepth(5)

    // lock UI
    this.lockRing = this.add.circle(0,0,14,0x000000,0).setStrokeStyle(2,0x88e3ff).setVisible(false).setDepth(7)
    this.lockHpBg = this.add.rectangle(0,0,26,4,0x000000,0.6).setVisible(false).setDepth(8)
    this.lockHpFg = this.add.rectangle(0,0,26,4,0x88e3ff,0.9).setVisible(false).setDepth(9)

      this.novaTelegraph = this.add.circle(0,0,8,0x88e3ff,0.12).setVisible(false).setDepth(3)

    // pointers
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.chat?.isOpen()) return
      if (p.leftButtonDown()) {
        const hit = this.pickEnemyAt(p.worldX, p.worldY, 16)
        if (hit) {
          this.setLockedEnemy(hit)
          this.castMagicMissile()
        } else {
          this.targetPos = new Phaser.Math.Vector2(p.worldX, p.worldY)
        }
      }
      if (p.rightButtonDown()) {
        // free-aim shot for testing
        this.shootToward(p.worldX, p.worldY)
      }
    })
    this.input.mouse?.disableContextMenu()

    // chat
    this.chat = new ChatPanel()
    this.chat.setOnSend(async (text) => {
      this.chat.addUser(text)
      const reply = await this.askNpc(text)
      this.chat.addNpc(reply || '(no reply)')
    })

    // net
    this.connectWS()

    // skills UI
    this.skillBar = new SkillBar([
      { keyLabel: '1', name: 'Missile', cooldownMs: this.cdSkill1 },
      { keyLabel: '2', name: 'Nova', cooldownMs: this.cdSkill2 },
      { keyLabel: '3', name: '—', cooldownMs: 0 },
      { keyLabel: '4', name: '—', cooldownMs: 0 },
    ])
    this.skillBar.setCooldown(0, this.cdSkill1)
      this.skillBar.setCooldown(1, this.cdSkill2)

    // entities store
    this.bullets = []

    // panel
    this.makePanel()

    // label
    this.add.text(12,12,'TEST AREA v0.3T3b — Spawn enemies and test targeting/skills',{color:'#9fb3ff',fontFamily:'monospace',fontSize:'12px'}).setScrollFactor(0)
  }

  // ===== Arena =====
  buildArena() {
    // guard against zero initial layout
    if (this.scale.width < 10 || this.scale.height < 10) {
      this.time.delayedCall(50, () => this.buildArena())
      return
    }
    const w = this.scale.width, h = this.scale.height
    this.add.rectangle(w/2, h/2, w, h, 0x0f141e).setDepth(-20)
    this.arena = this.add.rectangle(w/2, h/2, w-80, h-80, 0x151c2a).setDepth(-10).setStrokeStyle(2, 0x2b3550)

    this.walls = []
    const specs = [
      { x:w*0.35, y:h*0.40, w:140, h:22 },
      { x:w*0.65, y:h*0.55, w:160, h:22 },
    ]
    for (const s of specs) {
      const r = this.add.rectangle(s.x, s.y, s.w, s.h, 0x1a2336).setDepth(-8).setStrokeStyle(2, 0x32405f)
      this.walls.push(r)
    }

    this.testMarker = this.add.circle(w*0.75, h*0.35, 6, 0xffe08a).setDepth(-5)
    this.add.text(this.testMarker.x + 10, this.testMarker.y - 6, 'Spawn point', { color:'#c9d8ff', fontFamily:'monospace', fontSize:'11px' })
  }

  // ===== Panel =====
  makePanel() {
    const panel = document.createElement('div')
    Object.assign(panel.style, {
      position:'fixed', right:'16px', top:'16px', display:'flex', flexDirection:'column',
      gap:'8px', padding:'10px', background:'rgba(15,20,30,0.85)', border:'1px solid rgba(255,255,255,0.1)',
      borderRadius:'8px', color:'#eaeefb', zIndex:10000, fontFamily:'ui-sans-serif,system-ui', fontSize:'13px'
    } as CSSStyleDeclaration)

    const title = document.createElement('div'); title.textContent = 'Test Controls'; title.style.opacity = '0.9'
    panel.appendChild(title)

    const mkBtn = (label: string, onclick: ()=>void) => {
      const b = document.createElement('button')
      b.textContent = label
      Object.assign(b.style, {
        padding:'8px 10px', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.15)',
        background:'rgba(255,255,255,0.08)', color:'#eaeefb', cursor:'pointer'
      } as CSSStyleDeclaration)
      b.onclick = onclick
      panel.appendChild(b)
      return b
    }

    mkBtn('Spawn Enemy', () => this.spawnEnemyAtMarker())
      mkBtn('Spawn 5 Enemies', () => { for (let i=0;i<5;i++){ this.spawnEnemyAtMarker() } })
    mkBtn('Toggle AI (pursuit)', () => { this.aiEnabled = !this.aiEnabled })
    mkBtn('Clear Enemies', () => this.clearEnemies())
    mkBtn('Reset Player', () => this.resetPlayer())
    const invBtn = mkBtn('Invincible: Off', () => { this.invincible = !this.invincible; invBtn.textContent = `Invincible: ${this.invincible?'On':'Off'}` })
    const slowBtn = mkBtn('Slow-mo: Off', () => { this.slowmo = !this.slowmo; this.time.timeScale = this.slowmo?0.4:1; slowBtn.textContent = `Slow-mo: ${this.slowmo?'On':'Off'}` })

    document.body.appendChild(panel)
  }

  resetPlayer() {
    this.me.setPosition(this.scale.width*0.5, this.scale.height*0.5)
    this.hp = this.maxHp
    this.targetPos = null
  }

  clearEnemies() {
    for (const e of this.enemies) { e.node.destroy(); e.hpBg.destroy(); e.hpFg.destroy() }; e.hpBg.destroy(); e.hpFg.destroy()
    this.enemies = []
    this.setLockedEnemy(null)
  }

  // ===== Targeting =====
  pickEnemyAt(x:number, y:number, radius:number): Enemy | null {
    for (const e of this.enemies) {
      if (Phaser.Math.Distance.Between(x,y,e.node.x,e.node.y) <= radius) return e
    }
    return null
  }

  cycleTarget() {
    if (this.enemies.length === 0) { this.setLockedEnemy(null); return }
    if (!this.lockedEnemy) { this.setLockedEnemy(this.enemies[0]); return }
    const idx = this.enemies.findIndex(e => e === this.lockedEnemy)
    const next = this.enemies[(idx + 1) % this.enemies.length]
    this.setLockedEnemy(next)
  }

  setLockedEnemy(e: Enemy | null) {
    this.lockedEnemy = e
    if (e) {
      this.lockRing.setVisible(true)
      this.lockRing.setPosition(e.node.x, e.node.y)
      this.lockHpBg.setVisible(true)
      this.lockHpFg.setVisible(true)
      this.updateLockHp()
    } else {
      this.lockRing.setVisible(false)
      this.lockHpBg.setVisible(false)
      this.lockHpFg.setVisible(false)
    }
  }

  updateLockHp() {
    if (!this.lockedEnemy) return
    const e = this.lockedEnemy
    const pct = Math.max(0, Math.min(1, e.hp / e.maxHp))
    const w = 26 * pct
    this.lockHpBg.setPosition(e.node.x, e.node.y - 18)
    this.lockHpFg.setPosition(e.node.x - (26 - w)/2, e.node.y - 18)
    this.lockHpFg.width = w
  }

  // ===== Net/LLM stubs =====
  async askNpc(text: string): Promise<string> {
    try {
      const res = await fetch('http://localhost:8080/llm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are the village guide. Be concise.' },
            { role: 'user', content: text }
          ]
        })
      })
      const data = await res.json()
      return data?.text ?? '(no text)'
    } catch { return '(offline) The guide nods silently.' }
  }

  connectWS() {
    const url = `ws://localhost:8080`
    this.ws = new WebSocket(url)
    this.ws.onopen = () => { this.reconnectAttempts = 0 }
    this.ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.t === 'hello') { this.id = m.id }
    }
    this.ws.onclose = () => this.scheduleReconnect()
    this.ws.onerror  = () => this.scheduleReconnect()
  }
  scheduleReconnect() {
    if (this.reconnectAttempts > 6) return
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 8000)
    this.time.delayedCall(delay, () => { this.reconnectAttempts++; this.connectWS() })
  }

  // ===== Combat =====
  spawnEnemyAtMarker() {
    const eNode = this.add.circle(this.testMarker.x, this.testMarker.y, 10, 0xff6b6b).setDepth(4)
    const hpBg = this.add.rectangle(this.testMarker.x, this.testMarker.y - 18, 26, 4, 0x000000, 0.55).setDepth(8)
      const hpFg = this.add.rectangle(this.testMarker.x, this.testMarker.y - 18, 26, 4, 0xff7f7f, 0.95).setDepth(9)
      const enemy: Enemy = { id: this.nextEnemyId++, node: eNode, hp: 40, maxHp: 40, speed: 70, hpBg, hpFg }
    this.enemies.push(enemy)
    this.tweens.add({ targets: eNode, scale:{from:0.6,to:1}, duration:180, ease:'Sine.easeOut' })
    if (!this.lockedEnemy) this.setLockedEnemy(enemy)
      this.updateEnemyHp(enemy)
      console.log('Spawned enemy', enemy.id)
  }

  shootToward(tx:number, ty:number) {
    const b = this.add.circle(this.me.x, this.me.y, 4, 0xd6e3ff).setDepth(6)
    const dx = tx - this.me.x, dy = ty - this.me.y
    const dist = Math.hypot(dx, dy) || 1
    const speed = 460
    b.setData('vx', (dx/dist)*speed)
    b.setData('vy', (dy/dist)*speed)
    b.setData('life', 900)
    this.bullets.push(b)
  }

  castMagicMissile() {
    // cooldown gate
    if (!this.skillBar.isReady(0)) { this.skillBar.flash(0); return }

    if (this.lockedEnemy) {
      const t = this.lockedEnemy.node
      const b = this.add.circle(this.me.x, this.me.y, 5, 0xc9d8ff).setDepth(7)
      b.setData('life', 1400)
      b.setData('speed', 380)
      b.setData('turn', 0.12)
      const dx0 = t.x - this.me.x, dy0 = t.y - this.me.y
      const d0 = Math.hypot(dx0, dy0) || 1
      b.setData('vx', (dx0/d0) * 380)
      b.setData('vy', (dy0/d0) * 380)
      this.bullets.push(b)
      this.skillBar.trigger(0)
      return
    }

    // No lock: directional missile based on movement, fallback to cursor
    let dir = this.lastMoveDir.clone()
    if (dir.lengthSq() < 0.0001) {
      const p = this.input.activePointer
      const dx = p.worldX - this.me.x, dy = p.worldY - this.me.y
      const d = Math.hypot(dx, dy) || 1
      dir.set(dx/d, dy/d)
    }
    const speed = 480
    const b = this.add.circle(this.me.x, this.me.y, 5, 0xc9d8ff).setDepth(7)
    b.setData('life', 900)
    b.setData('vx', dir.x * speed)
    b.setData('vy', dir.y * speed)
    this.bullets.push(b)
    this.skillBar.trigger(0)
  }

  castArcaneNova() {
  // cooldown check on slot 1 (index 1 because slot 0 is Missile)
  if (!this.skillBar.isReady(1)) { this.skillBar.flash(1); return }
  // Setup telegraph
  const radius = 80
  this.novaTelegraph!.setVisible(true).setPosition(this.me.x, this.me.y).setScale(0.2).setAlpha(0.18).setFillStyle(0x88e3ff, 0.12)
  this.tweens.add({ targets: this.novaTelegraph, scale: { from: 0.2, to: radius/8 }, alpha: { from: 0.18, to: 0.28 }, duration: 300, ease: 'Sine.easeOut' })
  // Detonate after wind-up
  this.time.delayedCall(300, () => {
    if (!this.novaTelegraph) return
    // Flash
    this.novaTelegraph.setPosition(this.me.x, this.me.y).setScale(radius/6).setAlpha(0.5)
    this.tweens.add({ targets: this.novaTelegraph, alpha: { from: 0.5, to: 0 }, scale: { from: radius/6, to: radius/4 }, duration: 180, onComplete: () => this.novaTelegraph!.setVisible(false) })
    // Damage + knockback
    for (const e of [...this.enemies]) {
      const d = Phaser.Math.Distance.Between(this.me.x, this.me.y, e.node.x, e.node.y)
      if (d <= radius) {
        const dmg = Phaser.Math.Between(10, 16); console.log('Nova hit enemy', e.id, 'for', dmg)
        e.hp -= dmg; this.damageNumber(e.node.x, e.node.y, dmg, '#f7d794'); this.hitFlash(e.node); this.updateEnemyHp(e)
        // knockback
        const k = 110
        const dx = e.node.x - this.me.x, dy = e.node.y - this.me.y
        const dn = Math.hypot(dx,dy) || 1
        const nx = dx/dn, ny = dy/dn
        this.tweens.add({ targets: e.node, x: e.node.x + nx * 24, y: e.node.y + ny * 24, duration: 120, ease: 'Sine.easeOut' })
        if (e === this.lockedEnemy) this.updateLockHp()
        if (e.hp <= 0) {
          this.dropLoot(e.node.x, e.node.y)
          e.node.destroy(); e.hpBg.destroy(); e.hpFg.destroy()
          const idx = this.enemies.indexOf(e); if (idx >= 0) this.enemies.splice(idx,1)
          if (this.lockedEnemy === e) this.setLockedEnemy(null)
        }
      }
    }
    // trigger cooldown
    this.skillBar.trigger(1)
  })
}


    dropLoot(x:number, y:number) {
    const rect = this.add.rectangle(x, y, 8, 8, 0x77ff99).setDepth(3)
    const loot: Loot = { id: this.nextLootId++, node: rect, value: Phaser.Math.Between(1,3) }
    this.loots.set(loot.id, loot)
    this.tweens.add({ targets: rect, y: y-8, duration: 180, ease: 'Sine.easeOut', yoyo: true })
  }

  damageNumber(x:number, y:number, dmg:number, color='#ffd480') {
    const t = this.add.text(x, y, String(dmg), { color, fontFamily:'monospace', fontSize:'12px' }).setDepth(10)
    this.tweens.add({ targets: t, y: y-14, alpha:{ from:1, to:0 }, duration: 500, onComplete: () => t.destroy() })
  }

  hitFlash(target: Phaser.GameObjects.Arc) {
    const orig = target.fillColor; target.setFillStyle(0xffffff); this.time.delayedCall(80, () => target.setFillStyle(orig))
  }

  // ===== Update =====
  update(_time:number, delta:number) {
    const dt = delta/1000, speed = 180

    // Chat toggle
    if (Phaser.Input.Keyboard.JustDown(this.toggleChatKey)) {
      if (this.chat.isOpen()) this.chat.hide(); else this.chat.show()
    }
    if (this.chat?.isOpen()) return

    // fire inputs
    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
      const p = this.input.activePointer
      this.shootToward(p.worldX, p.worldY)
    }
    if (Phaser.Input.Keyboard.JustDown(this.skill1) || Phaser.Input.Keyboard.JustDown(this.skillQ)) {
      this.castMagicMissile()
    }
    if (Phaser.Input.Keyboard.JustDown(this.cycleKey)) this.cycleTarget()

    if (Phaser.Input.Keyboard.JustDown(this.skill2) || Phaser.Input.Keyboard.JustDown(this.skillE)) { this.castArcaneNova() }

      // movement
    const left = !!(this.cursors.left?.isDown || this.wasd.left?.isDown)
    const right = !!(this.cursors.right?.isDown || this.wasd.right?.isDown)
    const up = !!(this.cursors.up?.isDown || this.wasd.up?.isDown)
    const down = !!(this.cursors.down?.isDown || this.wasd.down?.isDown)
    if ((left || right || up || down) && this.targetPos) this.targetPos = null

    let vx = 0, vy = 0
    if (left) vx -= 1; if (right) vx += 1; if (up) vy -= 1; if (down) vy += 1
    if (vx || vy) {
      const len = Math.hypot(vx, vy) || 1
      this.me.x += (vx/len) * speed * dt
      this.me.y += (vy/len) * speed * dt
      this.lastMoveDir.set(vx, vy).normalize()
    } else if (this.targetPos) {
      const dxm = this.targetPos.x - this.me.x, dym = this.targetPos.y - this.me.y
      const dm = Math.hypot(dxm, dym) || 1
      if (dm <= 4) this.targetPos = null
      else {
        this.me.x += (dxm/dm) * speed * dt
        this.me.y += (dym/dm) * speed * dt
        this.lastMoveDir.set(dxm/dm, dym/dm)
      }
    }

    // bounds
    const halfW = (this.arena.width as number)/2 - 12, halfH = (this.arena.height as number)/2 - 12
    this.me.x = Phaser.Math.Clamp(this.me.x, this.arena.x - halfW, this.arena.x + halfW)
    this.me.y = Phaser.Math.Clamp(this.me.y, this.arena.y - halfH, this.arena.y + halfH)

    // bullets
    for (let i=this.bullets.length-1;i>=0;i--) {
      const b = this.bullets[i]
      let life = (b.getData('life') as number) - delta
      b.setData('life', life)
      if (life <= 0) { b.destroy(); this.bullets.splice(i,1); continue }

      const speedB = b.getData('speed') as number | undefined
      const turn = b.getData('turn') as number | undefined
      if (speedB && turn !== undefined && this.lockedEnemy) {
        const target = this.lockedEnemy.node
        const dx = target.x - b.x, dy = target.y - b.y
        const dist = Math.hypot(dx, dy) || 1
        let vx = b.getData('vx') || 0, vy = b.getData('vy') || 0
        const desiredX = (dx/dist) * speedB
        const desiredY = (dy/dist) * speedB
        vx = vx + (desiredX - vx) * turn
        vy = vy + (desiredY - vy) * turn
        b.setData('vx', vx); b.setData('vy', vy)
        b.x += vx * dt; b.y += vy * dt
      } else {
        b.x += (b.getData('vx') || 0) * dt
        b.y += (b.getData('vy') || 0) * dt
      }

      // bounds for bullets
      const outX = Math.abs(b.x - this.arena.x) > halfW
      const outY = Math.abs(b.y - this.arena.y) > halfH
      if (outX || outY) { b.destroy(); this.bullets.splice(i,1); continue }

      // enemy hits
      for (const e of [...this.enemies]) {
        if (Phaser.Math.Distance.Between(b.x, b.y, e.node.x, e.node.y) < 12) {
          this.hitFlash(e.node)
          b.destroy(); this.bullets.splice(i,1)
          const dmg = Phaser.Math.Between(8, 14); console.log('Missile hit enemy', e.id, 'for', dmg)
          e.hp -= dmg; this.damageNumber(e.node.x, e.node.y, dmg); this.updateEnemyHp(e)
          if (e === this.lockedEnemy) this.updateLockHp()
          if (e.hp <= 0) {
            this.dropLoot(e.node.x, e.node.y)
            e.node.destroy(); e.hpBg.destroy(); e.hpFg.destroy()
            const idx = this.enemies.indexOf(e); if (idx >= 0) this.enemies.splice(idx,1)
            if (this.lockedEnemy === e) this.setLockedEnemy(null)
          }
          break
        }
      }
    }

    // sync enemy HP bars
      for (const e of this.enemies) this.updateEnemyHp(e)

      // enemy AI
    if (this.aiEnabled) {
      for (const e of this.enemies) {
        const dx = this.me.x - e.node.x, dy = this.me.y - e.node.y
        const dist = Math.hypot(dx, dy) || 1
        const step = Math.min(e.speed * dt, dist)
        e.node.x += (dx/dist) * step; e.node.y += (dy/dist) * step
      }
    }

    // lock visuals
    if (this.lockedEnemy) {
      this.lockRing.setPosition(this.lockedEnemy.node.x, this.lockedEnemy.node.y)
      this.updateLockHp()
    }

    // loot pickup
    for (const [id, l] of Array.from(this.loots.entries())) {
      if (Phaser.Math.Distance.Between(this.me.x, this.me.y, l.node.x, l.node.y) < 16) {
        this.score += l.value
        this.tweens.add({ targets: l.node, y:l.node.y-10, alpha:{from:1,to:0}, duration:200, onComplete:()=> l.node.destroy() })
        this.loots.delete(id)
      }
    }

    // HUD
    this.drawHud()
  }

  drawHud() {
    this.children.each((obj:any)=>{ if (obj.getData && obj.getData('hud')) obj.destroy() })
    const g = this.add.graphics(); g.setData('hud', true)
    g.fillStyle(0x000000, 0.35); g.fillRoundedRect(10,10,360,44,6)
    const hpPct = Math.max(0, Math.min(1, this.hp/this.maxHp))
    g.fillStyle(0x2e7dd1, 0.9); g.fillRoundedRect(14,14, 172*hpPct, 20, 4)
    const t = this.add.text(16,15,`HP ${this.hp}/${this.maxHp}  •  Score ${this.score}`, { color:'#eaeefb', fontSize:'12px', fontFamily:'monospace' })
    t.setData('hud', true)
    const lock = this.lockedEnemy ? 'LOCKED' : '—'
    const hint = this.add.text(16,32,`Target: ${lock}  |  1/Q Missile (CD)  |  Tab cycle  |  Left-click enemy = cast, else move`, { color:'#9fb3ff', fontSize:'11px', fontFamily:'monospace' })
    hint.setData('hud', true)
  }
}
