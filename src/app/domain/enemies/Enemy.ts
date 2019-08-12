import Canvas, { context } from '@app/infrastructure/Canvas'
import SoundFX from '@app/audio/SoundFX'
import CollisionBox from '@app/infrastructure/CollisionBox'
import Point, { pointToPointDistance } from '@app/infrastructure/geometry/Point'
import Player from '@app/domain/player/Player'

export default class Enemy {
  public alive: boolean = true
  public maxHealth: number = 100
  public health: number
  public moving = {
    left  : false,
    right : false,
    up    : false,
    down  : false,
  }
  public collisionBox: CollisionBox = new CollisionBox(16, 16)
  private maxSpeed = 1
  private movementPath: Point[]
  private targetPathNodeIndex: number = 1

  constructor(
    public x: number,
    public y: number,
    healthPercentage: number
  ) {
    if (healthPercentage < 0.0 || healthPercentage > 1.0) {
      healthPercentage = 1.0
    }
    this.health = this.maxHealth * healthPercentage
    console.log(this.health)

    this.movementPath = [ // TODO: Delete this temp placeholder, get paths from the Map JSON
      { x: this.x, y: this.y },
      { x: this.x, y: this.y + 50 },
    ]
    this.moving.down = true // TODO: Remove this temp placeholder
  }

  public update(): void {
    this.moveTowardsNode()
    this.move()
  }

  public draw(player: Player): void {
    this.drawCollisionBox(player) // Just for debugging
  }

  public takeDamage(damageAmount: number) {
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

  private moveTowardsNode(): void {
    const distanceFromTargetNode = pointToPointDistance(
      { x: this.movementPath[this.targetPathNodeIndex].x, y: this.movementPath[this.targetPathNodeIndex].y },
      { x: this.x, y: this.y }
    )
    if (distanceFromTargetNode < 1) {
      this.moveTowardsNextNode()
    }
  }

  private moveTowardsNextNode(): void {
    this.targetPathNodeIndex = (this.targetPathNodeIndex + 1) % this.movementPath.length

    this.moving.down = !this.moving.down // TODO: Remove this temp placeholder
    this.moving.up   = !this.moving.up   // TODO: Remove this temp placeholder
  }

  private move(): void {
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

  private getHealthColor(): string {
    if (this.health <= this.maxHealth * 0.10) {
      return '#FF5700'
    } else if (this.health <= this.maxHealth * 0.20) {
      return '#FF7B00'
    } else if (this.health <= this.maxHealth * 0.30) {
      return '#FF9E00'
    } else if (this.health <= this.maxHealth * 0.40) {
      return '#FFC100'
    } else if (this.health <= this.maxHealth * 0.50) {
      return '#FFE400'
    } else if (this.health <= this.maxHealth * 0.60) {
      return '#FFF600'
    } else if (this.health <= this.maxHealth * 0.70) {
      return '#E5FF00'
    } else if (this.health <= this.maxHealth * 0.80) {
      return '#D4FF00'
    } else if (this.health <= this.maxHealth * 0.90) {
      return '#B0FF00'
    } else if (this.health < this.maxHealth) {
      return '#8DFF00'
    } else if (this.health === this.maxHealth) {
      return '#6AFF00'
    }
  }
}
