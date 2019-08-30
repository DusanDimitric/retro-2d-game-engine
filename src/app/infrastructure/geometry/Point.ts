import * as CONFIG from '@app/configuration/config.json'

export default interface Point {
  x: number
  y: number
  row?: number
  col?: number
  deltas?: {
    dyTop    : number
    dyBottom : number
    dxLeft   : number
    dxRight  : number
  }
}

export function pointToPointDistance(p1: Point, p2: Point) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y))
}

export function angleBetweenPoints(p1: Point, p2: Point): number {
  const theta = Math.atan2((p1.y - p2.y), (p1.x - p2.x))
  return theta
}

export function updatePointRowAndColValues(p: Point): void {
  p.row = Math.floor(p.y / CONFIG.TILE_SIZE)
  p.col = Math.floor(p.x / CONFIG.TILE_SIZE)
}

export function updatePointDeltas(p: Point): void {
  p.deltas.dyTop = p.y % CONFIG.TILE_SIZE
  p.deltas.dyBottom = CONFIG.TILE_SIZE - p.deltas.dyTop
  p.deltas.dxLeft = p.x % CONFIG.TILE_SIZE
  p.deltas.dxRight = CONFIG.TILE_SIZE - p.deltas.dxLeft
}
