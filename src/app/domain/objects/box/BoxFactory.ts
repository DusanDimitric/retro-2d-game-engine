import * as CONFIG from '@app/configuration/config.json'

import Box from '@app/domain/objects/box/Box'
import MapKeys from '@app/domain/map/MapKeys'

export default class BoxFactory {
  public static createBox(row: number, col: number, mapKey: MapKeys): Box {
    switch (mapKey) {
      case MapKeys.BoxGray:
        return new Box(row, col, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, '#4B4B4B', false)
      case MapKeys.BoxGreen:
        return new Box(row, col, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, '#27531B')
      case MapKeys.BoxBlue:
        return new Box(row, col, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, '#572F17')
      default:
        throw new Error('No such box!')
    }
  }
}
