import * as CONFIG from '@app/configuration/config.json'

import Canvas, { context } from '@app/infrastructure/Canvas'

import { gameObjects } from '@app/domain/map/Map'

interface IntermediatePoint {
  x: number
  y: number
  row: number
  col: number
}

export default class Projectile {
  public speed: number = 24
  public alive: boolean = true
  public row: number
  public col: number
  private previousX: number
  private previousY: number

  /*
   * Intermediate positions/points solve the bullet phasing problem
   */
  private numberOfIntermediatePositions: number = 3 // More intermediate points give more precision, 3 are just fine
  private intermediatePositions: IntermediatePoint[] = []

  constructor(
    public x: number,
    public y: number,
    public directionX: number,
    public directionY: number,
  ) {
    for (let i = 0; i < this.numberOfIntermediatePositions; ++i) {
      this.intermediatePositions[i] = { x: null, y: null, row: null, col: null }
    }
  }

  public update(playerX: number, playerY: number): void {
    this.previousX = this.x
    this.previousY = this.y
    this.x += this.directionX * this.speed
    this.y += this.directionY * this.speed
    this.row = Math.floor(this.y / CONFIG.TILE_SIZE)
    this.col = Math.floor(this.x / CONFIG.TILE_SIZE)

    this.calculateIntermediatePoints()

    if (this.isOffScreen(playerX, playerY)) {
      this.alive = false
    }

    this.intermediatePositions.forEach(intermediatePoint => {
      if (this.alive) {
        this.checkCollisionWithGameObject(intermediatePoint)
      }
    })
    if (this.alive) {
      this.checkCollisionWithGameObject()
    }
  }

  public draw(playerX: number, playerY: number) {
    if (this.x === playerX && this.y === playerY) {
      // Don't draw the first projectile that is spawned at player position.
      return
    }
    context.strokeStyle = '#8AFCFF'
    context.lineWidth = 1
    context.beginPath()
    context.arc(
      this.x + Canvas.center.x - playerX,
      this.y + Canvas.center.y - playerY,
      2,
      0,
      (2 * Math.PI)
    )
    context.stroke()
  }

  /**
   *                                     (this.x, this.y)
   *  (this.previousX, this.previousY)   /
   *  /                                 /
   * x-------o-------o--------o--------x
   *         |       |        |
   *          \      |       /
   *        Intermediate points
   */
  private calculateIntermediatePoints(): void {
    const intermediateIntervalX = (this.x - this.previousX) / (this.numberOfIntermediatePositions + 1)
    const intermediateIntervalY = (this.y - this.previousY) / (this.numberOfIntermediatePositions + 1)
    for (let i = this.numberOfIntermediatePositions - 1; i >= 0; --i) {
      this.intermediatePositions[i].x = this.x - intermediateIntervalX * (i + 1)
      this.intermediatePositions[i].y = this.y - intermediateIntervalY * (i + 1)
      this.intermediatePositions[i].row = Math.floor(this.intermediatePositions[i].y / CONFIG.TILE_SIZE)
      this.intermediatePositions[i].col = Math.floor(this.intermediatePositions[i].x / CONFIG.TILE_SIZE)
    }
  }

  private isOffScreen(playerX: number, playerY: number): boolean {
    return (
      this.x < playerX - Canvas.center.x || this.x > playerX + Canvas.center.x ||
      this.y < playerY - Canvas.center.y || this.y > playerY + Canvas.center.y
    )
  }

  private checkCollisionWithGameObject(point?: IntermediatePoint | Projectile): void {
    if (!point) {
      point = this
    }

    const o = gameObjects[point.row][point.col]
    if (o) {
        this.alive = false
        if (o.destructable) {
          gameObjects[point.row][point.col] = null
        }
    }
  }
}
