import { Scene } from 'phaser'

import { scenes } from '../const/scenes'
import { addScore } from '../utils'

const SLOT_SPACING = 64
const SLOT_W = 48
const SLOT_H = 56

export class EnterInitials extends Scene {
    initials = ''
    letterTexts = []
    slotGraphics = []
    submitTimer = null
    hiddenInput = null

    constructor() {
        super({ key: scenes.enterInitials })
    }

    init(data) {
        this.score = data.score
        this.initials = ''
        this.submitTimer = null
    }

    create() {
        const { width, height } = this.cameras.main
        const cx = width / 2
        const cy = height / 2

        // Full dark background
        const bg = this.add.graphics()
        bg.fillStyle(0x000011, 1)
        bg.fillRect(0, 0, width, height)

        // Retro panel
        const pw = 480
        const ph = 300
        const left = cx - pw / 2
        const top = cy - ph / 2
        const g = this.add.graphics()
        g.fillStyle(0x000033, 0.97)
        g.fillRect(left, top, pw, ph)
        g.lineStyle(4, 0xffffff, 1)
        g.strokeRect(left, top, pw, ph)
        g.lineStyle(2, 0x4444aa, 1)
        g.strokeRect(left + 8, top + 8, pw - 16, ph - 16)

        this.add
            .text(cx, top + 28, 'NEW HIGH SCORE!', {
                font: 'bold 18px monospace',
                fill: '#ffff00'
            })
            .setOrigin(0.5, 0)

        this.add
            .text(cx, top + 60, `Score: ${this.score}`, {
                font: '16px monospace',
                fill: '#ffffff'
            })
            .setOrigin(0.5, 0)

        this.add
            .text(cx, top + 90, 'ENTER YOUR INITIALS', {
                font: '13px monospace',
                fill: '#aaaaaa'
            })
            .setOrigin(0.5, 0)

        // Letter slots
        this.letterTexts = []
        this.slotGraphics = []
        const slotsY = cy + 20

        for (let i = 0; i < 3; i++) {
            const x = cx + (i - 1) * SLOT_SPACING
            const slotG = this.add.graphics()
            this.slotGraphics.push(slotG)
            this.drawSlot(slotG, x, slotsY, false)

            const t = this.add
                .text(x, slotsY + SLOT_H / 2, '_', {
                    font: 'bold 36px monospace',
                    fill: '#ffff00'
                })
                .setOrigin(0.5)
            this.letterTexts.push(t)
        }

        this.add
            .text(cx, top + ph - 22, 'A-Z to type  •  BACKSPACE to delete  •  ENTER to confirm', {
                font: '11px monospace',
                fill: '#555555'
            })
            .setOrigin(0.5, 1)

        this.updateDisplay()

        this.input.keyboard.on('keydown', this.handleKey, this)

        // Hidden input to trigger the on-screen keyboard on mobile
        this.hiddenInput = document.createElement('input')
        this.hiddenInput.setAttribute('type', 'text')
        this.hiddenInput.setAttribute('autocomplete', 'off')
        this.hiddenInput.setAttribute('autocorrect', 'off')
        this.hiddenInput.setAttribute('autocapitalize', 'characters')
        this.hiddenInput.style.cssText =
            'position:fixed;opacity:0;top:0;left:0;width:1px;height:1px;border:none;outline:none;'
        document.body.appendChild(this.hiddenInput)

        // Small delay before focus so the scene is fully ready
        this.time.delayedCall(100, () => {
            if (this.hiddenInput) this.hiddenInput.focus()
        })
    }

    drawSlot(g, x, y, active) {
        g.clear()
        g.lineStyle(2, active ? 0xffffff : 0x4444aa, 1)
        g.strokeRect(x - SLOT_W / 2, y, SLOT_W, SLOT_H)
    }

    handleKey(event) {
        // Cancel pending auto-submit if user is still typing
        if (this.submitTimer) {
            this.submitTimer.remove()
            this.submitTimer = null
        }

        const key = event.key

        if (key === 'Backspace') {
            this.initials = this.initials.slice(0, -1)
            this.updateDisplay()
        } else if (key === 'Enter' && this.initials.length > 0) {
            this.submit()
        } else if (key.length === 1 && /[a-zA-Z]/.test(key) && this.initials.length < 3) {
            this.initials += key.toUpperCase()
            this.updateDisplay()
            if (this.initials.length === 3) {
                // Auto-submit after a short pause so the player can see the last letter
                this.submitTimer = this.time.delayedCall(600, this.submit, [], this)
            }
        }
    }

    updateDisplay() {
        const activeIndex = Math.min(this.initials.length, 2)
        const { width, height } = this.cameras.main
        const cx = width / 2
        const slotsY = height / 2 + 20

        for (let i = 0; i < 3; i++) {
            const x = cx + (i - 1) * SLOT_SPACING
            const isActive = i === activeIndex && this.initials.length < 3
            this.drawSlot(this.slotGraphics[i], x, slotsY, isActive)
            this.letterTexts[i].setText(this.initials[i] || '_')
        }
    }

    submit() {
        this.input.keyboard.off('keydown', this.handleKey, this)
        const initials = this.initials.padEnd(3, ' ')
        addScore(initials, this.score)
        this.cleanup()
        this.scene.start(scenes.highScores, { highlightScore: this.score })
    }

    shutdown() {
        this.cleanup()
    }

    cleanup() {
        if (this.hiddenInput) {
            document.body.removeChild(this.hiddenInput)
            this.hiddenInput = null
        }
    }
}
