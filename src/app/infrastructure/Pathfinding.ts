import * as CONFIG from '@app/configuration/config.json'

import { Directions } from '@app/domain/Grid'
import Point from '@app/infrastructure/geometry/Point'
import CollisionBox from '@app/infrastructure/CollisionBox'
import Canvas, { context } from '@app/infrastructure/Canvas'

import { gameObjects } from '@app/domain/map/Map'
import GameObject from '@app/domain/objects/GameObject'
import Player from '@app/domain/player/Player'
import Enemy from '@app/domain/enemies/Enemy'

/**
 *   o      o     o      o   o     o     o
 *     ----         ----       ---- ----
 *    |    |       |    |     |    |    |
 *     ----       o ---- o     ---- ----
 *   o      o      |    |    o     o     o
 *                  ----
 *                o      o
 *
 *      o     o     o          o      o
 *        ---- ----              ----
 *       |    |    |      o   o |    |
 *      o ---- ---- o       ---- ----
 *       |    | o          |    | o   o
 *        ----              ----
 *      o      o          o      o
 */
// TODO: cache path nodes for same collision box dimensions || don't generate path nodes every frame
export function generatePathNodes(startRow: number, startCol: number, cBox: CollisionBox): PathNode[] {
  const path: PathNode[] = []

  const rowOffset = 3
  const colOffset = 2
  let rowStart = startRow - Canvas.halfRows - rowOffset
  let colStart = startCol - Canvas.halfCols - colOffset
  const rowEnd = startRow + Canvas.halfRows + rowOffset
  const colEnd = startCol + Canvas.halfCols + colOffset

  if (rowStart < 0) { rowStart = 0 }
  if (colStart < 0) { colStart = 0 }

  for (let row = rowStart; row < rowEnd; ++row) {
    for (let col = colStart - 1; col < colEnd; ++col) {
      if (!gameObjects[row] || !gameObjects[row][col]) { continue }
      generateNodesAroundGameObject(path, gameObjects[row][col], cBox)
    }
  }

  return path
}

function generateNodesAroundGameObject(path: PathNode[], o: GameObject, cBox: CollisionBox): void {
  const neighbours: Directions = {
    N  : gameObjects[o.row - 1] ? gameObjects[o.row - 1][o.col    ] : null,
    NE : gameObjects[o.row - 1] ? gameObjects[o.row - 1][o.col + 1] : null,
    E  : gameObjects[o.row    ] ? gameObjects[o.row    ][o.col + 1] : null,
    SE : gameObjects[o.row + 1] ? gameObjects[o.row + 1][o.col + 1] : null,
    S  : gameObjects[o.row + 1] ? gameObjects[o.row + 1][o.col    ] : null,
    SW : gameObjects[o.row + 1] ? gameObjects[o.row + 1][o.col - 1] : null,
    W  : gameObjects[o.row    ] ? gameObjects[o.row    ][o.col - 1] : null,
    NW : gameObjects[o.row - 1] ? gameObjects[o.row - 1][o.col - 1] : null,
  }

  let nodeNE = generateNodeNE(o, neighbours, cBox)
  let nodeSE = generateNodeSE(o, neighbours, cBox)
  let nodeSW = generateNodeSW(o, neighbours, cBox)
  let nodeNW = generateNodeNW(o, neighbours, cBox)

  if (nodeNE && (nodeNE.x < 0 || nodeNE.y < 0)) { nodeNE = null }
  if (nodeSE && (nodeSE.x < 0 || nodeSE.y < 0)) { nodeSE = null }
  if (nodeSW && (nodeSW.x < 0 || nodeSW.y < 0)) { nodeSW = null }
  if (nodeNW && (nodeNW.x < 0 || nodeNW.y < 0)) { nodeNW = null }

  path.forEach(node => {
    if (nodeNE && (node.x === nodeNE.x && node.y === nodeNE.y)) { nodeNE = null }
    if (nodeSE && (node.x === nodeSE.x && node.y === nodeSE.y)) { nodeSE = null }
    if (nodeSW && (node.x === nodeSW.x && node.y === nodeSW.y)) { nodeSW = null }
    if (nodeNW && (node.x === nodeNW.x && node.y === nodeNW.y)) { nodeNW = null }
  })

  if (nodeNE) { path.push(nodeNE) }
  if (nodeSE) { path.push(nodeSE) }
  if (nodeSW) { path.push(nodeSW) }
  if (nodeNW) { path.push(nodeNW) }
}

