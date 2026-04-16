import Phaser from 'phaser'
import { Preload } from './scenes/Preload'
import { Title } from './scenes/Title'
import { Level } from './scenes/Level'
import { EnterInitials } from './scenes/EnterInitials'
import { HighScores } from './scenes/HighScores'
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY_Y } from './const/gameConfig'

export const config = {
    type: Phaser.AUTO,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GRAVITY_Y },
            debug: false
        }
    },
    scene: [Preload, Title, Level, EnterInitials, HighScores]
}
