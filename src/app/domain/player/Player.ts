import * as CONFIG from '@app/configuration/config.json'
import Canvas, { context } from '@app/infrastructure/Canvas'
import Raycaster from '@app/infrastructure/Raycaster'

import { gameObjects } from '@app/domain/map/Map'
import Crosshair from './Crosshair'
import Projectile from './Projectile'

import SoundFX from '@app/audio/SoundFX'

export default class Player {
  public rotation: number = 0
  public moving = {
    left  : false,
    right : false,
    up    : false,
    down  : false,
  }
  public row: number
  public col: number
  public sightLineLength = 10
  public deltas = {
    dyTop    : 0,
    dyBottom : 0,
    dxLeft   : 0,
    dxRight  : 0,
  }
  private maxSpeed = 4
  private shooting = false
  private shootingCooldown = 6
  private projectiles: Projectile[] = []

  constructor(
    public x: number,
    public y: number,
  )
  {
    this.updateMapPosition()
  }

  public update(): void {
    this.move()
    this.updateTileDeltas()
    this.shoot()
    this.projectiles.forEach((p, i) => {
      p.update(this.x, this.y)
      if (p.alive === false) {
        this.projectiles.splice(i, 1) // Remove the projectile
      }
    })
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
    this.adjustCollisionWithGameObjects()
    this.updateMapPosition()
  }

  public shoot(): void {
    if (this.shooting && this.shootingCooldown <= 0) {
      const dx = (Canvas.mousePosition.x - Canvas.center.x)
      const dy = (Canvas.mousePosition.y - Canvas.center.y)
      let xVel = dx / ( Math.abs(dx) + Math.abs(dy) )
      let yVel = dy / ( Math.abs(dx) + Math.abs(dy) )

      // TODO: GAME FEATURE: Insert accuracy skill to reduce bullet motion randomness
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

  public setShooting(isShooting: boolean): void {
    this.shooting = isShooting
  }

  public draw(): void {
    const theta = this.calculateTheta()
    this.drawPlayer(theta)
    this.drawPlayerVisionRay(theta)

    // TODO: Just for testing purposes. Delete this.
    // this.drawPlayerVisionRay(theta - 0.45)
    // this.drawPlayerVisionRay(theta - 0.4)
    // this.drawPlayerVisionRay(theta - 0.35)
    // this.drawPlayerVisionRay(theta - 0.3)
    // this.drawPlayerVisionRay(theta - 0.25)
    // this.drawPlayerVisionRay(theta - 0.2)
    // this.drawPlayerVisionRay(theta - 0.15)
    // this.drawPlayerVisionRay(theta - 0.1)
    // this.drawPlayerVisionRay(theta - 0.05)
    // this.drawPlayerVisionRay(theta + 0.05)
    // this.drawPlayerVisionRay(theta + 0.1)
    // this.drawPlayerVisionRay(theta + 0.15)
    // this.drawPlayerVisionRay(theta + 0.2)
    // this.drawPlayerVisionRay(theta + 0.25)
    // this.drawPlayerVisionRay(theta + 0.3)
    // this.drawPlayerVisionRay(theta + 0.35)
    // this.drawPlayerVisionRay(theta + 0.4)
    // this.drawPlayerVisionRay(theta + 0.45)

    Crosshair.draw()
    this.drawProjectiles()
  }

  private calculateTheta(): number {
    const theta = Math.atan2(
      (Canvas.mousePosition.y - Canvas.center.y),
      (Canvas.mousePosition.x - Canvas.center.x)
    )
    context.fillStyle = '#44FF44'
    context.fillText(`θ = ${theta}`, 10, 56)
    return theta
  }

  private drawPlayer(theta: number): void {
    // Draw gun
    context.beginPath()
      context.fillStyle = '#00AA00'
      context.font = "10px Monospace"

      context.fillText(`p (${this.x}, ${this.y})`, 10, 20)

      context.strokeStyle = '#523DA5'
      context.lineWidth = 2
      context.moveTo(Canvas.center.x, Canvas.center.y)
      context.lineTo(Canvas.center.x + (this.sightLineLength * Math.cos(theta)), Canvas.center.y + (this.sightLineLength * Math.sin(theta)))
    context.stroke()

    // Draw circle around player
    context.beginPath()
      context.lineWidth = 1
      context.arc(
        Canvas.center.x,
        Canvas.center.y,
        10,
        0,
        (2 * Math.PI)
      )
    context.stroke()
  }

  private drawPlayerVisionRay(theta: number) {
    const { hitPoint, hitObject } = Raycaster.cast(this, theta)
    if (hitPoint) {
      if (hitObject) {
        Raycaster.drawRay(hitPoint, '#FF4444')
      } else {
        Raycaster.drawRay(hitPoint)
      }
    }
  }

  private drawProjectiles() {
    this.projectiles.forEach(p => p.draw(this.x, this.y))
  }

  private updateMapPosition(): void {
    this.row = Math.floor(this.y / CONFIG.TILE_SIZE)
    this.col = Math.floor(this.x / CONFIG.TILE_SIZE)
  }

  private updateTileDeltas(): void {
    this.deltas.dyTop = this.y % CONFIG.TILE_SIZE
    this.deltas.dyBottom = CONFIG.TILE_SIZE - this.deltas.dyTop
    this.deltas.dxLeft = this.x % CONFIG.TILE_SIZE
    this.deltas.dxRight = CONFIG.TILE_SIZE - this.deltas.dxLeft
  }

  // TODO: Generalize collision physics
  private adjustCollisionWithGameObjects(): void {
    let o
    if (gameObjects[this.row]) {
      if (o = gameObjects[this.row][this.col - 1]) { // West
        if (this.x <= o.mapX + o.width) {
          this.x = o.mapX + o.width + 1
        }
      }
      if (o = gameObjects[this.row][this.col + 1]) { // East
        if (this.x >= o.mapX) {
          this.x = o.mapX - 1
        }
      }
    }
    if (gameObjects[this.row - 1]) {
      if (o = gameObjects[this.row - 1][this.col]) { // North
        if (this.y <= o.mapY + o.height) {
          this.y = o.mapY + o.height + 1
        }
      }
      if (o = gameObjects[this.row - 1][this.col + 1]) { // North East
        if (this.y <= o.mapY + o.height && this.x >= o.mapX) {
          this.y = o.mapY + o.height + 1
        }
      }
      if (o = gameObjects[this.row - 1][this.col - 1]) { // North West
        if (this.y <= o.mapY + o.height && this.x <= o.mapX + o.width) {
          this.y = o.mapY + o.height + 1
        }
      }
    }
    if (gameObjects[this.row + 1]) {
      if (o = gameObjects[this.row + 1][this.col]) { // South
        if (this.y >= o.mapY) {
          this.y = o.mapY - 1
        }
      }
      if (o = gameObjects[this.row + 1][this.col + 1]) { // South East
        if (this.x >= o.mapX && this.y >= o.mapY) {
          this.y = o.mapY - 1
        }
      }
      if (o = gameObjects[this.row + 1][this.col - 1]) { // South West
        if (this.x <= o.mapX + o.width && this.y >= o.mapY) {
          this.y = o.mapY - 1
        }
      }
    }
  }

}
