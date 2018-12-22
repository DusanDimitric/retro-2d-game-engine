import Canvas from '@app/infrastructure/Canvas'
import GameObject from '../GameObject'

export default class Box extends GameObject {
  draw(): void {
    Canvas.drawBox(this)
  }
}
