import Canvas from '@app/infrastructure/Canvas'
import Player from '@app/domain/player/Player'

export default class Mouse {
  public static x: number = window.innerWidth  / 2 + 100
  public static y: number = window.innerHeight / 2 + 50
  public static init(player: Player) {
    this.hijackRightClick()
    this.trackMouseOnCanvas()
    this.listenForLeftClicks(player)
  }

  private static hijackRightClick(): void {
    window.addEventListener('contextmenu', e => {
      e.preventDefault()
    }, false)
  }

  private static trackMouseOnCanvas(): void {
    const canvas: HTMLCanvasElement = Canvas.getCanvasDomElement()
    canvas.addEventListener('mousemove', e => {
      this.x = e.pageX
      this.y = e.pageY
    }, false)
  }

  private static listenForLeftClicks(player: Player): void {
    const canvas: HTMLCanvasElement = Canvas.getCanvasDomElement()
    canvas.addEventListener('mousedown', e => {
      player.setShooting(true)
    }, false)
    canvas.addEventListener('mouseup', e => {
      player.setShooting(false)
    }, false)
  }
}
