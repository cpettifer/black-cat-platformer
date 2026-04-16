import { Scene } from 'phaser'

import { scenes } from '../const/scenes'
import { getScores } from '../utils'

export class HighScores extends Scene {
    constructor() {
        super({ key: scenes.highScores })
    }

    init(data) {
        this.highlightScore = data?.highlightScore ?? null
    }

    create() {
        const { width, height } = this.cameras.main
        const cx = width / 2
        const cy = height / 2
        const scores = getScores()

        // Full dark background
        const bg = this.add.graphics()
        bg.fillStyle(0x000011, 1)
        bg.fillRect(0, 0, width, height)

        // Retro panel
        const pw = 500
        const ph = 440
        const left = cx - pw / 2
        const top = cy - ph / 2
        const g = this.add.graphics()
        g.fillStyle(0x000033, 0.97)
        g.fillRect(left, top, pw, ph)
        g.lineStyle(4, 0xffffff, 1)
        g.strokeRect(left, top, pw, ph)
        g.lineStyle(2, 0x4444aa, 1)
        g.strokeRect(left + 8, top + 8, pw - 16, ph - 16)

        // Title
        this.add
            .text(cx, top + 24, 'HIGH SCORES', { font: 'bold 20px monospace', fill: '#ffff00' })
            .setOrigin(0.5, 0)

        // Column headers
        const headY = top + 66
        this.add
            .text(left + 28, headY, 'RANK', { font: 'bold 13px monospace', fill: '#4444cc' })
            .setOrigin(0, 0)
        this.add
            .text(left + 110, headY, 'NAME', { font: 'bold 13px monospace', fill: '#4444cc' })
            .setOrigin(0, 0)
        this.add
            .text(left + pw - 28, headY, 'SCORE', { font: 'bold 13px monospace', fill: '#4444cc' })
            .setOrigin(1, 0)

        // Divider
        g.lineStyle(1, 0x4444aa, 0.6)
        g.lineBetween(left + 20, headY + 20, left + pw - 20, headY + 20)

        if (scores.length === 0) {
            this.add
                .text(cx, cy, 'No scores yet — play to set one!', {
                    font: '14px monospace',
                    fill: '#888888'
                })
                .setOrigin(0.5)
        } else {
            scores.forEach((entry, i) => {
                const rowY = headY + 30 + i * 30
                const isHighlight = entry.score === this.highlightScore
                const isFirst = i === 0
                const color = isHighlight ? '#ffff00' : isFirst ? '#ffffff' : '#aaaaaa'
                const font = isHighlight ? 'bold 14px monospace' : '14px monospace'

                // Highlight bar for newly entered score
                if (isHighlight) {
                    const barG = this.add.graphics()
                    barG.fillStyle(0x0000aa, 0.3)
                    barG.fillRect(left + 20, rowY - 2, pw - 40, 24)
                }

                const rank = i + 1
                const medal =
                    rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`
                this.add.text(left + 28, rowY, medal, { font, fill: color }).setOrigin(0, 0)
                this.add
                    .text(left + 110, rowY, entry.initials.trim() || '???', { font, fill: color })
                    .setOrigin(0, 0)
                this.add
                    .text(left + pw - 28, rowY, String(entry.score), { font, fill: color })
                    .setOrigin(1, 0)
            })
        }

        // Footer
        this.add
            .text(cx, top + ph - 22, 'Press SPACE or tap to continue', {
                font: '12px monospace',
                fill: '#555555'
            })
            .setOrigin(0.5, 1)

        this.input.keyboard.once('keydown-SPACE', () => this.scene.start(scenes.title))
        this.input.once('pointerup', () => this.scene.start(scenes.title))
    }
}
