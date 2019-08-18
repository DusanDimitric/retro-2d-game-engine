import IGameState from './IGameState'

import Game from '@app/infrastructure/game/Game'
import Canvas from '@app/infrastructure/Canvas'

import Keyboard from '@app/peripherals/Keyboard'
import Mouse from '@app/peripherals/Mouse'
import Gamepads from '@app/peripherals/Gamepads'

import Grid from '@app/domain/Grid'
import Map from '@app/domain/map/Map'
import Player from '@app/domain/player/Player'
import GAME_STATES from './GameStates'

export default class GameStatePlaying implements IGameState {
  private grid: Grid
  private player: Player
  private map: Map

  public enter(previousState: IGameState): void {
    if (previousState !== GAME_STATES.PAUSED) {
      this.startNewGame()
    }
  }

  public exit(nextState: IGameState): void {
    if (nextState !== GAME_STATES.PAUSED) {
      window.onblur = null
    }
  }

  public update(): void {
    Canvas.updateMousePosition()
    Gamepads.update(this.player)
    this.player.update()
    this.map.update()
  }

  public render(): void {
    this.map.draw()
    this.player.draw()
  }

  private startNewGame(): void {
    this.grid = new Grid()
    this.player = new Player(128, 64)
    this.map = new Map(this.grid, this.player)

    window.onblur = () => {
      Game.stateManager.setState(GAME_STATES.PAUSED)
    }

    Keyboard.init(this.player)
    Mouse.init(this.player)
  }
}
