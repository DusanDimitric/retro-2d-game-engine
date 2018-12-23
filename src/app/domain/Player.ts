import * as CONFIG from '@app/configuration/config.json'
import Canvas from '@app/infrastructure/Canvas'

import Projectile from '@app/domain/Projectile'
import { gameObjects } from '@app/domain/Map'

import SoundFX from '@app/audio/SoundFX'

export default class Player {
  public rotation: number = 0
  private maxSpeed = 4
  public moving = {
    left  : false,
    right : false,
    up    : false,
    down  : false,
  }
  public row: number
  public col: number
  public sightLineLength = 10
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

  private updateMapPosition(): void {
    this.row = Math.floor(this.y / CONFIG.TILE_SIZE)
    this.col = Math.floor(this.x / CONFIG.TILE_SIZE)
  }

  public shoot(): void {
    if (this.shooting && this.shootingCooldown <= 0) {
      const canvasMouseX: number = Canvas.getCanvasMouseX()
      const canvasMouseY: number = Canvas.getCanvasMouseY()

      const dx = (canvasMouseX - Canvas.center.x)
      const dy = (canvasMouseY - Canvas.center.y)
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
  
  public draw(): void {
    Canvas.drawPlayer(this)
		Canvas.drawPlayerVisionRay(this)
		Canvas.drawCrosshair()
		Canvas.drawProjectiles(this.projectiles, this.x, this.y)
  }

  public setShooting(isShooting: boolean): void {
    this.shooting = isShooting
  }
}
