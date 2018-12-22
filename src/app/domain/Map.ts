import * as CONFIG from '@app/configuration/config.json'

import Grid from '@app/domain/Grid'

import Player from '@app/domain/Player'
import Canvas from '@app/infrastructure/Canvas'
import GameObject from '@app/infrastructure/objects/GameObject'
import BoxFactory from '@app/domain/factories/BoxFactory'

import * as Map01 from '@app/resources/maps/Map-01.json'

export default class Map {
  private gameObjects: Array<GameObject[]> = []

  constructor(private grid: Grid, private player: Player) {
    this.loadMap(Map01)
  }

  public draw(): void {
    const offsetLeft = this.player.x % CONFIG.TILE_SIZE - Canvas.colRemainder
    const offsetTop  = this.player.y % CONFIG.TILE_SIZE - Canvas.rowRemainder
    const rowStart = this.player.row - Canvas.halfRows
    const colStart = this.player.col - Canvas.halfCols
    let gameObject
    for (let row = rowStart; row < rowStart + Canvas.rows + 1; ++row) {
      for (let col = colStart; col < colStart + Canvas.cols + 1; ++col) {
        if (this.gameObjects[row] && this.gameObjects[row][col]) {
          gameObject = this.gameObjects[row][col]
          gameObject.x = (col - colStart) * CONFIG.TILE_SIZE - offsetLeft
          gameObject.y = (row - rowStart) * CONFIG.TILE_SIZE - offsetTop
          gameObject.draw()
        }
      }
    }
  }

  private loadMap(map: number[][]): void {
    for (let row = 0; row < map.length; ++row) {
      this.gameObjects[row] = []
      for (let col = 0; col < map[row].length; ++col) {
        switch (map[row][col]) {
          case 1:
            this.gameObjects[row][col] = BoxFactory.createBox('#572F17', row, col)
            break
          case 2:
            this.gameObjects[row][col] = BoxFactory.createBox('#403550', row, col)
            break
          case 3:
            this.gameObjects[row][col] = BoxFactory.createBox('#27531B', row, col)
            break
          default:
            this.gameObjects[row][col] = null
        }
      }
    }
  }
}
