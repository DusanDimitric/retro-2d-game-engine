import * as CONFIG from '@app/configuration/config.json'

import Grid from '@app/domain/Grid'

import Player from '@app/domain/player/Player'
import Enemy from '@app/domain/enemies/Enemy'
import Canvas from '@app/infrastructure/Canvas'
import GameObject from '@app/domain/objects/GameObject'
import GameObjectFactory from '@app/domain/objects/GameObjectFactory'

import IMap from './IMap'
import * as Map01 from '@app/resources/maps/Map-01.json'

export const gameObjects: GameObject[][] = []
export const enemies: Enemy[] = []

export default class Map {
  constructor(private grid: Grid, private player: Player) {
    this.loadMap(Map01)
  }

  public update(): void {
    enemies.forEach((e, i) => {
      e.update()
      if (e.alive === false) {
        enemies.splice(i, 1) // Remove the enemy
      }
    })
  }

  public draw(): void {
    this.drawGameObjects()
    enemies.forEach(e => e.draw(this.player))
  }

  private drawGameObjects(): void {
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

  private loadMap(map: IMap): void {
    for (let row = 0; row < map.gameObjects.length; ++row) {
      gameObjects[row] = []
      for (let col = 0; col < map.gameObjects[row].length; ++col) {
        gameObjects[row][col] = GameObjectFactory.createGameObject(row, col, map.gameObjects[row][col])
      }
    }

    map.enemies.forEach(e => enemies.push(new Enemy(e.x, e.y, e.healthPercentage)))
  }
}
