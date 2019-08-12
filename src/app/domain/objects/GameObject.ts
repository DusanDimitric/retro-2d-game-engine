import * as CONFIG from '@app/configuration/config.json'

export default abstract class GameObject {
  public x: number
  public y: number
  public mapX: number
  public mapY: number

  constructor(
    public row: number,
    public col: number,
    public width: number,
    public height: number,
    public color: string,
    public destructable: boolean = true,
  ) {
    this.mapX = col * CONFIG.TILE_SIZE
    this.mapY = row * CONFIG.TILE_SIZE
  }

  public abstract draw(): void
  public abstract takeDamage(damageAmount: number): void
}
