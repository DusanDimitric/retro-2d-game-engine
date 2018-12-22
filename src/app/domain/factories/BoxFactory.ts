import * as CONFIG from '../../configuration/config.json'

import Box from '@app/infrastructure/objects/primitives/Box'

export default class BoxFactory {
  public static createBox(color: string, col: number, row: number): Box {
    return {
      color,
      col,
      row,
      width: CONFIG.TILE_SIZE,
      height: CONFIG.TILE_SIZE,
    }
  }
}
