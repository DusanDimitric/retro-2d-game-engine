import * as CONFIG from '@app/configuration/config.json'
import Canvas from '@app/infrastructure/Canvas'
import { gameObjects } from '@app/domain/map/Map'

export default class Projectile {
  public speed: number = 24
  public alive: boolean = true
  constructor (
    public x: number,
    public y: number,
    public directionX: number,
    public directionY: number,
  ) {}

  public update(playerX: number, playerY: number): void {
    this.x += this.directionX * this.speed
    this.y += this.directionY * this.speed
    if (this.isOffScreen(playerX, playerY)) {
      this.alive = false
    }

    this.checkCollisionWithGameObject()
  }

  private isOffScreen(playerX: number, playerY: number): boolean {
    return (
      this.x < playerX - Canvas.center.x || this.x > playerX + Canvas.center.x ||
      this.y < playerY - Canvas.center.y || this.y > playerY + Canvas.center.y
    )
  }

  private checkCollisionWithGameObject(): void {
    let o
    for (let row = 0; row < gameObjects.length; ++row) {
      for (let col = 0; col < gameObjects[row].length; ++col) {
        o = gameObjects[row][col]
        if (o) {
          if (
            this.x >= o.mapX && this.x <= o.mapX + o.width &&
            this.y >= o.mapY && this.y <= o.mapY + o.height
          )
          {
            this.alive = false
            if (gameObjects[row][col].destructable) {
              gameObjects[row][col] = null
            }
          }
        }
      }
    }
  }
}
