import * as CONFIG from '@app/configuration/config.json'

import { NeighbourTiles } from '@app/domain/Grid'
import Point, { pointToPointDistance } from '@app/infrastructure/geometry/Point'
import CollisionBox from '@app/infrastructure/CollisionBox'
import Canvas, { context } from '@app/infrastructure/Canvas'
import Raycaster from './Raycaster'

import { gameObjects } from '@app/domain/map/Map'
import GameObject from '@app/domain/objects/GameObject'
import Player from '@app/domain/player/Player'
import Enemy from '@app/domain/enemies/Enemy'
import RaycastablePoint from './geometry/RaycastablePoint'

const PATH_NODE_OFFSET = 2

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
  const neighbours: NeighbourTiles = {
    N  : gameObjects[o.row - 1] ? gameObjects[o.row - 1][o.col    ] : null,
    NE : gameObjects[o.row - 1] ? gameObjects[o.row - 1][o.col + 1] : null,
    E  : gameObjects[o.row    ] ? gameObjects[o.row    ][o.col + 1] : null,
    SE : gameObjects[o.row + 1] ? gameObjects[o.row + 1][o.col + 1] : null,
    S  : gameObjects[o.row + 1] ? gameObjects[o.row + 1][o.col    ] : null,
    SW : gameObjects[o.row + 1] ? gameObjects[o.row + 1][o.col - 1] : null,
    W  : gameObjects[o.row    ] ? gameObjects[o.row    ][o.col - 1] : null,
    NW : gameObjects[o.row - 1] ? gameObjects[o.row - 1][o.col - 1] : null,
  }

  let nodeNE: PathNode = generateNodeNE(o, neighbours, cBox)
  let nodeSE: PathNode = generateNodeSE(o, neighbours, cBox)
  let nodeSW: PathNode = generateNodeSW(o, neighbours, cBox)
  let nodeNW: PathNode = generateNodeNW(o, neighbours, cBox)

  if (nodeNE && (nodeNE.x < 0 || nodeNE.y < 0)) { nodeNE = null }
  if (nodeSE && (nodeSE.x < 0 || nodeSE.y < 0)) { nodeSE = null }
  if (nodeSW && (nodeSW.x < 0 || nodeSW.y < 0)) { nodeSW = null }
  if (nodeNW && (nodeNW.x < 0 || nodeNW.y < 0)) { nodeNW = null }

  // Don't allow duplicate PathNodes
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

function generateNodeNE(o: GameObject, neighbours: NeighbourTiles, cBox: CollisionBox): PathNode {
  if (neighbours.NE) {
    return null
  }
  else {
    if (!neighbours.N && !neighbours.E) {
      return new PathNode({
        x:  PATH_NODE_OFFSET + o.mapX + o.width + cBox.halfWidth,
        y: -PATH_NODE_OFFSET + o.mapY - cBox.halfHeight,
      }, cBox)
    }
    if (neighbours.N && !neighbours.E) {
      return new PathNode({
        x: PATH_NODE_OFFSET + o.mapX + o.width + cBox.halfWidth,
        y: o.mapY,
      }, cBox)
    }
    if (!neighbours.N && neighbours.E) {
      return new PathNode({
        x: o.mapX + o.width,
        y: -PATH_NODE_OFFSET + o.mapY - cBox.halfHeight,
      }, cBox)
    }
  }
}
function generateNodeSE(o: GameObject, neighbours: NeighbourTiles, cBox: CollisionBox): PathNode {
  if (neighbours.SE) {
    return null
  }
  else {
    if (!neighbours.S && !neighbours.E) {
      return new PathNode({
        x: PATH_NODE_OFFSET + o.mapX + o.width  + cBox.halfWidth,
        y: PATH_NODE_OFFSET +o.mapY + o.height + cBox.halfHeight,
      }, cBox)
    }
    if (neighbours.S && !neighbours.E) {
      return new PathNode({
        x: PATH_NODE_OFFSET + o.mapX + o.width  + cBox.halfWidth,
        y: o.mapY + o.height,
      }, cBox)
    }
    if (!neighbours.S && neighbours.E) {
      return new PathNode({
        x: o.mapX + o.width,
        y: PATH_NODE_OFFSET + o.mapY + o.height + cBox.halfHeight,
      }, cBox)
    }
  }
}
function generateNodeSW(o: GameObject, neighbours: NeighbourTiles, cBox: CollisionBox): PathNode {
  if (neighbours.SW) {
    return null
  }
  else {
    if (!neighbours.S && !neighbours.W) {
      return new PathNode({
        x: -PATH_NODE_OFFSET + o.mapX - cBox.halfWidth,
        y:  PATH_NODE_OFFSET + o.mapY + o.height + cBox.halfHeight,
      }, cBox)
    }
    if (neighbours.S && !neighbours.W) {
      return new PathNode({
        x: -PATH_NODE_OFFSET + o.mapX - cBox.halfWidth,
        y: o.mapY + o.height,
      }, cBox)
    }
    if (!neighbours.S && neighbours.W) {
      return new PathNode({
        x: o.mapX,
        y: PATH_NODE_OFFSET + o.mapY + o.height + cBox.halfHeight,
      }, cBox)
    }
  }
}
function generateNodeNW(o: GameObject, neighbours: NeighbourTiles, cBox: CollisionBox): PathNode {
  if (neighbours.NW) {
    return null
  }
  else {
    if (!neighbours.N && !neighbours.W) {
      return new PathNode({
        x: -PATH_NODE_OFFSET + o.mapX - cBox.halfWidth,
        y: -PATH_NODE_OFFSET + o.mapY - cBox.halfHeight,
      }, cBox)
    }
    if (neighbours.N && !neighbours.W) {
      return new PathNode({
        x: -PATH_NODE_OFFSET + o.mapX - cBox.halfWidth,
        y: o.mapY,
      }, cBox)
    }
    if (!neighbours.N && neighbours.W) {
      return new PathNode({
        x: o.mapX,
        y: -PATH_NODE_OFFSET + o.mapY - cBox.halfHeight,
      }, cBox)
    }
  }
}

