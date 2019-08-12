import AudioLoader from '@app/audio/AudioLoader'
import Grid from '@app/domain/Grid'
import Map from '@app/domain/map/Map'
import Player from '@app/domain/player/Player'
import Canvas from '@app/infrastructure/Canvas'
import Keyboard from '@app/peripherals/Keyboard'
import Mouse from '@app/peripherals/Mouse'
import Gamepads from '@app/peripherals/Gamepads'

export default class Game {
  public static paused: boolean = false

  private grid: Grid
  private player: Player
  private map: Map

  constructor() {
    AudioLoader.load()

    this.grid = new Grid()
    this.player = new Player(128, 64)
    this.map = new Map(this.grid, this.player)

    Keyboard.init(this.player)
    Mouse.init(this.player)
  }

  public start(): void {
    window.requestAnimationFrame(() => this.gameLoop())
  }

  private gameLoop(): void {
    if (Game.paused === false) {
      this.update()
      this.render()
    }
    window.requestAnimationFrame(() => this.gameLoop())
  }

  private update(): void {
    Gamepads.update(this.player)
    Canvas.update()
    this.player.update()
    this.map.update()
  }

  private render(): void {
    Canvas.clear()
    this.map.draw()
    this.player.draw()
  }
}
