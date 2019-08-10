export default class CollisionBox {
  public halfWidth: number
  public halfHeight: number
  constructor(
    public width: number,
    public height: number,
  ) {
    this.halfWidth  = this.width  / 2
    this.halfHeight = this.height / 2
  }
}
