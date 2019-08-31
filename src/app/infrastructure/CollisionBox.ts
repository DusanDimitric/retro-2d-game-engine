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

interface ICollidable {
  x: number
  y: number
  collisionBox: CollisionBox
}
export function collisionBoxesIntersect(a: ICollidable, b: ICollidable): boolean {
  return (
    a.x - a.collisionBox.halfWidth  < b.x + b.collisionBox.halfWidth  &&
    a.x + a.collisionBox.halfWidth  > b.x - b.collisionBox.halfWidth  &&
    a.y - a.collisionBox.halfHeight < b.y + b.collisionBox.halfHeight &&
    a.y + a.collisionBox.halfHeight > b.y - b.collisionBox.halfHeight
  )
}