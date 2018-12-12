import Canvas from '@app/infrastructure/Canvas'
import Mouse from '@app/peripherals/Mouse'
import Keyboard from '@app/peripherals/Keyboard'
import Grid from '@app/domain/Grid'
import Map from '@app/domain/Map'
import Player from '@app/domain/Player'

const grid: Grid = new Grid()
const map: Map = new Map(grid)
const player: Player = new Player(100, 100)

Keyboard.init(player)
Mouse.init()

export default class Game {
  public start(): void {
		window.requestAnimationFrame(() => this.gameLoop())
  }

	private gameLoop(): void {
		this.update()
		this.render()
		window.requestAnimationFrame(() => this.gameLoop())
	}

  private update(): void {
    player.update()
  }

  private render(): void {
	  Canvas.clear()
    map.draw()
    player.draw()
  }
}
