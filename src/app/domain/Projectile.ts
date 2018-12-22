import * as CONFIG from '@app/configuration/config.json'
import { gameObjects } from '@app/domain/Map'

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

  public update(): void {
    this.x += this.directionX * this.speed
    this.y += this.directionY * this.speed
    if (
      this.x < 0 || this.x > CONFIG.CANVAS_WIDTH ||
      this.y < 0 || this.y > CONFIG.CANVAS_HEIGHT
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
            this.x >= o.x && this.x <= o.x + o.width &&
            this.y >= o.y && this.y <= o.y + o.height
          )
          {
            this.alive = false
            gameObjects[row][col] = null
          }
        }
      }
    }
  }
}
