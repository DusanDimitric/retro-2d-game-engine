import Grid from '@app/domain/Grid'

import Canvas from '@app/infrastructure/Canvas'
import Box from '@app/infrastructure/objects/primitives/Box'
import BoxFactory from '@app/domain/factories/BoxFactory'

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

  private loadMap(map: number[][]): void {
    for (let row = 0; row < map.length; ++row) {
      for (let col = 0; col < map[row].length; ++col) {
        switch (map[row][col]) {
          case 1:
            this.boxes.push(BoxFactory.createBox('#572F17', col, row))
            break
          case 2:
            this.boxes.push(BoxFactory.createBox('#403550', col, row))
            break
          case 3:
            this.boxes.push(BoxFactory.createBox('#27531B', col, row))
            break
        }
      }
    }
  }
}
