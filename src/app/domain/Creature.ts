import * as CONFIG from '@app/configuration/config.json'

import CollisionBox from '@app/infrastructure/CollisionBox'

import { gameObjects } from '@app/domain/map/Map'

export default abstract class Creature {
  public x: number
  public y: number
  public row: number
  public col: number

  public moving = {
    left  : false,
    right : false,
    up    : false,
    down  : false,
  }
  public deltas = {
    dyTop    : 0,
    dyBottom : 0,
    dxLeft   : 0,
    dxRight  : 0,
  }
  protected collisionBox: CollisionBox

  protected adjustCollisionWithGameObjects(): void {
    let o
    if (gameObjects[this.row]) {
      if (this.moving.left) {
        o = gameObjects[this.row][this.col - 1] // West
        if (o && this.x - this.collisionBox.halfWidth <= o.mapX + o.width) {
          this.x = o.mapX + o.width + this.collisionBox.halfWidth + 1
        }

        const SWVertexRow = Math.floor((this.y + this.collisionBox.halfHeight - 1) / CONFIG.TILE_SIZE)
        if (SWVertexRow && SWVertexRow !== this.row) { // SW vertex overflows the player grid
          o = gameObjects[SWVertexRow][this.col - 1] // South West
          if (o && this.x - this.collisionBox.halfWidth <= o.mapX + o.width) {
            if (!(this.moving.down && this.deltas.dyTop <= this.deltas.dxRight)) {
              this.x = o.mapX + o.width + this.collisionBox.halfWidth + 1
            }
          }
        }

        const NWVertexRow = Math.floor((this.y - this.collisionBox.halfHeight) / CONFIG.TILE_SIZE)
        if (NWVertexRow && NWVertexRow !== this.row) { // NW vertex overflows the player grid
          o = gameObjects[NWVertexRow][this.col - 1] // North West
          if (o && this.x - this.collisionBox.halfWidth <= o.mapX + o.width) {
            if (!(this.moving.up && this.deltas.dyBottom <= this.deltas.dxRight)) {
              this.x = o.mapX + o.width + this.collisionBox.halfWidth + 1
            }
          }
        }
      }
      if (this.moving.right) {
        o = gameObjects[this.row][this.col + 1] // East
        if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
          this.x = o.mapX - this.collisionBox.halfWidth - 1
        }

        const SEVertexRow = Math.floor((this.y + this.collisionBox.halfHeight - 1) / CONFIG.TILE_SIZE)
        if (SEVertexRow && SEVertexRow !== this.row) { // SE vertex overflows the player grid
          o = gameObjects[SEVertexRow][this.col + 1] // South East
          if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
            if (!(this.moving.down && this.deltas.dyTop <= this.deltas.dxLeft)) {
              this.x = o.mapX - this.collisionBox.halfWidth - 1
            }
          }
        }

        const NEVertexRow = Math.floor((this.y - this.collisionBox.halfHeight) / CONFIG.TILE_SIZE)
        if (SEVertexRow && NEVertexRow !== this.row) { // NE vertex overflows the player grid
          o = gameObjects[NEVertexRow][this.col + 1] // North East
          if (o && this.x + this.collisionBox.halfWidth >= o.mapX) {
            if (!(this.moving.up && this.deltas.dyBottom <= this.deltas.dxLeft)) {
              this.x = o.mapX - this.collisionBox.halfWidth - 1
            }
          }
        }
      }
    }
    if (gameObjects[this.row - 1]) {
      if (this.moving.up) {
        o = gameObjects[this.row - 1][this.col] // North
        if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
          this.y = o.mapY + o.height + this.collisionBox.halfHeight + 1
        }

        const NEVertexCol = Math.floor((this.x + this.collisionBox.halfWidth - 1) / CONFIG.TILE_SIZE)
        if (NEVertexCol && NEVertexCol !== this.col) { // NE vertex overflows the player grid
          o = gameObjects[this.row - 1][NEVertexCol] // North East
          if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
            if (!(this.moving.right && this.deltas.dyBottom > this.deltas.dxLeft)) {
              this.y = o.mapY + o.height + this.collisionBox.halfHeight + 1
            }
          }
        }

        const NWVertexCol = Math.floor((this.x - this.collisionBox.halfWidth) / CONFIG.TILE_SIZE)
        if (NWVertexCol && NWVertexCol !== this.col) { // NW vertex overflows the player grid
          o = gameObjects[this.row - 1][NWVertexCol] // North West
          if (o && this.y - this.collisionBox.halfHeight <= o.mapY + o.height) {
            if (!(this.moving.left && this.deltas.dyBottom > this.deltas.dxRight)) {
              this.y = o.mapY + o.height + this.collisionBox.halfHeight + 1
            }
          }
        }
      }
    }
    if (gameObjects[this.row + 1]) {
      if (this.moving.down) {
        o = gameObjects[this.row + 1][this.col] // South
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          this.y = o.mapY - this.collisionBox.halfHeight - 1
        }
      }

      const SEVertexCol = Math.floor((this.x + this.collisionBox.halfWidth - 1) / CONFIG.TILE_SIZE)
      if (SEVertexCol && SEVertexCol !== this.col) { // SE vertex overflows the player grid
        o = gameObjects[this.row + 1][SEVertexCol] // South East
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          if (!(this.moving.right && this.deltas.dyTop > this.deltas.dxLeft)) {
            this.y = o.mapY - this.collisionBox.halfHeight - 1
          }
        }
      }

      const SWVertexCol = Math.floor((this.x - this.collisionBox.halfWidth) / CONFIG.TILE_SIZE)
      if (SWVertexCol && SWVertexCol !== this.col) { // SW vertex overflows the player grid
        o = gameObjects[this.row + 1][SWVertexCol] // South West
        if (o && this.y + this.collisionBox.halfHeight >= o.mapY) {
          if (!(this.moving.left && this.deltas.dyTop > this.deltas.dxRight)) {
            this.y = o.mapY - this.collisionBox.halfHeight - 1
          }
        }
      }
    }
  }
}