import Canvas from '@app/infrastructure/Canvas'
import Mouse from '@app/peripherals/Mouse'
import Keyboard from '@app/peripherals/Keyboard'
import Grid from '@app/domain/Grid'
import Map from '@app/domain/Map'
import Player from '@app/domain/Player'
import AudioLoader from '@app/audio/AudioLoader'

// Load all assets
AudioLoader.load()

// Initialize the game
const grid: Grid = new Grid()
const player: Player = new Player(64, 64)
const map: Map = new Map(grid, player)

Keyboard.init(player)
Mouse.init(player)

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
