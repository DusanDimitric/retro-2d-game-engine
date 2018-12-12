import Grid from '@app/domain/Grid'

import Canvas from '@app/infrastructure/Canvas'
import Box from '@app/infrastructure/objects/primitives/Box'

import * as Map01 from '@app/resources/maps/Map-01.json'

export default class Map {
  private boxes: Box[] = []

  constructor(private grid: Grid) {
    this.loadMap(Map01)
  }

  public draw(): void {
    this.boxes.forEach((box: Box) => {
      Canvas.drawBox(box)
    })
  }

  private loadMap(map: number[]): void {
    if (this.grid.rows * this.grid.cols !== map.length) {
      console.error(`Expected - columns: ${this.grid.cols}, rows: ${this.grid.rows}`)
      throw new Error(`Invalid Map file: ${map}`)
    }

    let row: number, col: number
    for (let i = 0; i < map.length; ++i) {
      col = i % this.grid.cols
      row = Math.floor(i / this.grid.cols)
      switch (map[i]) {
        case 1:
          this.boxes.push({
            color: '#572F17',
            col,
            row
          })
          break
        case 2:
          this.boxes.push({
            color: '#403550',
            col,
            row
          })
          break
        case 3:
          this.boxes.push({
            color: '#27531B',
            col,
            row
          })
          break
      }
    }
  }
}
