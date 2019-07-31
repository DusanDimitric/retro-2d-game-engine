import * as CONFIG from '@app/configuration/config.json'

import Player from '@app/domain/Player'
import Projectile from '@app/domain/Projectile'
import Raycaster from '@app/infrastructure/Raycaster'
import Mouse from '@app/peripherals/Mouse'
import Box from '../domain/objects/box/Box'
import Point from './geometry/Point'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.width  = CONFIG.CANVAS_WIDTH
canvas.height = CONFIG.CANVAS_HEIGHT
canvas.style.width  = CONFIG.SCALE !== 1 ? (CONFIG.SCALE * CONFIG.CANVAS_WIDTH ) + 'px' : 'auto'
canvas.style.height = CONFIG.SCALE !== 1 ? (CONFIG.SCALE * CONFIG.CANVAS_HEIGHT) + 'px' : 'auto'
export const context = canvas.getContext('2d')

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

  // TODO: Move to Box.draw()
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

  public static calculateTheta(p: Player): number {
    const theta = Math.atan2(
      (this.getCanvasMouseY() - this.center.y),
      (this.getCanvasMouseX() - this.center.x)
    )
    context.fillStyle = '#44FF44'
    context.fillText(`θ = ${theta}`, 10, 56)
    return theta
  }
  
  public static drawPlayer(p: Player, theta: number) {
    context.beginPath()
      context.fillStyle = '#00AA00'
      context.font = "10px Monospace"

      context.fillText(`p (${p.x}, ${p.y})`, 10, 20)

      context.strokeStyle = '#523DA5'
      context.lineWidth = 2
      context.moveTo(this.center.x, this.center.y)
      context.lineTo(this.center.x + (p.sightLineLength * Math.cos(theta)), this.center.y + (p.sightLineLength * Math.sin(theta)))
    context.stroke()
  }

  public static drawCrosshair(): void {
    const canvasX: number = Canvas.getCanvasMouseX()
    const canvasY: number = Canvas.getCanvasMouseY()
    let offsetX
    let offsetY
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

  public static drawPlayerVisionRay(p: Player, theta: number): void {
    const { hitPoint, hitObject } = Raycaster.cast(p, theta)
    if (hitPoint) {
      if (hitObject) {
        this.drawRay(hitPoint, '#FF4444')
      } else {
        this.drawRay(hitPoint)
      }
    }
  }

  public static drawProjectiles(projectiles: Projectile[], playerX: number, playerY: number) {
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
  // TODO: Optimize by not calculating this many times
  public static getCanvasMouseX = (): number => Math.floor((Mouse.x - canvas.offsetLeft) / CONFIG.SCALE)
  public static getCanvasMouseY = (): number => Math.floor((Mouse.y - canvas.offsetTop ) / CONFIG.SCALE)

  private static drawRay(hitPoint: Point, color: string = '#4444FF'): void {
    context.strokeStyle = color
    context.lineWidth = 0.5
    context.beginPath()
      context.moveTo(this.center.x, this.center.y)
      context.lineTo(
        this.center.x + hitPoint.x,
        this.center.y + hitPoint.y
      )
    context.stroke()
    context.lineWidth = 1
  }

}
