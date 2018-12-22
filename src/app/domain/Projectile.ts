import * as CONFIG from '@app/configuration/config.json'

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
  }
}
