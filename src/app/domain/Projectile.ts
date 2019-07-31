import * as CONFIG from '@app/configuration/config.json'
import Canvas from '@app/infrastructure/Canvas'
import { gameObjects } from '@app/domain/map/Map'

export default class Projectile {
  public speed: number = 24
  public alive: boolean
  constructor (
    public x: number,
    public y: number,
    public directionX: number,
    public directionY: number
  )
  {
    this.alive = true
  }

  public update(playerX: number, playerY: number): void {
    this.x += this.directionX * this.speed
    this.y += this.directionY * this.speed
    if (
      this.x < playerX - Canvas.center.x || this.x > playerX + Canvas.center.x ||
      this.y < playerY - Canvas.center.y || this.y > playerY + Canvas.center.y
    )
    {
      this.alive = false
    }

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
