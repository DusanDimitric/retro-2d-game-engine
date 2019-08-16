import * as CONFIG from '@app/configuration/config.json'

import IGameState from './IGameState'
import GameState from './GameState'
import { context } from '@app/infrastructure/Canvas'

export default class GameStatePaused implements IGameState {
  public update(): void {
    return
  }

  public render(): void {
    GameState.playing.render()
    this.drawPauseMenu()
  }

  private drawPauseMenu(): void {
    context.beginPath()
      context.fillStyle = '#FFC100'
      context.font = '20px Monospace'

      context.fillText(`Paused`, CONFIG.CANVAS_WIDTH / 2 - 36, CONFIG.CANVAS_HEIGHT / 2 - 54)
      context.font = '12px Monospace'
      context.fillText('  p - Resume',    CONFIG.CANVAS_WIDTH / 2 - 50, CONFIG.CANVAS_HEIGHT / 2 - 34)
      context.fillText('ESC - Main Menu', CONFIG.CANVAS_WIDTH / 2 - 50, CONFIG.CANVAS_HEIGHT / 2 - 18)
    context.stroke()
  }
}
