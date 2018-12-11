import Canvas from '@app/infrastructure/Canvas'
import Mouse from '@app/peripherals/Mouse'
import Grid from '@app/domain/Grid'
import Map from '@app/domain/Map'

const mouse: Mouse = new Mouse()
const grid: Grid = new Grid()
const map: Map = new Map(grid)

export default class Game {
  public start(): void {
		window.requestAnimationFrame(() => this.gameLoop())
  }

	private gameLoop(): void {
		// update()
		this.render()
		window.requestAnimationFrame(() => this.gameLoop())
	}

  private render(): void {
	  Canvas.clear()
    map.draw()
		mouse.render()
  }
}
