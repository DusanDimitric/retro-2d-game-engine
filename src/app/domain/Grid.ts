import * as CONFIG from '@app/configuration/config.json'

// TODO: This class is useless?
export default class Grid {
  public rows: number = CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE
  public cols: number = CONFIG.CANVAS_WIDTH  / CONFIG.TILE_SIZE
}

export interface NeighbourTiles {
    N  : (any | null)
    NE : (any | null)
    E  : (any | null)
    SE : (any | null)
    S  : (any | null)
    SW : (any | null)
    W  : (any | null)
    NW : (any | null)
}