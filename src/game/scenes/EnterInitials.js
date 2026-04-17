import { Scene } from 'phaser'

import { scenes } from '../const/scenes'
import { addScore } from '../utils'

const SLOT_COUNT = 3
const SLOT_SPACING = 90
const LETTER_A = 65
const LETTER_Z = 90

export class EnterInitials extends Scene {
    initials = ['A', 'A', 'A']
    activeSlot = 0
    slotTexts = []
    slotOutlines = []

    constructor() {
        super({ key: scenes.enterInitials })
    }

    init(data) {
        this.score = data.score
        this.initials = ['A', 'A', 'A']
        this.activeSlot = 0
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
        const ph = 340
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
            .text(cx, top + 26, 'NEW HIGH SCORE!', {
                font: 'bold 18px monospace',
                fill: '#ffff00'
            })
            .setOrigin(0.5, 0)

        this.add
            .text(cx, top + 56, `Score: ${this.score}`, {
                font: '16px monospace',
                fill: '#ffffff'
            })
            .setOrigin(0.5, 0)

        this.add
            .text(cx, top + 84, 'ENTER YOUR INITIALS', {
                font: '13px monospace',
                fill: '#aaaaaa'
            })
            .setOrigin(0.5, 0)

        // Slot positions
        const slotY = cy + 10
        const arrowStyle = { font: 'bold 22px monospace', fill: '#ffffff' }
        const arrowActiveStyle = { font: 'bold 22px monospace', fill: '#ffff00' }

        this.slotTexts = []
        this.slotOutlines = []

        for (let i = 0; i < SLOT_COUNT; i++) {
            const x = cx + (i - 1) * SLOT_SPACING

            // Up arrow — large interactive zone
            const upZone = this.add
                .text(x, slotY - 52, '▲', arrowStyle)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setPadding(20)

            upZone.on('pointerover', () => upZone.setStyle(arrowActiveStyle))
            upZone.on('pointerout', () => upZone.setStyle(arrowStyle))
            upZone.on('pointerup', () => this.cycleLetter(i, 1))

            // Slot outline (redrawn on update)
            const outline = this.add.graphics()
            this.slotOutlines.push(outline)

            // Letter text
            const letterText = this.add
                .text(x, slotY, 'A', {
                    font: 'bold 40px monospace',
                    fill: '#ffff00'
                })
                .setOrigin(0.5)
            this.slotTexts.push(letterText)

            // Down arrow — large interactive zone
            const downZone = this.add
                .text(x, slotY + 54, '▼', arrowStyle)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setPadding(20)

            downZone.on('pointerover', () => downZone.setStyle(arrowActiveStyle))
            downZone.on('pointerout', () => downZone.setStyle(arrowStyle))
            downZone.on('pointerup', () => this.cycleLetter(i, -1))
        }

        // CONFIRM button
        const btnW = 160
        const btnH = 44
        const btnX = cx - btnW / 2
        const btnY = top + ph - 64

        const btnGraphic = this.add.graphics()
        btnGraphic.fillStyle(0x0000aa, 1)
        btnGraphic.fillRect(btnX, btnY, btnW, btnH)
        btnGraphic.lineStyle(2, 0xffffff, 1)
        btnGraphic.strokeRect(btnX, btnY, btnW, btnH)

        const btnText = this.add
            .text(cx, btnY + btnH / 2, 'CONFIRM', {
                font: 'bold 16px monospace',
                fill: '#ffff00'
            })
            .setOrigin(0.5)

        // Make the button interactive via a zone
        const btnZone = this.add
            .zone(cx, btnY + btnH / 2, btnW, btnH)
            .setInteractive({ useHandCursor: true })

        btnZone.on('pointerover', () => {
            btnGraphic.clear()
            btnGraphic.fillStyle(0x0000dd, 1)
            btnGraphic.fillRect(btnX, btnY, btnW, btnH)
            btnGraphic.lineStyle(2, 0xffffff, 1)
            btnGraphic.strokeRect(btnX, btnY, btnW, btnH)
        })
        btnZone.on('pointerout', () => {
            btnGraphic.clear()
            btnGraphic.fillStyle(0x0000aa, 1)
            btnGraphic.fillRect(btnX, btnY, btnW, btnH)
            btnGraphic.lineStyle(2, 0xffffff, 1)
            btnGraphic.strokeRect(btnX, btnY, btnW, btnH)
        })
        btnZone.on('pointerup', () => this.submit())

        this.add
            .text(
                cx,
                top + ph - 16,
                'Arrow keys to navigate  •  A-Z to type  •  ENTER to confirm',
                {
                    font: '10px monospace',
                    fill: '#444466'
                }
            )
            .setOrigin(0.5, 1)

        this.input.keyboard.on('keydown', this.handleKey, this)

        this.updateDisplay()
    }

    cycleLetter(slotIndex, direction) {
        const current = this.initials[slotIndex].charCodeAt(0)
        const next = ((current - LETTER_A + direction + 26) % 26) + LETTER_A
        this.initials[slotIndex] = String.fromCharCode(next)
        this.activeSlot = slotIndex
        this.updateDisplay()
    }

    handleKey(event) {
        switch (event.key) {
            case 'ArrowLeft':
                this.activeSlot = Math.max(0, this.activeSlot - 1)
                this.updateDisplay()
                break
            case 'ArrowRight':
                this.activeSlot = Math.min(SLOT_COUNT - 1, this.activeSlot + 1)
                this.updateDisplay()
                break
            case 'ArrowUp':
                this.cycleLetter(this.activeSlot, 1)
                break
            case 'ArrowDown':
                this.cycleLetter(this.activeSlot, -1)
                break
            case 'Enter':
            case ' ':
                this.submit()
                break
            default:
                if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
                    this.initials[this.activeSlot] = event.key.toUpperCase()
                    this.activeSlot = Math.min(SLOT_COUNT - 1, this.activeSlot + 1)
                    this.updateDisplay()
                }
        }
    }

    updateDisplay() {
        for (let i = 0; i < SLOT_COUNT; i++) {
            const { width, height } = this.cameras.main
            const cx = width / 2
            const slotY = height / 2 + 10
            const x = cx + (i - 1) * SLOT_SPACING
            const isActive = i === this.activeSlot

            // Redraw slot outline
            this.slotOutlines[i].clear()
            this.slotOutlines[i].lineStyle(2, isActive ? 0xffffff : 0x4444aa, 1)
            this.slotOutlines[i].strokeRect(x - 26, slotY - 28, 52, 56)
            if (isActive) {
                this.slotOutlines[i].fillStyle(0x0000aa, 0.25)
                this.slotOutlines[i].fillRect(x - 26, slotY - 28, 52, 56)
            }

            this.slotTexts[i].setText(this.initials[i])
        }
    }

    submit() {
        this.input.keyboard.off('keydown', this.handleKey, this)
        addScore(this.initials.join(''), this.score)
        this.scene.start(scenes.highScores, { highlightScore: this.score })
    }

    shutdown() {
        // No DOM cleanup needed — this scene is fully Phaser-native
    }
}
