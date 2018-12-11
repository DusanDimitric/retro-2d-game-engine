import * as CONFIG from '@app/configuration/config.json'

import Box from './objects/primitives/Box'

const canvas = <HTMLCanvasElement> document.getElementById('canvas')
canvas.width  = CONFIG.CANVAS_WIDTH  + 1
canvas.height = CONFIG.CANVAS_HEIGHT + 1
canvas.style.width  = CONFIG.SCALE !== 1 ? (CONFIG.SCALE * CONFIG.CANVAS_WIDTH ) + 'px' : 'auto'
canvas.style.height = CONFIG.SCALE !== 1 ? (CONFIG.SCALE * CONFIG.CANVAS_HEIGHT) + 'px' : 'auto'
const context = canvas.getContext('2d')

export default class Canvas {
  static drawRect(rect: Box): void {
    context.strokeStyle = rect.color
    context.lineWidth = 1
    context.beginPath()
      context.moveTo(0.5 + rect.row * CONFIG.TILE_SIZE,                    0.5 + rect.col * CONFIG.TILE_SIZE)
      context.lineTo(0.5 + rect.row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE, 0.5 + rect.col * CONFIG.TILE_SIZE)
      context.lineTo(0.5 + rect.row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE, 0.5 + rect.col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE)
      context.lineTo(0.5 + rect.row * CONFIG.TILE_SIZE                   , 0.5 + rect.col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE)
      context.lineTo(0.5 + rect.row * CONFIG.TILE_SIZE,                    0.5 + rect.col * CONFIG.TILE_SIZE)

      context.moveTo(0.5 + rect.row * CONFIG.TILE_SIZE,                    0.5 + rect.col * CONFIG.TILE_SIZE)
      context.lineTo(0.5 + rect.row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE, 0.5 + rect.col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE)
      context.moveTo(0.5 + rect.row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE, 0.5 + rect.col * CONFIG.TILE_SIZE)
      context.lineTo(0.5 + rect.row * CONFIG.TILE_SIZE,                    0.5 + rect.col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE)
    context.stroke()
  }
}
