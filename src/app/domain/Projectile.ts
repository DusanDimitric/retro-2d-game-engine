export default class Projectile {
  public speed: number = 14
  constructor (
    public x: number,
    public y: number,
    public directionX: number,
    public directionY: number
  ) {}
}
