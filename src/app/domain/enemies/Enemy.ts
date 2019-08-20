import * as CONFIG from '@app/configuration/config.json'

import CollisionBox from '@app/infrastructure/CollisionBox'
import Creature from '@app/domain/Creature'
import Player from '@app/domain/player/Player'
import { PathNode } from '@app/infrastructure/Pathfinding'

export default abstract class Enemy extends Creature {
  public alive: boolean = true
  public maxHealth: number = 100
  public health: number

  protected maxSpeedDiagonal: number

  protected distanceFromPlayer: number
  protected thereAreObstaclesBetweenPlayerAndThisEnemy: boolean
  protected pathfindingNodes: PathNode[]

  constructor(
    public x: number,
    public y: number,
    public collisionBox: CollisionBox,
    protected maxSpeed: number,
    healthPercentage: number
  ) {
    super()
    this.initializeHealth(healthPercentage)

    this.maxSpeedDiagonal = Math.round(Math.sin(45) * this.maxSpeed)
  }

  public abstract draw(player: Player): void
  public abstract update(player: Player, enemies: Enemy[]): void

  public isOnScreen(playerX: number, playerY: number): boolean {
    const offScreenOffset = CONFIG.TILE_SIZE * 2
    return (
      Math.abs(this.x - playerX) < (CONFIG.CANVAS_WIDTH  / 2) + offScreenOffset &&
      Math.abs(this.y - playerY) < (CONFIG.CANVAS_HEIGHT / 2) + offScreenOffset
    )
  }

  public collidesWithPlayer(playerX: number, playerY: number, playerCollisionBox: CollisionBox): boolean {
    return (
      this.x - this.collisionBox.halfWidth  < playerX + playerCollisionBox.halfWidth  &&
      this.x + this.collisionBox.halfWidth  > playerX - playerCollisionBox.halfWidth  &&
      this.y - this.collisionBox.halfHeight < playerY + playerCollisionBox.halfHeight &&
      this.y + this.collisionBox.halfHeight > playerY - playerCollisionBox.halfHeight
    )
  }

  public abstract takeDamage(damageAmount: number): void

  protected collidesWithEnemy(enemyX: number, enemyY: number, enemyCollisionBox: CollisionBox): boolean {
    return (
      this.x - this.collisionBox.halfWidth  < enemyX + enemyCollisionBox.halfWidth  &&
      this.x + this.collisionBox.halfWidth  > enemyX - enemyCollisionBox.halfWidth  &&
      this.y - this.collisionBox.halfHeight < enemyY + enemyCollisionBox.halfHeight &&
      this.y + this.collisionBox.halfHeight > enemyY - enemyCollisionBox.halfHeight
    )
  }

  protected adjustCollisionWithOtherEnemies(enemies: Enemy[]): void {
    enemies.forEach(e => {
      if (this !== e && this.collidesWithEnemy(e.x, e.y, e.collisionBox)) {
        let intersectionX: number
        let intersectionY: number
        if (this.x < e.x) {
          intersectionX = (this.x + this.collisionBox.halfWidth) - (e.x - e.collisionBox.halfWidth)
        } else if (this.x > e.x) {
          intersectionX = (e.x + e.collisionBox.halfWidth) - (this.x - this.collisionBox.halfWidth)
        }
        if (this.y < e.y) {
          intersectionY = (this.y + this.collisionBox.halfHeight) - (e.y - e.collisionBox.halfHeight)
        } else if (this.y > e.y) {
          intersectionY = (e.y + e.collisionBox.halfHeight) - (this.y - this.collisionBox.halfHeight)
        }
        if (!intersectionX || intersectionX > intersectionY) {
          if (this.y < e.y) {
            e.y += intersectionY
          } else {
            e.y -= intersectionY
          }
        } else if (!intersectionY || intersectionX < intersectionY) {
          if (this.x < e.x) {
            e.x += intersectionX
          } else {
            e.x -= intersectionX
          }
        }
      }
    })
  }

  // TODO: The color strings can be moved to a single hash map in order to optimize & localize the color searches
  protected getHealthColor(): string {
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

  private initializeHealth(healthPercentage: number): void {
    if (healthPercentage < 0.0 || healthPercentage > 1.0) {
      healthPercentage = 1.0
    }
    this.health = this.maxHealth * healthPercentage
  }
}
