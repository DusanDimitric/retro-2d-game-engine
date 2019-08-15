import * as CONFIG from '@app/configuration/config.json'

import Canvas, { context } from '@app/infrastructure/Canvas'
import SoundFX from '@app/audio/SoundFX'
import { gameObjects } from '@app/domain/map/Map'
import CollisionBox from '@app/infrastructure/CollisionBox'
import Point, { pointToPointDistance } from '@app/infrastructure/geometry/Point'
import Player from '@app/domain/player/Player'
import Enemy from '@app/domain/enemies/Enemy'

export default class ConcreateEnemy extends Enemy {
  constructor(
    x: number,
    y: number,
    healthPercentage: number
  ) {
    super(x, y, new CollisionBox(16, 16), 1, healthPercentage)
    this.updateMapPosition()
  }

  public update(player: Player): void {
    this.adjustCollisionWithGameObjects()
    this.moveTowardsPlayer(player)
    this.move()
    this.updateTileDeltas()
  }

  public draw(player: Player): void {
    this.drawCollisionBox(player) // Just for debugging
  }

  public takeDamage(damageAmount: number): void {
    SoundFX.playEnemyHit()
    this.health -= damageAmount
    if (this.health <= 0) {
      this.die()
    } else {
      SoundFX.playEnemyHit()
    }
  }

  public die() {
    SoundFX.playEnemyDeath()
    this.alive = false
  }

  // TODO: Compose this functionality since it's shared between enemies and player
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

  private moveTowardsPlayer(player: Player): void {
    const distanceFromPlayer = pointToPointDistance(
      { x: player.x, y: player.y },
      { x: this.x, y: this.y }
    )
    if (distanceFromPlayer > 1) {
      this.moveTowards(player.x, player.y)
    }
  }

  private moveTowards(x: number, y: number): void {
    this.moving.left  = false
    this.moving.right = false
    this.moving.up    = false
    this.moving.down  = false
    if (this.x < x) {
      this.moving.right = true
    }
    else if (this.x > x) {
      this.moving.left = true
    }
    if (this.y < y) {
      this.moving.down = true
    }
    else if (this.y > y) {
      this.moving.up = true
    }
  }

  // TODO: Compose this functionality since it's shared between enemies and player
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
    this.updateMapPosition()
  }

  // TODO: Compose this functionality since it's shared between enemies and player
  private updateMapPosition(): void {
    this.row = Math.floor(this.y / CONFIG.TILE_SIZE)
    this.col = Math.floor(this.x / CONFIG.TILE_SIZE)
  }

  // TODO: Compose this functionality since it's shared between enemies and player
  private updateTileDeltas(): void {
    this.deltas.dyTop = this.y % CONFIG.TILE_SIZE
    this.deltas.dyBottom = CONFIG.TILE_SIZE - this.deltas.dyTop
    this.deltas.dxLeft = this.x % CONFIG.TILE_SIZE
    this.deltas.dxRight = CONFIG.TILE_SIZE - this.deltas.dxLeft
  }

  // TODO: Compose this functionality since it's shared between enemies and player
  private drawCollisionBox(player: Player) {
    context.strokeStyle = this.getHealthColor()
    context.lineWidth = 0.5
    context.beginPath()
      // Since this is just for debugging purposes, there is no need to
      // cache the vertex calculations.
      context.moveTo( 0.5 + Canvas.center.x + (this.x - player.x) - this.collisionBox.halfWidth,  0.5 + Canvas.center.y + (this.y - player.y) - this.collisionBox.halfHeight)
      context.lineTo(-0.5 + Canvas.center.x + (this.x - player.x) + this.collisionBox.halfWidth,  0.5 + Canvas.center.y + (this.y - player.y) - this.collisionBox.halfHeight)
      context.lineTo(-0.5 + Canvas.center.x + (this.x - player.x) + this.collisionBox.halfWidth, -0.5 + Canvas.center.y + (this.y - player.y) + this.collisionBox.halfHeight)
      context.lineTo( 0.5 + Canvas.center.x + (this.x - player.x) - this.collisionBox.halfWidth, -0.5 + Canvas.center.y + (this.y - player.y) + this.collisionBox.halfHeight)
      context.lineTo( 0.5 + Canvas.center.x + (this.x - player.x) - this.collisionBox.halfWidth,  0.5 + Canvas.center.y + (this.y - player.y) - this.collisionBox.halfHeight)
    context.stroke()
  }

}
