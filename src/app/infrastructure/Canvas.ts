import * as CONFIG from '@app/configuration/config.json'

import Player from '@app/domain/Player'
import Mouse from '@app/peripherals/Mouse'
import Box from './objects/primitives/Box'

const canvas = <HTMLCanvasElement> document.getElementById('canvas')
canvas.width  = CONFIG.CANVAS_WIDTH
canvas.height = CONFIG.CANVAS_HEIGHT
canvas.style.width  = CONFIG.SCALE !== 1 ? (CONFIG.SCALE * CONFIG.CANVAS_WIDTH ) + 'px' : 'auto'
canvas.style.height = CONFIG.SCALE !== 1 ? (CONFIG.SCALE * CONFIG.CANVAS_HEIGHT) + 'px' : 'auto'
const context = canvas.getContext('2d')

export default class Canvas {
	public static clear(): void {
		context.clearRect(0, 0, canvas.width, canvas.height)
	}

  public static drawBox(box: Box): void {
    context.strokeStyle = box.color
    context.lineWidth = 1
    context.beginPath()
      // Draw box outline
      context.moveTo( 0.5 + box.col * CONFIG.TILE_SIZE,                     0.5 + box.row * CONFIG.TILE_SIZE)
      context.lineTo(-0.5 + box.col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE,  0.5 + box.row * CONFIG.TILE_SIZE)
      context.lineTo(-0.5 + box.col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE, -0.5 + box.row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE)
      context.lineTo( 0.5 + box.col * CONFIG.TILE_SIZE                   , -0.5 + box.row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE)
      context.lineTo( 0.5 + box.col * CONFIG.TILE_SIZE,                     0.5 + box.row * CONFIG.TILE_SIZE)

      // Draw 'x' accross the box
      context.moveTo( 0.5 + box.col * CONFIG.TILE_SIZE,                     0.5 + box.row * CONFIG.TILE_SIZE)
      context.lineTo(-0.5 + box.col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE, -0.5 + box.row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE)
      context.moveTo(-0.5 + box.col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE,  0.5 + box.row * CONFIG.TILE_SIZE)
      context.lineTo( 0.5 + box.col * CONFIG.TILE_SIZE,                    -0.5 + box.row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE)
    context.stroke()
  }
  
  public static drawPlayer(p: Player) {
    context.strokeStyle = '#EF0000'
    context.lineWidth = 2
    context.beginPath()
      context.moveTo(p.x, p.y)
      context.lineTo(p.x + 5, p.y + 5)
    context.stroke()
  }

  public static drawCrosshair(): void {
    const canvasX: number = Mouse.x - canvas.offsetLeft
    const canvasY: number = Mouse.y - canvas.offsetTop
    let offsetX, offsetY
    context.strokeStyle = '#FFFFFF'
    context.lineWidth = 0.5
    context.beginPath()
      // Top
      offsetX =  0.5
      offsetY = -1.5
      context.moveTo(canvasX + offsetX, canvasY + offsetY)
      offsetY = -3.5
      context.lineTo(canvasX + offsetX, canvasY + offsetY)

      // Bottom
      offsetY = 2.5
      context.moveTo(canvasX + offsetX, canvasY + offsetY)
      offsetY = 4.5
      context.lineTo(canvasX + offsetX, canvasY + offsetY)

      // Left
      offsetY =  0.5
      offsetX = -3.5
      context.moveTo(canvasX + offsetX, canvasY + offsetY)
      offsetX = -1.5
      context.lineTo(canvasX + offsetX, canvasY + offsetY)

      // Right
      offsetX = 2.5
      context.moveTo(canvasX + offsetX, canvasY + offsetY)
      offsetX = 4.5
      context.lineTo(canvasX + offsetX, canvasY + offsetY)
    context.stroke()
  }

  public static drawPlayerVisionRay(p: Player): void {
    const canvasMouseX: number = Mouse.x - canvas.offsetLeft + 0.5
    const canvasMouseY: number = Mouse.y - canvas.offsetTop  + 0.5
    context.strokeStyle = '#88FF88'
    context.lineWidth = 0.2
    context.beginPath()
      context.moveTo(p.x, p.y)
      context.lineTo(canvasMouseX, canvasMouseY)
    context.stroke()
  }

  public static getCanvasDomElement(): HTMLCanvasElement {
    return canvas
  }
}
