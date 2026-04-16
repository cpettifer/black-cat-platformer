import { Scene } from 'phaser'

import { scenes } from '../const/scenes'
import { levels } from '../const/levels'
import { animations } from '../const/animations'
import { Player } from '../components/player'
import { TouchControls } from '../components/TouchControls'
import { Collectibles } from './Collectibles'
import { Platforms } from './Platforms'
import { HazardManager } from './HazardManager'
import { formatTime, calculateLevelBonus, getHighScore, saveHighScore } from '../utils'

export class Level extends Scene {
    hazards
    platforms
    player
    collectibles
    score = 0
    scoreText
    highScoreText
    levelText
    bonusText
    currentLevelIndex = 0
    roundsCleared = 0
    startTime
    elapsedTime
    levelTimerStopped
    timeText
    lastDisplayedSecond
    touchControls

    constructor() {
        super({
            key: scenes.level
        })
    }

    create() {
        this.add.image(400, 300, 'sky')

        this.currentLevelIndex = 0
        this.roundsCleared = 0
        this.score = 0
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' })
        this.highScoreText = this.add.text(16, 52, `Best: ${getHighScore()}`, {
            fontSize: '20px',
            fill: '#555555'
        })
        this.levelText = this.add
            .text(400, 300, '', { fontSize: '64px', fill: '#000' })
            .setOrigin(0.5)
        this.bonusText = this.add
            .text(400, 370, '', { fontSize: '28px', fill: '#000' })
            .setOrigin(0.5)

        this.startTime = Date.now()
        this.elapsedTime = 0
        this.lastDisplayedSecond = -1
        this.levelTimerStopped = false
        this.timeText = this.add.text(600, 16, 'Time: 0:00', { fontSize: '32px', fill: '#000' })

        this.player = new Player(this, 100, 450)

        this.initAnimations()
        this.collectibles = new Collectibles(this)
        this.platforms = new Platforms(this)
        this.hazards = new HazardManager(this)

        this.physics.add.collider(this.player, this.platforms.group)
        this.physics.add.collider(this.collectibles.group, this.platforms.group)
        this.physics.add.collider(this.hazards.group, this.platforms.group)
        this.physics.add.collider(this.player, this.hazards.group, this.gameOver, null, this)

        this.physics.add.overlap(
            this.player,
            this.collectibles.group,
            this.collectibles.collect,
            null,
            this
        )

        this.touchControls = new TouchControls(this)

        this.displayLevelText()
    }

    update() {
        this.player.update(this.touchControls.input)
        this.updateTime()
    }

    initAnimations() {
        Object.values(animations).forEach((animation) => {
            if (!this.anims.exists(animation.key)) {
                this.anims.create(animation)
            }
        })
    }

    updateTime() {
        if (!this.player.isDead && !this.levelTimerStopped) {
            this.elapsedTime = Date.now() - this.startTime
        }
        const seconds = Math.floor(this.elapsedTime / 1000)
        if (seconds !== this.lastDisplayedSecond) {
            this.lastDisplayedSecond = seconds
            this.timeText.setText('Time: ' + formatTime(seconds))
        }
    }

    updateScore(points) {
        this.score += points
        this.scoreText.setText('Score: ' + this.score)
    }

    levelClear() {
        this.roundsCleared++
        const { maxRocks } = levels[this.currentLevelIndex]

        if (this.roundsCleared >= maxRocks) {
            // Stop the timer at the exact moment the last collectible is picked up
            this.levelTimerStopped = true
            const finalSeconds = Math.floor(this.elapsedTime / 1000)
            const bonus = calculateLevelBonus(finalSeconds, levels[this.currentLevelIndex].parTime)
            this.showLevelCleared(bonus)
        } else {
            this.hazards.spawn(this.player.x)
            this.collectibles.reset()
        }
    }

    showLevelCleared(bonus) {
        this.physics.pause()
        this.levelText.setText('Level Cleared!')
        if (bonus > 0) {
            this.bonusText.setText(`Time bonus: +${bonus}`)
            this.updateScore(bonus)
        }
        this.time.delayedCall(2000, this.advanceLevel, [], this)
    }

    advanceLevel() {
        this.currentLevelIndex = (this.currentLevelIndex + 1) % levels.length
        this.roundsCleared = 0
        this.hazards.clear()
        this.platforms.init(levels[this.currentLevelIndex].platformLayout)
        this.collectibles.reset()
        this.physics.resume()

        // Reset level timer for the new level
        this.startTime = Date.now()
        this.elapsedTime = 0
        this.lastDisplayedSecond = -1
        this.levelTimerStopped = false
        this.bonusText.setText('')

        this.displayLevelText()
    }

    displayLevelText() {
        this.levelText.setText(`Level ${this.currentLevelIndex + 1}`)
        this.time.delayedCall(1200, () => this.levelText.setText(''))
    }

    gameOver() {
        this.levelText.setText('')
        this.bonusText.setText('')
        this.physics.pause()
        this.player.kill()

        const isNewHighScore = saveHighScore(this.score)

        this.add
            .text(400, 300, 'Game Over', {
                fontSize: '64px',
                fill: '#000'
            })
            .setOrigin(0.5)

        if (isNewHighScore && this.score > 0) {
            this.add
                .text(400, 356, `New high score: ${this.score}!`, {
                    fontSize: '24px',
                    fill: '#ffff00'
                })
                .setOrigin(0.5)

            this.add
                .text(400, 390, 'Press Space or tap to restart', {
                    fontSize: '21px',
                    fill: '#000'
                })
                .setOrigin(0.5)
        } else {
            this.add
                .text(400, 356, 'Press Space or tap to restart', {
                    fontSize: '21px',
                    fill: '#000'
                })
                .setOrigin(0.5)
        }

        this.input.keyboard.once('keyup-SPACE', () => {
            this.scene.start(scenes.title)
        })

        this.input.once('pointerup', () => {
            this.scene.start(scenes.title)
        })
    }

    shutdown() {
        this.player = null
        this.platforms = null
        this.collectibles = null
        this.hazards = null
        this.touchControls = null
        this.bonusText = null
        this.highScoreText = null
    }
}
