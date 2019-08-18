import * as CONFIG from '@app/configuration/config.json'

import SoundFX from '@app/audio/SoundFX'

import Canvas, { context } from '@app/infrastructure/Canvas'
import Point, { pointToPointDistance, angleBetweenPoints } from '@app/infrastructure/geometry/Point'
import CollisionBox from '@app/infrastructure/CollisionBox'
import Raycaster from '@app/infrastructure/Raycaster'
import { generatePathNodes, drawPath } from '@app/infrastructure/Pathfinding'

import { gameObjects } from '@app/domain/map/Map'
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
    this.distanceFromPlayer = pointToPointDistance(
      { x: player.x, y: player.y },
      { x: this.x,   y: this.y   }
    )
    this.determineIfThereAreObstaclesBetweenThisEnemyAndThePlayer(player)
    this.findPathToPlayer(player)
    this.move()
    this.updateTileDeltas()
  }

  public draw(player: Player): void {
    this.drawCollisionBox(player) // Just for debugging
    this.drawRayToPlayer(player) // TODO: Just for debugging
    drawPath(this.pathToPlayer, this.collisionBox, player, this.getHealthColor()) // TODO: Just for debugging
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
          this.x = o.mapX + o.width + this.collisionBox.halfWidth + 1
        }

        const SWVertexRow = Math.floor((this.y + this.collisionBox.halfHeight - 1) / CONFIG.TILE_SIZE)
        if (SWVertexRow !== this.row) { // SW vertex overflows the player grid
          o = gameObjects[SWVertexRow][this.col - 1] // South West
          if (o && this.x - this.collisionBox.halfWidth <= o.mapX + o.width) {
            if (!(this.moving.down && this.deltas.dyTop <= this.deltas.dxRight)) {
              this.x = o.mapX + o.width + this.collisionBox.halfWidth + 1
            }
          }
        }

        const NWVertexRow = Math.floor((this.y - this.collisionBox.halfHeight) / CONFIG.TILE_SIZE)
        if (NWVertexRow !== this.row) { // NW vertex overflows the player grid
          o = gameObjects[NWVertexRow][this.col - 1] // North West
          if (o && this.x - this.collisionBox.halfWidth <= o.mapX + o.width) {
            if (!(this.moving.up && this.deltas.dyBottom <= this.deltas.dxRight)) {
              this.x = o.mapX + o.width + this.collisionBox.halfWidth + 1
            }
          }
        }
      }
      if (this.moving.right) {
        o = gameObjects[this.row][this.col + 1] // East
        if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
          this.x = o.mapX - this.collisionBox.halfWidth - 1
        }

        const SEVertexRow = Math.floor((this.y + this.collisionBox.halfHeight - 1) / CONFIG.TILE_SIZE)
        if (SEVertexRow !== this.row) { // SE vertex overflows the player grid
          o = gameObjects[SEVertexRow][this.col + 1] // South East
          if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
            if (!(this.moving.down && this.deltas.dyTop <= this.deltas.dxLeft)) {
              this.x = o.mapX - this.collisionBox.halfWidth - 1
            }
          }
        }

        const NEVertexRow = Math.floor((this.y - this.collisionBox.halfHeight) / CONFIG.TILE_SIZE)
        if (NEVertexRow !== this.row) { // NE vertex overflows the player grid
          o = gameObjects[NEVertexRow][this.col + 1] // North East
          if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
            if (!(this.moving.up && this.deltas.dyBottom <= this.deltas.dxLeft)) {
              this.x = o.mapX - this.collisionBox.halfWidth - 1
            }
          }
        }
      }
    }
    if (gameObjects[this.row - 1]) {
      if (this.moving.up) {
        o = gameObjects[this.row - 1][this.col] // North
        if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
          this.y = o.mapY + o.height + this.collisionBox.halfHeight + 1
        }

        const NEVertexCol = Math.floor((this.x + this.collisionBox.halfWidth - 1) / CONFIG.TILE_SIZE)
        if (NEVertexCol !== this.col) { // NE vertex overflows the player grid
          o = gameObjects[this.row - 1][NEVertexCol] // North East
          if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
            if (!(this.moving.right && this.deltas.dyBottom > this.deltas.dxLeft)) {
              this.y = o.mapY + o.height + this.collisionBox.halfHeight + 1
            }
          }
        }

        const NWVertexCol = Math.floor((this.x - this.collisionBox.halfWidth) / CONFIG.TILE_SIZE)
        if (NWVertexCol !== this.col) { // NW vertex overflows the player grid
          o = gameObjects[this.row - 1][NWVertexCol] // North West
          if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
            if (!(this.moving.left && this.deltas.dyBottom > this.deltas.dxRight)) {
              this.y = o.mapY + o.height + this.collisionBox.halfHeight + 1
            }
          }
        }
      }
    }
    if (gameObjects[this.row + 1]) {
      if (this.moving.down) {
        o = gameObjects[this.row + 1][this.col] // South
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          this.y = o.mapY - this.collisionBox.halfHeight - 1
        }
      }

      const SEVertexCol = Math.floor((this.x + this.collisionBox.halfWidth - 1) / CONFIG.TILE_SIZE)
      if (SEVertexCol !== this.col) { // SE vertex overflows the player grid
        o = gameObjects[this.row + 1][SEVertexCol] // South East
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          if (!(this.moving.right && this.deltas.dyTop > this.deltas.dxLeft)) {
            this.y = o.mapY - this.collisionBox.halfHeight - 1
          }
        }
      }

      const SWVertexCol = Math.floor((this.x - this.collisionBox.halfWidth) / CONFIG.TILE_SIZE)
      if (SWVertexCol !== this.col) { // SW vertex overflows the player grid
        o = gameObjects[this.row + 1][SWVertexCol] // South West
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          if (!(this.moving.left && this.deltas.dyTop > this.deltas.dxRight)) {
            this.y = o.mapY - this.collisionBox.halfHeight - 1
          }
        }
      }
    }
  }

  private findPathToPlayer(player: Player): void {
    if (this.thereAreObstaclesBetweenPlayerAndThisEnemy) {
      this.pathToPlayer = generatePathNodes(this.row, this.col, this.collisionBox)
      this.moveTowardsPlayer(player)
    }
    else {
      if (this.pathToPlayer) {
        this.pathToPlayer = null
      }
      this.moveTowardsPlayer(player)
    }
  }

  private moveTowardsPlayer(player: Player): void {
    if (this.distanceFromPlayer > 1) {
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

  private determineIfThereAreObstaclesBetweenThisEnemyAndThePlayer(player: Player): void {
    const angleBetweenPlayerAndEnemy = angleBetweenPoints(
      { x: this.x,   y: this.y   },
      { x: player.x, y: player.y }
    )
    const { hitPoint } = Raycaster.cast(player, angleBetweenPlayerAndEnemy)
    this.thereAreObstaclesBetweenPlayerAndThisEnemy = (
      this.distanceFromPlayer > pointToPointDistance(hitPoint, { x: 0, y: 0 })
    )

  }

  // TODO: Compose this functionality since it's shared between enemies and player
  private drawCollisionBox(player: Player) {
    context.strokeStyle = this.getHealthColor()
    context.lineWidth = 0.5
    context.beginPath()
      // Since this is just for debugging purposes, there is no need to
      // optimize/cache the vertex calculations.
      context.moveTo( 0.5 + Canvas.center.x + (this.x - player.x) - this.collisionBox.halfWidth,  0.5 + Canvas.center.y + (this.y - player.y) - this.collisionBox.halfHeight)
      context.lineTo(-0.5 + Canvas.center.x + (this.x - player.x) + this.collisionBox.halfWidth,  0.5 + Canvas.center.y + (this.y - player.y) - this.collisionBox.halfHeight)
      context.lineTo(-0.5 + Canvas.center.x + (this.x - player.x) + this.collisionBox.halfWidth, -0.5 + Canvas.center.y + (this.y - player.y) + this.collisionBox.halfHeight)
      context.lineTo( 0.5 + Canvas.center.x + (this.x - player.x) - this.collisionBox.halfWidth, -0.5 + Canvas.center.y + (this.y - player.y) + this.collisionBox.halfHeight)
      context.lineTo( 0.5 + Canvas.center.x + (this.x - player.x) - this.collisionBox.halfWidth,  0.5 + Canvas.center.y + (this.y - player.y) - this.collisionBox.halfHeight)
    context.stroke()
  }

  // TODO: Just for debugging
  private drawRayToPlayer(player: Player) {
    if (this.thereAreObstaclesBetweenPlayerAndThisEnemy) {
      context.strokeStyle = '#FFFF44'
    } else {
      context.strokeStyle = '#00F0FF'
    }
    context.lineWidth = 0.5
    context.beginPath()
      context.moveTo(Canvas.center.x + (this.x - player.x), Canvas.center.y + (this.y - player.y))
      context.lineTo(Canvas.center.x, Canvas.center.y)
    context.stroke()
  }
}
