import * as CONFIG from '@app/configuration/config.json'
import Canvas, { context } from '@app/infrastructure/Canvas'
import Raycaster from '@app/infrastructure/Raycaster'
import CollisionBox from '@app/infrastructure/CollisionBox'

import { gameObjects, getEnemiesOnScreen } from '@app/domain/map/Map'
import Crosshair from './Crosshair'
import Projectile from './Projectile'

import SoundFX from '@app/audio/SoundFX'
import Game from '@app/infrastructure/game/Game'
import GameState from '@app/infrastructure/game/game_states/GameState'

export default class Player {
  public alive: boolean = true
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
  private collisionBox: CollisionBox = new CollisionBox(12, 12)
  private maxSpeed = 3
  private maxSpeedDiagonal = Math.sin(45) * this.maxSpeed
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

  private move(): void {
    if (this.moving.left) {
      if (this.moving.up || this.moving.down) {
        this.x -= this.maxSpeedDiagonal
      } else {
        this.x -= this.maxSpeed
      }
    }
    if (this.moving.right) {
      if (this.moving.up || this.moving.down) {
        this.x += this.maxSpeedDiagonal
      } else {
        this.x += this.maxSpeed
      }
    }
    if (this.moving.up) {
      if (this.moving.left || this.moving.right) {
        this.y -= this.maxSpeedDiagonal
      } else {
        this.y -= this.maxSpeed
      }
    }
    if (this.moving.down) {
      if (this.moving.left || this.moving.right) {
        this.y += this.maxSpeedDiagonal
      } else {
        this.y += this.maxSpeed
      }
    }
    this.adjustCollisionWithGameObjects()
    this.checkForCollisionWithEnemies()
    this.updateMapPosition()
  }

  private calculateTheta(): number {
    const theta = Math.atan2(
      (Canvas.mousePosition.y - Canvas.center.y),
      (Canvas.mousePosition.x - Canvas.center.x)
    )
    context.fillStyle = '#44FF44'
    context.fillText(`θ = ${theta.toFixed(2)}`, 10, 56)
    return theta
  }

  private drawPlayer(theta: number): void {
    // Draw gun
    context.beginPath()
      context.fillStyle = '#00AA00'
      context.font = '10px Monospace'

      context.fillText(`p (${this.x.toFixed(2)}, ${this.y.toFixed(2)})`, 10, 20)

      context.strokeStyle = '#523DA5'
      context.lineWidth = 2
      context.moveTo(Canvas.center.x, Canvas.center.y)
      context.lineTo(Canvas.center.x + (this.sightLineLength * Math.cos(theta)), Canvas.center.y + (this.sightLineLength * Math.sin(theta)))
    context.stroke()

    this.drawCollisionBox() // Just for debugging
  }

  private drawCollisionBox() {
    context.lineWidth = 1
    context.beginPath()
      // Since this is just for debugging purposes, there is no need to
      // cache the vertex calculations.
      context.moveTo( 0.5 + Canvas.center.x - this.collisionBox.halfWidth,  0.5 + Canvas.center.y - this.collisionBox.halfHeight)
      context.lineTo(-0.5 + Canvas.center.x + this.collisionBox.halfWidth,  0.5 + Canvas.center.y - this.collisionBox.halfHeight)
      context.lineTo(-0.5 + Canvas.center.x + this.collisionBox.halfWidth, -0.5 + Canvas.center.y + this.collisionBox.halfHeight)
      context.lineTo( 0.5 + Canvas.center.x - this.collisionBox.halfWidth, -0.5 + Canvas.center.y + this.collisionBox.halfHeight)
      context.lineTo( 0.5 + Canvas.center.x - this.collisionBox.halfWidth,  0.5 + Canvas.center.y - this.collisionBox.halfHeight)
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
      if (this.moving.left) {
        o = gameObjects[this.row][this.col - 1] // West
        if (o && this.x - this.collisionBox.halfWidth <= o.mapX + o.width) {
          this.x = o.mapX + o.width + this.collisionBox.halfWidth
        }

        const SWVertexRow = Math.floor((this.y + this.collisionBox.halfHeight - 1) / CONFIG.TILE_SIZE)
        if (SWVertexRow !== this.row) { // SW vertex overflows the player grid
          o = gameObjects[SWVertexRow][this.col - 1] // South West
          if (o && this.x - this.collisionBox.halfWidth <= o.mapX + o.width) {
            if (!(this.moving.down && this.deltas.dyTop <= this.deltas.dxRight)) {
              this.x = o.mapX + o.width + this.collisionBox.halfWidth
            }
          }
        }

        const NWVertexRow = Math.floor((this.y - this.collisionBox.halfHeight) / CONFIG.TILE_SIZE)
        if (NWVertexRow !== this.row) { // NW vertex overflows the player grid
          o = gameObjects[NWVertexRow][this.col - 1] // North West
          if (o && this.x - this.collisionBox.halfWidth <= o.mapX + o.width) {
            if (!(this.moving.up && this.deltas.dyBottom <= this.deltas.dxRight)) {
              this.x = o.mapX + o.width + this.collisionBox.halfWidth
            }
          }
        }
      }
      if (this.moving.right) {
        o = gameObjects[this.row][this.col + 1] // East
        if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
          this.x = o.mapX - this.collisionBox.halfWidth
        }

        const SEVertexRow = Math.floor((this.y + this.collisionBox.halfHeight - 1) / CONFIG.TILE_SIZE)
        if (SEVertexRow !== this.row) { // SE vertex overflows the player grid
          o = gameObjects[SEVertexRow][this.col + 1] // South East
          if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
            if (!(this.moving.down && this.deltas.dyTop <= this.deltas.dxLeft)) {
              this.x = o.mapX - this.collisionBox.halfWidth
            }
          }
        }

