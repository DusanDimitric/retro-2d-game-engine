import * as CONFIG from '@app/configuration/config.json'
import * as Map01 from '@app/resources/maps/map-01.json'

export default class Grid {
  map: number[][] = []
  rows: number = CONFIG.CANVAS_WIDTH / CONFIG.TILE_SIZE
  cols: number = CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE

  constructor() {
    this.initializeGrid()
    this.loadMap(Map01)
  }
  
  private initializeGrid() {
    for (let row = 0; row < this.rows; ++row) {
      this.map.push([])
      for (let col = 0; col < this.cols; ++col) {
        this.map[row][col] = 0
      }
    }
  }

  private loadMap(map: number[]) {
    if (this.rows * this.cols !== map.length) {
      console.error(`Expected - columns: ${this.cols}, rows: ${this.rows}`)
      throw new Error(`Invalid Map file: ${map}`)
    }

    let row, col
    for (let i = 0; i < map.length; ++i) {
      col = i % this.cols
      row = Math.floor(i / this.cols)
      this.map[row][col] = map[i]
    }
  }
}
