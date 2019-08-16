import IGameState from './IGameState'

import Keyboard from '@app/peripherals/Keyboard'
import Mouse from '@app/peripherals/Mouse'
import Gamepads from '@app/peripherals/Gamepads'

import Grid from '@app/domain/Grid'
import Map from '@app/domain/map/Map'
import Player from '@app/domain/player/Player'

export default class GameStatePlaying implements IGameState {
  private grid: Grid
  private player: Player
  private map: Map

  constructor() {
    this.grid = new Grid()
    this.player = new Player(128, 64)
    this.map = new Map(this.grid, this.player)
  }

  public finishInitialization(): void {
    Keyboard.init(this.player)
    Mouse.init(this.player)
  }

  public update(): void {
    Gamepads.update(this.player)
    this.player.update()
    this.map.update()
  }

  public render(): void {
    this.map.draw()
    this.player.draw()
  }
}
