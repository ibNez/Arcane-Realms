import Phaser from 'phaser'
import { ChatPanel } from '../ui/ChatPanel'
import { registerHeroAnimations } from '../animations/heroAnimations'
import { playerProfile, loadPlayerProfile } from '../playerProfile'

type Enemy = { id:number; node:Phaser.GameObjects.Arc; hp:number; maxHp:number; speed:number }
type Loot = { id:number; node:Phaser.GameObjects.Rectangle; value:number }

export class PlayScene extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  wasd!: { up:Phaser.Input.Keyboard.Key; down:Phaser.Input.Keyboard.Key; left:Phaser.Input.Keyboard.Key; right:Phaser.Input.Keyboard.Key }
  fireKey!: Phaser.Input.Keyboard.Key
  toggleChatKey!: Phaser.Input.Keyboard.Key
  ws!: WebSocket
  id: string | null = null

  me!: Phaser.GameObjects.Arc
  hp = 100; maxHp = 100; score = 0

  others: Map<string, Phaser.GameObjects.Arc> = new Map()

  target: Phaser.Math.Vector2 | null = null
  reconnectAttempts = 0
  chat!: ChatPanel

  // world
  arena!: Phaser.GameObjects.Rectangle
  walls!: Phaser.GameObjects.Rectangle[]
  spawnGates!: Phaser.GameObjects.Rectangle[]
  exitPortal: Phaser.GameObjects.Arc | null = null
  shardGoal = 30
  runWon = false

  // combat
  bullets!: Phaser.GameObjects.Arc[]
  enemies: Map<number, Enemy> = new Map()
  loots: Map<number, Loot> = new Map()
  nextEnemyId = 1
  nextLootId = 1
  fireCooldown = 0

  create() {
    // input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys({ up:'W', left:'A', down:'S', right:'D' }) as any
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.toggleChatKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C)

    // world
    this.buildArena()

    // animations
    registerHeroAnimations(this)

    // player
    this.me = this.add.circle(this.scale.width*0.5, this.scale.height*0.5, 10, 0x77c0ff).setDepth(5)

    // pointer
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.chat?.isOpen()) return
      if (p.leftButtonDown()) {
        this.target = new Phaser.Math.Vector2(p.worldX, p.worldY)
      }
      if (p.rightButtonDown()) {
        this.shootToward(p.worldX, p.worldY)
      }
    })
    this.input.mouse?.disableContextMenu()

    // bullets array
    this.bullets = []

    // chat
    this.chat = new ChatPanel()
    this.chat.setOnSend(async (text) => {
      this.chat.addUser(text)
      const reply = await this.askNpc(text)
      this.chat.addNpc(reply || '(no reply)')
    })

    loadPlayerProfile().then(() => {
      this.chat.setPortrait(playerProfile.portraitUrl)
    })

    // net
    this.connectWS()

    // spawner with telegraphing
    this.time.addEvent({ delay: 1700, loop: true, callback: () => this.spawnWaveTelegraphed() })

    // UI label
    this.add.text(12, 12, 'ARPG v0.3R2 — Collect shards to open the exit', { color:'#9fb3ff', fontFamily:'monospace', fontSize:'12px' }).setScrollFactor(0)
  }

  // ===== Arena visuals =====
  buildArena() {
    const w = this.scale.width, h = this.scale.height
    this.add.rectangle(w/2, h/2, w, h, 0x0f141e).setDepth(-20)
    this.arena = this.add.rectangle(w/2, h/2, w-80, h-80, 0x151c2a).setDepth(-10).setStrokeStyle(2, 0x2b3550)

    this.walls = []
    const specs = [
      { x:w*0.28, y:h*0.36, w:140, h:20 },
      { x:w*0.68, y:h*0.44, w:170, h:20 },
      { x:w*0.44, y:h*0.70, w:210, h:20 },
    ]
    for (const s of specs) {
      const r = this.add.rectangle(s.x, s.y, s.w, s.h, 0x1a2336).setDepth(-8).setStrokeStyle(2, 0x32405f)
      this.walls.push(r)
    }

    const m = 40
    this.spawnGates = [
      this.add.rectangle(m+10, h/2, 10, 72, 0x6a2e2e).setDepth(-6),
      this.add.rectangle(w-m-10, h/2, 10, 72, 0x2e6a3a).setDepth(-6),
      this.add.rectangle(w/2, m+10, 72, 10, 0x6a5b2e).setDepth(-6),
      this.add.rectangle(w/2, h-m-10, 72, 10, 0x2e596a).setDepth(-6),
    ]
  }

  // ===== Net basics =====
  connectWS() {
    const url = `ws://localhost:8080`
    this.ws = new WebSocket(url)
    this.ws.onopen = () => { this.reconnectAttempts = 0 }
    this.ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.t === 'hello') { this.id = m.id }
      if (m.t === 'join') { this.spawnOther(m.id, m.x, m.y) }
      if (m.t === 'leave') { this.removeOther(m.id) }
      if (m.t === 'pos') { this.updateOther(m.id, m.x, m.y) }
    }
    this.ws.onclose = () => this.scheduleReconnect()
    this.ws.onerror = () => this.scheduleReconnect()
  }
  scheduleReconnect() {
    if (this.reconnectAttempts > 6) return
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 8000)
    this.time.delayedCall(delay, () => { this.reconnectAttempts++; this.connectWS() })
  }
  spawnOther(id: string, x: number, y: number) {
    if (this.others.has(id)) return
    const dot = this.add.circle(x, y, 10, 0x55e58a)
    this.others.set(id, dot)
  }
  removeOther(id: string) { const dot = this.others.get(id); if (dot) dot.destroy(); this.others.delete(id) }
  updateOther(id: string, x: number, y: number) { const dot = this.others.get(id); if (dot) dot.setPosition(x, y) }

  // ===== LLM chat =====
  async askNpc(text: string): Promise<string> {
    try {
      const res = await fetch('http://localhost:8080/llm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are the village guide. Be concise. Offer a hint or a quest step toward opening the exit portal.' },
            { role: 'user', content: text }
          ]
        })
      })
      const data = await res.json()
      return data?.text ?? '(no text)'
    } catch { return '(offline) The guide nods silently.' }
  }

  // ===== Spawns with telegraphing =====
  spawnWaveTelegraphed() {
    const gate = Phaser.Utils.Array.GetRandom(this.spawnGates)
    const gx = gate.x, gy = gate.y

    const warn = this.add.circle(gx, gy, 6, 0xffe08a, 0.6).setDepth(-4)
    this.tweens.add({ targets: warn, scale: { from: 1, to: 2.2 }, alpha: { from: 0.8, to: 0 }, duration: 450, onComplete: () => warn.destroy() })

    this.time.delayedCall(450, () => {
      for (let i = 0; i < Phaser.Math.Between(2,3); i++) {
        this.addEnemy(gx + Phaser.Math.Between(-16,16), gy + Phaser.Math.Between(-16,16))
      }
    })
  }

  addEnemy(x:number, y:number) {
    const eNode = this.add.circle(x, y, 10, 0xff6b6b).setDepth(4)
    const enemy: Enemy = { id: this.nextEnemyId++, node: eNode, hp: 30, maxHp: 30, speed: 80 }
    this.enemies.set(enemy.id, enemy)
    this.tweens.add({ targets: eNode, scale: { from: 0.6, to: 1 }, duration: 180, ease: 'Sine.easeOut' })
    return enemy
  }

  // ===== Combat =====
  shootToward(tx:number, ty:number) {
    const now = this.time.now
    if (now < this.fireCooldown) return
    this.fireCooldown = now + 180

    const b = this.add.circle(this.me.x, this.me.y, 4, 0xd6e3ff).setDepth(6)
    const dx = tx - this.me.x, dy = ty - this.me.y
    const dist = Math.hypot(dx, dy) || 1
    const speed = 460
    b.setData('vx', (dx/dist)*speed)
    b.setData('vy', (dy/dist)*speed)
    b.setData('life', 900)
    this.bullets.push(b)
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

    // Chat toggle with JustDown
    if (Phaser.Input.Keyboard.JustDown(this.toggleChatKey)) {
      if (this.chat.isOpen()) this.chat.hide(); else this.chat.show()
    }

    if (this.chat?.isOpen()) return

    // Space to shoot at cursor
    if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
      const p = this.input.activePointer
      this.shootToward(p.worldX, p.worldY)
    }

    const left = !!(this.cursors.left?.isDown || this.wasd.left?.isDown)
    const right = !!(this.cursors.right?.isDown || this.wasd.right?.isDown)
    const up = !!(this.cursors.up?.isDown || this.wasd.up?.isDown)
    const down = !!(this.cursors.down?.isDown || this.wasd.down?.isDown)
    const usingKeys = left || right || up || down
    if (usingKeys && this.target) this.target = null

    // continuous pointer tracking while left button held
    const p = this.input.activePointer
    if (!usingKeys && p.isDown && p.leftButtonDown() && this.target) {
      this.target.set(p.worldX, p.worldY)
    }

    let vx = 0, vy = 0
    if (left) vx -= 1; if (right) vx += 1; if (up) vy -= 1; if (down) vy += 1
    if (vx || vy) {
      const len = Math.hypot(vx, vy) || 1
      this.me.x += (vx/len) * speed * dt
      this.me.y += (vy/len) * speed * dt
    } else if (this.target) {
      const dx = this.target.x - this.me.x, dy = this.target.y - this.me.y
      const dist = Math.hypot(dx, dy)
      if (dist <= 4) this.target = null
      else { this.me.x += (dx/dist) * speed * dt; this.me.y += (dy/dist) * speed * dt }
    }

    const halfW = (this.arena.width as number)/2 - 12, halfH = (this.arena.height as number)/2 - 12
    this.me.x = Phaser.Math.Clamp(this.me.x, this.arena.x - halfW, this.arena.x + halfW)
    this.me.y = Phaser.Math.Clamp(this.me.y, this.arena.y - halfH, this.arena.y + halfH)

    for (let i=this.bullets.length-1;i>=0;i--) {
      const b = this.bullets[i]
      const life = (b.getData('life') as number) - delta
      if (life <= 0) { b.destroy(); this.bullets.splice(i,1); continue }
      b.setData('life', life)
      b.x += (b.getData('vx') as number) * dt
      b.y += (b.getData('vy') as number) * dt
      const outX = Math.abs(b.x - this.arena.x) > halfW
      const outY = Math.abs(b.y - this.arena.y) > halfH
      if (outX || outY) { b.destroy(); this.bullets.splice(i,1); continue }
      for (const e of this.enemies.values()) {
        if (Phaser.Math.Distance.Between(b.x, b.y, e.node.x, e.node.y) < 12) {
          this.hitFlash(e.node); b.destroy(); this.bullets.splice(i,1)
          const dmg = Phaser.Math.Between(6, 12)
          e.hp -= dmg; this.damageNumber(e.node.x, e.node.y, dmg)
          if (e.hp <= 0) { this.dropLoot(e.node.x, e.node.y); this.enemies.delete(e.id); e.node.destroy() }
          break
        }
      }
    }

    for (const e of this.enemies.values()) {
      const dx = this.me.x - e.node.x, dy = this.me.y - e.node.y
      const dist = Math.hypot(dx, dy) || 1
      const step = Math.min(e.speed * dt, dist)
      e.node.x += (dx/dist) * step; e.node.y += (dy/dist) * step
      if (dist < 14) { this.hitFlash(this.me); const dmg = 5; this.hp = Math.max(0, this.hp - dmg); this.damageNumber(this.me.x, this.me.y, dmg, '#ff8080') }
    }

    for (const [id, l] of Array.from(this.loots.entries())) {
      if (Phaser.Math.Distance.Between(this.me.x, this.me.y, l.node.x, l.node.y) < 16) {
        self = this
        this.score += l.value
        this.tweens.add({ targets: l.node, y:l.node.y-10, alpha:{from:1,to:0}, duration:200, onComplete:()=> l.node.destroy() })
        this.loots.delete(id)
      }
    }

    if (!this.exitPortal && this.score >= this.shardGoal) {
      this.exitPortal = this.add.circle(this.arena.x, this.arena.y - (this.arena.height as number)/2 + 30, 12, 0x88e3ff).setDepth(2)
      this.tweens.add({ targets: this.exitPortal, scale:{from:0.8,to:1.2}, yoyo:true, repeat:-1, duration:600 })
    }
    if (this.exitPortal && Phaser.Math.Distance.Between(this.me.x, this.me.y, this.exitPortal.x, this.exitPortal.y) < 16 && !this.runWon) {
      this.runWon = true
      const banner = this.add.text(this.scale.width/2, this.scale.height/2, 'RUN COMPLETE', { color:'#c5f5ff', fontFamily:'monospace', fontSize:'20px' }).setOrigin(0.5).setDepth(20)
      this.tweens.add({ targets: banner, y: banner.y-12, duration: 600 })
    }

    this.drawHud()

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ t: 'move', x: this.me.x, y: this.me.y }))
    }
  }

  drawHud() {
    this.children.each((obj:any)=>{ if (obj.getData && obj.getData('hud')) obj.destroy() })
    const g = this.add.graphics(); g.setData('hud', true)
    g.fillStyle(0x000000, 0.35); g.fillRoundedRect(10,10,260,44,6)
    const hpPct = Math.max(0, Math.min(1, this.hp/this.maxHp))
    g.fillStyle(0x2e7dd1, 0.9); g.fillRoundedRect(14,14, 172*hpPct, 20, 4)
    const t = this.add.text(16,15,`HP ${this.hp}/${this.maxHp}  •  Shards ${this.score}/${this.shardGoal}`, { color:'#eaeefb', fontSize:'12px', fontFamily:'monospace' })
    t.setData('hud', true)
    const hint = this.add.text(16,32,`Goal: Collect shards. Exit opens when charged.`, { color:'#9fb3ff', fontSize:'11px', fontFamily:'monospace' })
    hint.setData('hud', true)
  }
}
