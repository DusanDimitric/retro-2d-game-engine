import * as CONFIG from '@app/configuration/config.json'

import { context } from '../Canvas'

export default class PauseMenu {
  public static render(): void {
    context.beginPath()
      context.fillStyle = '#FFC100'
      context.font = '20px Monospace'

      context.fillText(`Paused (press 'p' to continue)`, 50, CONFIG.CANVAS_HEIGHT / 2 - 10)
    context.stroke()
  }
}