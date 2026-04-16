import { Scene } from 'phaser'

import { scenes } from '../const/scenes'
import { HelpPanel } from '../components/HelpPanel'
import { getHighScore } from '../utils'

export class Title extends Scene {
    constructor() {
        super({
            key: scenes.title
        })
    }

    create() {
        const { width, height } = this.cameras.main

        this.make
            .text({
                x: width / 2,
                y: height / 2 - 60,
                text: 'Super BlackCat',
                style: { font: '20px monospace', fill: '#ffffff' }
            })
            .setOrigin(0.5)

        this.make
            .text({
                x: width / 2,
                y: height / 2 - 20,
                text: 'Press SPACE to play',
                style: { font: '20px monospace', fill: '#ffffff' }
            })
            .setOrigin(0.5)

        this.make
            .text({
                x: width / 2,
                y: height / 2 + 20,
                text: 'Press H for help',
                style: { font: '14px monospace', fill: '#aaaaaa' }
            })
            .setOrigin(0.5)

        const highScore = getHighScore()
        if (highScore > 0) {
            this.make
                .text({
                    x: width / 2,
                    y: height / 2 + 60,
                    text: `High Score: ${highScore}`,
                    style: { font: '16px monospace', fill: '#ffff00' }
                })
                .setOrigin(0.5)
        }

        const helpPanel = new HelpPanel(this)
        helpPanel.setVisible(false)

        this.input.keyboard.on('keydown-H', () => helpPanel.toggle())

        this.input.keyboard.once('keydown-SPACE', () => {
            if (!helpPanel.visible) {
                this.scene.start(scenes.level)
            }
        })

        this.input.keyboard.once('keydown-ENTER', () => {
            if (!helpPanel.visible) {
                this.scene.start(scenes.level)
            }
        })

        this.input.once('pointerup', () => {
            if (helpPanel.visible) {
                helpPanel.setVisible(false)
            } else {
                this.scene.start(scenes.level)
            }
        })
    }
}
