import * as CONFIG from '@app/configuration/config.json'

import SoundFX from '@app/audio/SoundFX'

import Canvas, { context } from '@app/infrastructure/Canvas'
import Point, { pointToPointDistance } from '@app/infrastructure/geometry/Point'
import CollisionBox from '@app/infrastructure/CollisionBox'
import Raycaster from '@app/infrastructure/Raycaster'
import { generatePathNodes, drawPathNodes, findShortestPath, drawNode } from '@app/infrastructure/Pathfinding'

import Player from '@app/domain/player/Player'
import Enemy from '@app/domain/enemies/Enemy'

export default class ConcreteEnemy extends Enemy {
  constructor(
    x: number,
    y: number,
    healthPercentage: number,
    protected pathfindingInterval: number
  ) {
    super(x, y, new CollisionBox(16, 16), 1, healthPercentage)
    this.updateMapPosition()
  }

  public update(player: Player, enemies: Enemy[]): void {
    this.adjustCollisionWithGameObjects()
    this.adjustCollisionWithOtherEnemies(enemies)
    this.distanceFromPlayer = pointToPointDistance(
      { x: player.x, y: player.y },
      { x: this.x,   y: this.y   }
    )
    this.thereAreObstaclesBetweenPlayerAndThisEnemy =
      Raycaster.determineIfThereAreObstaclesBetweenTwoPoints(this, player)
    this.findPathToPlayer(player)
    this.move()
    this.updateTileDeltas()
  }

  public draw(player: Player): void {
    this.drawCollisionBox(player) // Just for debugging
    // this.drawRayToPlayer(player) // TODO: Just for debugging
    // drawPathNodes(this.pathfindingNodes, this.collisionBox, player, this.getHealthColor()) // TODO: Just for debugging

    // TODO: Just for debugging
    this.shortestPath
      .forEach((n, i) => {
        drawNode(n, this.collisionBox, player, n.visited ? '#FF0000' : '#FF00FF')
      })
    if (this.shortestPath.length > 0) {
      this.drawRayToPoint(this.shortestPath[this.shortestPath.length - 1], player)
    }
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

  private findPathToPlayer(player: Player): void {
    if (this.thereAreObstaclesBetweenPlayerAndThisEnemy) { // TODO: || this.isStuck()
      if (this.pathfindingInterval === 0) {
        this.pathfindingNodes = generatePathNodes(
          Math.round(Math.abs(player.row + this.row) / 2),
          Math.round(Math.abs(player.col + this.col) / 2),
          this.collisionBox,
        )
        this.shortestPath = findShortestPath(this, player, this.pathfindingNodes)
      }

      this.pathfindingInterval = (this.pathfindingInterval + 1) % this.pathfindingPeriod

      if (this.shortestPath.length > 0) {
        this.moveTowards(
          this.shortestPath[this.shortestPath.length - 1].x,
          this.shortestPath[this.shortestPath.length - 1].y
        )
      }
    }
    else {
      if (this.pathfindingNodes) {
        this.pathfindingNodes = null
      }
      if (this.shortestPath) {
        this.shortestPath = []
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

  // TODO: Just for debugging
  private drawRayToPoint(p: Point, player: Player) {
    context.strokeStyle = '#FF00FF'
    context.lineWidth = 0.2
    context.beginPath()
      context.moveTo(Canvas.center.x + (this.x - player.x), Canvas.center.y + (this.y - player.y))
      context.lineTo(Canvas.center.x + (p.x - player.x), Canvas.center.y + (p.y - player.y))
    context.stroke()
  }
}
