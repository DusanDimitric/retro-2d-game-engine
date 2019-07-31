import * as CONFIG from '@app/configuration/config.json'

import Box from '@app/domain/objects/box/Box'
import MapLegend from '@app/domain/map/MapLegend'

export default class BoxFactory {
  public static createBox(row: number, col: number, mapObject: string): Box {
    switch (mapObject) {
      // case MapLegend.GrayBox:
      case 'BoxGray':
        return new Box(row, col, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, '#4B4B4B', false)
      case 'BoxGreen':
        return new Box(row, col, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, '#27531B')
      case 'BoxBlue':
        return new Box(row, col, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, '#572F17')
      // TODO: Default case ? throw error?
    }
  }
}
