import * as CONFIG from '@app/configuration/config.json'

import Player from '@app/domain/Player'
import Projectile from '@app/domain/Projectile'
import Mouse from '@app/peripherals/Mouse'
import Box from './objects/primitives/Box'

const canvas = <HTMLCanvasElement> document.getElementById('canvas')
canvas.width  = CONFIG.CANVAS_WIDTH
canvas.height = CONFIG.CANVAS_HEIGHT
canvas.style.width  = CONFIG.SCALE !== 1 ? (CONFIG.SCALE * CONFIG.CANVAS_WIDTH ) + 'px' : 'auto'
canvas.style.height = CONFIG.SCALE !== 1 ? (CONFIG.SCALE * CONFIG.CANVAS_HEIGHT) + 'px' : 'auto'
const context = canvas.getContext('2d')

export default class Canvas {
  public static rows = Math.floor(canvas.height / CONFIG.TILE_SIZE)
  public static cols = Math.floor(canvas.width  / CONFIG.TILE_SIZE)
  public static halfRows = Math.floor((canvas.height / 2) / CONFIG.TILE_SIZE)
  public static halfCols = Math.floor((canvas.width  / 2) / CONFIG.TILE_SIZE)
  public static rowRemainder = (canvas.height / 2) % CONFIG.TILE_SIZE
  public static colRemainder = (canvas.width  / 2) % CONFIG.TILE_SIZE

  public static center: { x: number, y: number } = {
    x: CONFIG.CANVAS_WIDTH  / 2,
    y: CONFIG.CANVAS_HEIGHT / 2,
  }

	public static clear(): void {
		context.clearRect(0, 0, canvas.width, canvas.height)
	}

  public static drawBox(box: Box): void {
    context.strokeStyle = box.color
    context.lineWidth = 1
    context.beginPath()
      // Draw box outline
      context.moveTo( 0.5 + box.x,                     0.5 + box.y)
      context.lineTo(-0.5 + box.x + CONFIG.TILE_SIZE,  0.5 + box.y)
      context.lineTo(-0.5 + box.x + CONFIG.TILE_SIZE, -0.5 + box.y + CONFIG.TILE_SIZE)
      context.lineTo( 0.5 + box.x                   , -0.5 + box.y + CONFIG.TILE_SIZE)
      context.lineTo( 0.5 + box.x,                     0.5 + box.y)

      // Draw 'x' accross the box
      context.moveTo( 0.5 + box.x,                     0.5 + box.y)
      context.lineTo(-0.5 + box.x + CONFIG.TILE_SIZE, -0.5 + box.y + CONFIG.TILE_SIZE)
      context.moveTo(-0.5 + box.x + CONFIG.TILE_SIZE,  0.5 + box.y)
      context.lineTo( 0.5 + box.x,                    -0.5 + box.y + CONFIG.TILE_SIZE)
    context.stroke()
  }
  
  public static drawPlayer(p: Player) {
    context.beginPath()
      context.fillStyle = '#00AA00'
      context.font = "10px Monospace"

      context.fillText(`p (${p.x}, ${p.y})`, 50, 50)
      const canvasX: number = Mouse.x - canvas.offsetLeft
      const canvasY: number = Mouse.y - canvas.offsetTop
      context.fillText(`m (${canvasX}, ${canvasY})`, 50, 62)
      const dx = canvasX - this.center.x
      const dy = canvasY - this.center.y
      context.fillText(`d (${dx}, ${dy})`, 50, 74)
      const theta = Math.atan2((dy), (dx))
      context.fillText(`θ = ${theta}`, 50, 86)

      context.strokeStyle = '#523DA5'
      context.lineWidth = 2
      context.moveTo(this.center.x, this.center.y)
      context.lineTo(this.center.x + (p.sightLineLength * Math.cos(theta)), this.center.y + (p.sightLineLength * Math.sin(theta)))
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
    const canvasMouseX: number = Canvas.getCanvasMouseX()
    const canvasMouseY: number = Canvas.getCanvasMouseY()
    context.strokeStyle = '#FF4444'
    context.lineWidth = 0.2
    context.beginPath()
      context.moveTo(this.center.x, this.center.y)
      context.lineTo(canvasMouseX, canvasMouseY)
    context.stroke()
  }

  public static drawProjectiles (projectiles: Projectile[], playerX: number, playerY: number) {
    context.fillStyle = '#FFFFFF'
    context.lineWidth = 1
    projectiles.forEach(p => {
      context.beginPath()
      context.arc(
        p.x + this.center.x - playerX,
        p.y + this.center.y - playerY,
        2,
        0,
        (2 * Math.PI)
      )
      context.stroke()
    })
  }

  public static getCanvasDomElement = (): HTMLCanvasElement => canvas
  public static getCanvasMouseX = (): number => Mouse.x - canvas.offsetLeft + 0.5
  public static getCanvasMouseY = (): number => Mouse.y - canvas.offsetTop  + 0.5
}
