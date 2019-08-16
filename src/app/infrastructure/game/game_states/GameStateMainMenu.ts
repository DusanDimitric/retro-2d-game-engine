import * as CONFIG from '@app/configuration/config.json'

import IGameState from './IGameState'
import Game from '@app/infrastructure/game/Game'
import GameState from '@app/infrastructure/game/game_states/GameState'
import { context } from '@app/infrastructure/Canvas'
import { KEYBOARD_KEYS } from '@app/peripherals/constants/KeyCodes';

export default class GameStateMainMenu implements IGameState {
  private animationCounter: number = 0
  private animationInterval: number = 100
  private instructionsVisible: boolean = true

  constructor() {
    document.addEventListener('keydown', e => this.handleMenuSelection(e))
  }

  public update(): void {
    this.animationCounter = (this.animationCounter + 1) % this.animationInterval
    if (this.animationCounter >= this.animationInterval / 2) {
      this.instructionsVisible = false
    } else {
      this.instructionsVisible = true
    }
    return
  }

  public render(): void {
    this.drawMainMenu()
  }

  private drawMainMenu(): void {
    context.beginPath()
      context.fillStyle = '#FFC100'

      context.font = '12px Monospace'
      context.fillText(`Retro 2D Top-Down Game Engine`, CONFIG.CANVAS_WIDTH / 2 - 106, CONFIG.CANVAS_HEIGHT / 2 - 34)
      if (this.instructionsVisible) {
        context.font = '20px Monospace'
        context.fillText('Press ENTER to start', CONFIG.CANVAS_WIDTH / 2 - 130, CONFIG.CANVAS_HEIGHT / 2 - 10)
      }
    context.stroke()
  }

  private handleMenuSelection(e: KeyboardEvent): void {
    if (e.keyCode === KEYBOARD_KEYS.ENTER) {
      Game.state = GameState.playing
      document.removeEventListener('keydown', e => this.handleMenuSelection(e))
    }
  }
}
