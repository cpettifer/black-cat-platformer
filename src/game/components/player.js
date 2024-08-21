import Phaser from 'phaser'

import { animations } from '../const/animations'

export class Player extends Phaser.Physics.Arcade.Sprite {
    cursors

    isDead = false

    speed = 240
    jumpSpeed = 500

    constructor(scene, x, y) {
        super(scene, x, y, 'cat')

        this.isDead = false

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setBounce(0.2)
        this.setCollideWorldBounds(true)
        this.body.setGravityY(300)

        this.cursors = scene.input.keyboard.createCursorKeys()
    }

    update() {
        if (this.isDead) {
            return
        }

        if (this.cursors.left.isDown) {
            this.setVelocityX(-this.speed)
            if (this.body.touching.down) {
                this.anims.play(animations.cat_walk.key, true)
            }
            this.flipX = true
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.speed)
            if (this.body.touching.down) {
                this.anims.play(animations.cat_walk.key, true)
            }
            this.flipX = false
        } else {
            this.setVelocityX(0)
            if (this.body.touching.down) {
                this.anims.play(animations.cat_stand.key)
            }
        }

        if (this.cursors.up.isDown && this.body.touching.down) {
            this.setVelocityY(-this.jumpSpeed)
            this.anims.play(animations.cat_jump.key)
        }

        // Allow cat to "boost" downwards
        if (this.cursors.down.isDown && !this.body.touching.down) {
            this.setVelocityY(this.jumpSpeed)
        }
    }

    kill() {
        this.isDead = true
        this.anims.play(animations.cat_dead.key)
    }
}