        const NEVertexRow = Math.floor((this.y - this.collisionBox.halfHeight) / CONFIG.TILE_SIZE)
        if (NEVertexRow !== this.row) { // NE vertex overflows the player grid
          o = gameObjects[NEVertexRow][this.col + 1] // North East
          if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
            if (!(this.moving.up && this.deltas.dyBottom <= this.deltas.dxLeft)) {
              this.x = o.mapX - this.collisionBox.halfWidth
            }
          }
        }
      }
    }
    if (gameObjects[this.row - 1]) {
      if (this.moving.up) {
        o = gameObjects[this.row - 1][this.col] // North
        if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
          this.y = o.mapY + o.height + this.collisionBox.halfHeight
        }

        const NEVertexCol = Math.floor((this.x + this.collisionBox.halfWidth - 1) / CONFIG.TILE_SIZE)
        if (NEVertexCol !== this.col) { // NE vertex overflows the player grid
          o = gameObjects[this.row - 1][NEVertexCol] // North East
          if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
            if (!(this.moving.right && this.deltas.dyBottom > this.deltas.dxLeft)) {
              this.y = o.mapY + o.height + this.collisionBox.halfHeight
            }
          }
        }

        const NWVertexCol = Math.floor((this.x - this.collisionBox.halfWidth) / CONFIG.TILE_SIZE)
        if (NWVertexCol !== this.col) { // NW vertex overflows the player grid
          o = gameObjects[this.row - 1][NWVertexCol] // North West
          if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
            if (!(this.moving.left && this.deltas.dyBottom > this.deltas.dxRight)) {
              this.y = o.mapY + o.height + this.collisionBox.halfHeight
            }
          }
        }
      }
    }
    if (gameObjects[this.row + 1]) {
      if (this.moving.down) {
        o = gameObjects[this.row + 1][this.col] // South
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          this.y = o.mapY - this.collisionBox.halfHeight
        }
      }

      const SEVertexCol = Math.floor((this.x + this.collisionBox.halfWidth - 1) / CONFIG.TILE_SIZE)
      if (SEVertexCol !== this.col) { // SE vertex overflows the player grid
        o = gameObjects[this.row + 1][SEVertexCol] // South East
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          if (!(this.moving.right && this.deltas.dyTop > this.deltas.dxLeft)) {
            this.y = o.mapY - this.collisionBox.halfHeight
          }
        }
      }

      const SWVertexCol = Math.floor((this.x - this.collisionBox.halfWidth) / CONFIG.TILE_SIZE)
      if (SWVertexCol !== this.col) { // SW vertex overflows the player grid
        o = gameObjects[this.row + 1][SWVertexCol] // South West
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          if (!(this.moving.left && this.deltas.dyTop > this.deltas.dxRight)) {
            this.y = o.mapY - this.collisionBox.halfHeight
          }
        }
      }
    }
  }

  private checkForCollisionWithEnemies(): void {
    if (getEnemiesOnScreen(this.x, this.y)
      .filter(e => e.collidesWithPlayer(this.x, this.y, this.collisionBox))
      .length > 0) {
        this.die()
      }
  }

  private die(): void {
    this.alive = false
    Game.state = GameState.paused
  }
}
