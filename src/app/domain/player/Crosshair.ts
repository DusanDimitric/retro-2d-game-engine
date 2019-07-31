import Canvas, { context } from '@app/infrastructure/Canvas'

export default class Crosshair {
  public static draw(): void {
    const canvasX: number = Canvas.mousePosition.x
    const canvasY: number = Canvas.mousePosition.y
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
}