export function drawPathNodes(path: PathNode[], player: Player, color: string): void {
  if (path) {
    path.forEach(node => drawNode(node, player, color))
  }
}

export function drawNode(node: PathNode, player: Player, color: string): void {
  context.strokeStyle = color
  context.lineWidth = 0.1
  context.beginPath()
    // Since this is just for debugging purposes, there is no need to
    // optimize/cache the vertex calculations.
    context.moveTo( 0.5 + Canvas.center.x + (node.x - player.x) - node.collisionBox.halfWidth,  0.5 + Canvas.center.y + (node.y - player.y) - node.collisionBox.halfHeight)
    context.lineTo(-0.5 + Canvas.center.x + (node.x - player.x) + node.collisionBox.halfWidth,  0.5 + Canvas.center.y + (node.y - player.y) - node.collisionBox.halfHeight)
    context.lineTo(-0.5 + Canvas.center.x + (node.x - player.x) + node.collisionBox.halfWidth, -0.5 + Canvas.center.y + (node.y - player.y) + node.collisionBox.halfHeight)
    context.lineTo( 0.5 + Canvas.center.x + (node.x - player.x) - node.collisionBox.halfWidth, -0.5 + Canvas.center.y + (node.y - player.y) + node.collisionBox.halfHeight)
    context.lineTo( 0.5 + Canvas.center.x + (node.x - player.x) - node.collisionBox.halfWidth,  0.5 + Canvas.center.y + (node.y - player.y) - node.collisionBox.halfHeight)
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

export function findShortestPath(enemy: Enemy, player: Player, pathfindingNodes: PathNode[]): PathNode[] {
  const nodeGoal  = new PathNode(player, player.collisionBox)
  const nodeStart = new PathNode(enemy,  enemy.collisionBox)

  pathfindingNodes.push(nodeGoal)

  nodeStart.f = 0
  nodeStart.g = nodeStart.heuristic(nodeGoal)

  const nodesNotTested: PathNode[] = [ nodeStart ]

  let nodeCurrent: PathNode

  while (nodesNotTested.length > 0 || nodeCurrent === nodeGoal) {
    nodesNotTested.sort((a: PathNode, b: PathNode) => a.g - b.g)

    while (nodesNotTested.length > 0 && nodesNotTested[0].visited === true) {
      nodesNotTested.shift()
    }

    if (nodesNotTested.length <= 0) {
      break
    }

    nodeCurrent = nodesNotTested.shift()
    nodeCurrent.visited = true

    // Get neighbour nodes.
    nodeCurrent.neighbourNodes = [ ...pathfindingNodes ]
      .filter(node => {
        return Raycaster.determineIfThereAreObstaclesBetweenTwoPathNodes(nodeCurrent, node) === false
      })

    nodeCurrent.neighbourNodes
      .map(node => {
        if (node.visited === false) {
          nodesNotTested.push(node)
        }

        // Calculate local goal
        const possiblyLowerLocalGoal = nodeCurrent.f + pointToPointDistance(nodeCurrent, node)

        if (possiblyLowerLocalGoal < node.f) {
          node.parent = nodeCurrent
          node.f = possiblyLowerLocalGoal
          node.g = node.f + node.heuristic(nodeGoal)
        }

        return node
      })
  }

  const path = []
  if (nodeGoal.parent) {
    let n: PathNode = nodeGoal
    while (n.parent) {
      path.push(n)
      n = n.parent
    }
  }
  return path
}

export class PathNode implements RaycastablePoint {
  public x: number
  public y: number
  public row: number
  public col: number
  public deltas = {
    dyTop    : 0,
    dyBottom : 0,
    dxLeft   : 0,
    dxRight  : 0,
  }
  public collisionBox: CollisionBox

  public visited: boolean = false
  public g: number = Infinity // Global goal
  public f: number = Infinity // Local goal
  public parent: PathNode = null
  public neighbourNodes: PathNode[]

  constructor(coordinates: Point, cBox: CollisionBox) {
    this.x = coordinates.x
    this.y = coordinates.y
    this.collisionBox = new CollisionBox(cBox.width, cBox.height)
    this.updateTileDeltas()
    this.updateMapPosition()
  }

  public heuristic(nodeGoal: PathNode): number {
    return pointToPointDistance(this, nodeGoal)
  }

  // TODO: Compose this functionality since it's shared between enemies and player
  private updateTileDeltas(): void {
    this.deltas.dyTop = this.y % CONFIG.TILE_SIZE
    this.deltas.dyBottom = CONFIG.TILE_SIZE - this.deltas.dyTop
    this.deltas.dxLeft = this.x % CONFIG.TILE_SIZE
    this.deltas.dxRight = CONFIG.TILE_SIZE - this.deltas.dxLeft
  }

  // TODO: Not DRY... generalize this functionality
  private updateMapPosition(): void {
    this.row = Math.floor(this.y / CONFIG.TILE_SIZE)
    this.col = Math.floor(this.x / CONFIG.TILE_SIZE)
  }
}
