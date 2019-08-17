import * as CONFIG from '@app/configuration/config.json'

import IGameState from './IGameState'
import Game from '@app/infrastructure/game/Game'
import { context } from '@app/infrastructure/Canvas'

export default class GameStateMainMenu implements IGameState {
  public enter(): void {
    return
  }
  public exit(): void {
    return
  }

  public update(): void {
    return
  }

  public render(): void {
    this.drawLoadingDialog()
  }

  private drawLoadingDialog(): void {
    context.beginPath()
      context.fillStyle = '#FFC100'
      context.font = '20px Monospace'
      context.fillText(`Loading: ${+(Game.loadedPercentage * 100)}%`, CONFIG.CANVAS_WIDTH / 2 - 70, CONFIG.CANVAS_HEIGHT / 2 - 10)
    context.stroke()
  }
}
