import * as CONFIG from '@app/configuration/config.json'

export default class CollisionBox {
  public halfWidth: number
  public halfHeight: number
  constructor(
    public width: number,
    public height: number,
  ) {
    // TODO: Just a development warning, remove this in production
    if (CONFIG.THROW_DEVELOPMENT_ERRORS) {
      if (width % 2 !== 0 || height % 2 !== 0) {
        throw new Error('Always use even numbers for collision box dimensions!')
      }
    }
    this.halfWidth  = this.width  / 2
    this.halfHeight = this.height / 2
  }
}
