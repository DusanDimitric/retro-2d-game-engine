import Grid from '@app/domain/Grid'

import Canvas from '@app/infrastructure/Canvas'
import Box from '@app/infrastructure/objects/primitives/Box'

export default class Map {
  private tiles: { [key: number]: Box } = {
    0: {
      color: '#572F17',
      row: 0,
      col: 0,
    },
    1: {
      color: '#403550',
      row: 0,
      col: 0,
    },
    2: {
      color: '#27531B',
      row: 0,
      col: 0,
    }
  }
  constructor(
    private grid: Grid
  ) {}

  draw() {
    const rect: Box = this.tiles[0]

    let tile
    for (let row = 0; row < this.grid.rows; ++row) {
      for (let col = 0; col < this.grid.cols; ++col) {

        // TODO: Turn tiles into objects
        if (Math.random() > 0.8 ? 1 : 0) {
          tile = this.tiles[Math.round(Math.random() * 1.7)]
          tile.row = row
          tile.col = col
          Canvas.drawRect(tile)
        }
      }
    }
  }
}
