import * as CONFIG from '@app/configuration/config.json'

export default class Grid {
  rows: number = CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE
  cols: number = CONFIG.CANVAS_WIDTH  / CONFIG.TILE_SIZE
}
