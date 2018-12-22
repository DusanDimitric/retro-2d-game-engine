import * as CONFIG from '../../configuration/config.json'

import Box from '@app/infrastructure/objects/primitives/Box'

export default class BoxFactory {
  public static createBox(color: string, row: number, col: number): Box {
    return new Box(
      color,
      row,
      col,
      CONFIG.TILE_SIZE,
      CONFIG.TILE_SIZE,
    )
  }
}
