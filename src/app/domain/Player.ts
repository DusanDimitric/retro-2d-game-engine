import * as CONFIG from '@app/configuration/config.json'
import Canvas from '@app/infrastructure/Canvas'

import Projectile from '@app/domain/Projectile'

import SoundFX from '@app/audio/SoundFX'

export default class Player {
  public rotation: number = 0
  private maxSpeed = 3
  public moving = {
    left  : false,
    right : false,
    up    : false,
    down  : false,
  }
  public sightLineLength = 10
  private shooting = false
  private shootingCooldown = 6
  private projectiles: Projectile[] = []

  constructor(public x: number, public y: number) {}

  public update(): void {
    this.move()
    this.shoot()
    this.updateProjectiles()
  }

  public move(): void {
    if (this.moving.left) {
      this.x -= this.maxSpeed
    }
    if (this.moving.right) {
      this.x += this.maxSpeed
    }
    if (this.moving.up) {
      this.y -= this.maxSpeed
    }
    if (this.moving.down) {
      this.y += this.maxSpeed
    }
  }

  public shoot(): void {
    if (this.shooting && this.shootingCooldown <= 0) {
      const canvasMouseX: number = Canvas.getCanvasMouseX()
      const canvasMouseY: number = Canvas.getCanvasMouseY()

      const dx = (canvasMouseX - this.x)
      const dy = (canvasMouseY - this.y)
      let xVel = dx / ( Math.abs(dx) + Math.abs(dy) )
      let yVel = dy / ( Math.abs(dx) + Math.abs(dy) )

      // TODO: Insert accuracy skill to reduce bullet motion randomness
      // TODO: Fix the problem with different bullet speeds caused by randomness
      const randomFactorX = Math.random() * 0.1 - 0.05
      const randomFactorY = Math.random() * 0.1 - 0.05
      xVel += randomFactorX
      yVel += randomFactorY

      this.projectiles.push(new Projectile(this.x, this.y, xVel, yVel))
      this.shootingCooldown = 6

      SoundFX.playSMG()
    } else {
      --this.shootingCooldown
    }
  }

  // TODO: Move to the Projectile class
  public updateProjectiles(): void {
    this.projectiles.forEach((p, i) => {
      p.x += p.directionX * p.speed
      p.y += p.directionY * p.speed
      if (
        p.x < 0 || p.x > CONFIG.CANVAS_WIDTH ||
        p.y < 0 || p.y > CONFIG.CANVAS_HEIGHT
      )
      {
        this.projectiles.splice(i, 1) // Remove the projectile
      }
    })
  }
  
  public draw(): void {
    Canvas.drawPlayer(this)
		Canvas.drawPlayerVisionRay(this)
		Canvas.drawCrosshair()
		Canvas.drawProjectiles(this.projectiles)
  }

  public setShooting(isShooting: boolean): void {
    this.shooting = isShooting
  }
}