function generateNodeNE(o: GameObject, neighbours: Directions, cBox: CollisionBox): PathNode {
  if (neighbours.NE) {
    return null
  }
  else {
    if (!neighbours.N && !neighbours.E) {
      return new PathNode({
        x: o.mapX + o.width + cBox.halfWidth,
        y: o.mapY - cBox.halfHeight,
      })
    }
    if (neighbours.N && !neighbours.E) {
      return new PathNode({
        x: o.mapX + o.width + cBox.halfWidth,
        y: o.mapY,
      })
    }
    if (!neighbours.N && neighbours.E) {
      return new PathNode({
        x: o.mapX + o.width,
        y: o.mapY - cBox.halfHeight,
      })
    }
  }
}
function generateNodeSE(o: GameObject, neighbours: Directions, cBox: CollisionBox): PathNode {
  if (neighbours.SE) {
    return null
  }
  else {
    if (!neighbours.S && !neighbours.E) {
      return new PathNode({
        x: o.mapX + o.width  + cBox.halfWidth,
        y: o.mapY + o.height + cBox.halfHeight,
      })
    }
    if (neighbours.S && !neighbours.E) {
      return new PathNode({
        x: o.mapX + o.width  + cBox.halfWidth,
        y: o.mapY + o.height,
      })
    }
    if (!neighbours.S && neighbours.E) {
      return new PathNode({
        x: o.mapX + o.width,
        y: o.mapY + o.height + cBox.halfHeight,
      })
    }
  }
}
function generateNodeSW(o: GameObject, neighbours: Directions, cBox: CollisionBox): PathNode {
  if (neighbours.SW) {
    return null
  }
  else {
    if (!neighbours.S && !neighbours.W) {
      return new PathNode({
        x: o.mapX - cBox.halfWidth,
        y: o.mapY + o.height + cBox.halfHeight,
      })
    }
    if (neighbours.S && !neighbours.W) {
      return new PathNode({
        x: o.mapX - cBox.halfWidth,
        y: o.mapY + o.height,
      })
    }
    if (!neighbours.S && neighbours.W) {
      return new PathNode({
        x: o.mapX,
        y: o.mapY + o.height + cBox.halfHeight,
      })
    }
  }
}
function generateNodeNW(o: GameObject, neighbours: Directions, cBox: CollisionBox): PathNode {
  if (neighbours.NW) {
    return null
  }
  else {
    if (!neighbours.N && !neighbours.W) {
      return new PathNode({
        x: o.mapX - cBox.halfWidth,
        y: o.mapY - cBox.halfHeight,
      })
    }
    if (neighbours.N && !neighbours.W) {
      return new PathNode({
        x: o.mapX - cBox.halfWidth,
        y: o.mapY,
      })
    }
    if (!neighbours.N && neighbours.W) {
      return new PathNode({
        x: o.mapX,
        y: o.mapY - cBox.halfHeight,
      })
    }
  }
}

export function drawPathNodes(path: PathNode[], cBox: CollisionBox, player: Player, color: string): void {
  if (path) {
    path.forEach(node => drawNode(node, cBox, player, color))
  }
}

function drawNode(node: PathNode, cBox: CollisionBox, player: Player, color: string): void {
  context.strokeStyle = color
  context.lineWidth = 0.1
  context.beginPath()
    // Since this is just for debugging purposes, there is no need to
    // optimize/cache the vertex calculations.
    context.moveTo( 0.5 + Canvas.center.x + (node.x - player.x) - cBox.halfWidth,  0.5 + Canvas.center.y + (node.y - player.y) - cBox.halfHeight)
    context.lineTo(-0.5 + Canvas.center.x + (node.x - player.x) + cBox.halfWidth,  0.5 + Canvas.center.y + (node.y - player.y) - cBox.halfHeight)
    context.lineTo(-0.5 + Canvas.center.x + (node.x - player.x) + cBox.halfWidth, -0.5 + Canvas.center.y + (node.y - player.y) + cBox.halfHeight)
    context.lineTo( 0.5 + Canvas.center.x + (node.x - player.x) - cBox.halfWidth, -0.5 + Canvas.center.y + (node.y - player.y) + cBox.halfHeight)
    context.lineTo( 0.5 + Canvas.center.x + (node.x - player.x) - cBox.halfWidth,  0.5 + Canvas.center.y + (node.y - player.y) - cBox.halfHeight)
  context.stroke()

  context.beginPath()
    context.arc(
      Canvas.center.x + (node.x - player.x),
      Canvas.center.y + (node.y - player.y),
      1,
      0,
      (2 * Math.PI)
    )
  context.stroke()
}

export function findShortestPath(): void {

}

export class PathNode implements Point {
  public x: number
  public y: number
  constructor(coordinates: Point) {
    this.x = coordinates.x
    this.y = coordinates.y
  }
}
