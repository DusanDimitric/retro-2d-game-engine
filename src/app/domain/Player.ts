import Canvas from '@app/infrastructure/Canvas'

export default class Player {
  public rotation: number = 0
  public moving = {
    left  : false,
    right : false,
    up    : false,
    down  : false,
  }
  private maxSpeed = 3

  constructor(public x: number, public y: number) {}

  public update(): void {
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

  public draw(): void {
    Canvas.drawPlayer(this)
  }
}
