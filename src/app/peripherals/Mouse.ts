import Canvas from '@app/infrastructure/Canvas'

export default class Mouse {
	x: number = 0
	y: number = 0

  constructor() {
    this.hijackRightClick()
    this.activateCrosshair()
  }

  private hijackRightClick(): void {
    window.addEventListener('contextmenu', function() {
      arguments[0].preventDefault()
    }, false)
  }

  private activateCrosshair(): void {
    const canvas: HTMLCanvasElement = Canvas.getCanvasDomElement()
    canvas.addEventListener('mousemove', e => {
			this.x = e.pageX
			this.y = e.pageY
    }, false)
  }

	public render(): void {
		Canvas.drawCrosshair(this.x, this.y)
	}
}
