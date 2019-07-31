import * as CONFIG from '@app/configuration/config.json'

import Grid from '@app/domain/Grid'

import Player from '@app/domain/player/Player'
import Canvas from '@app/infrastructure/Canvas'
import GameObject from '@app/domain/objects/GameObject'
import GameObjectFactory from '@app/domain/objects/GameObjectFactory'

import * as Map01 from '@app/resources/maps/Map-01.json'

export const gameObjects: GameObject[][] = []

export default class Map {
  constructor(private grid: Grid, private player: Player) {
    this.loadMap(Map01)
  }

  public draw(): void {
    const offsetLeft = this.player.deltas.dxLeft - Canvas.colRemainder
    const offsetTop  = this.player.deltas.dyTop  - Canvas.rowRemainder

    const rowStart = this.player.row - Canvas.halfRows
    const colStart = this.player.col - Canvas.halfCols
    let gameObject
    for (let row = rowStart; row < rowStart + Canvas.rows + 1; ++row) {
      for (let col = colStart - 1; col < colStart + Canvas.cols + 1; ++col) {
        if (gameObjects[row] && gameObjects[row][col]) {
          gameObject = gameObjects[row][col]
          gameObject.x = (col - colStart) * CONFIG.TILE_SIZE - offsetLeft
          gameObject.y = (row - rowStart) * CONFIG.TILE_SIZE - offsetTop
          gameObject.draw()
        }
      }
    }
  }

  private loadMap(map: number[][]): void {
    for (let row = 0; row < map.length; ++row) {
      gameObjects[row] = []
      for (let col = 0; col < map[row].length; ++col) {
        gameObjects[row][col] = GameObjectFactory.createGameObject(row, col, map[row][col])
      }
    }
  }
}
