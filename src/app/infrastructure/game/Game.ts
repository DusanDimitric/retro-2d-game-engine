import AudioLoader from '@app/audio/AudioLoader'
import Canvas from '@app/infrastructure/Canvas'

import FrameRate from '../FrameRate'
import GAME_STATES from './game_states/GameStates'
import GameStateManager from './game_states/GameStateManager'
import GameAssets from '../GameAssets'

export default class Game {
  public static loaded: boolean = false
  public static loadedPercentage: number = 0.0 // 0.0 to 1.0

  public static stateManager: GameStateManager = new GameStateManager()

  public static togglePause(): void {
    if (Game.stateManager.getState() === GAME_STATES.PAUSED) {
      Game.stateManager.setState(GAME_STATES.PLAYING)
    } else {
      Game.stateManager.setState(GAME_STATES.PAUSED)
    }
  }

  constructor() {
    window.onfocus = () => {
      FrameRate.restart()
    }
    AudioLoader.load(percentage => this.gameAssetLoaded(GameAssets.Audio, percentage))
  }

  public start(): void {
    const loadInterval = setInterval(() => {
      if (Game.loaded) {
        clearInterval(loadInterval)
        Game.stateManager.setState(GAME_STATES.MAIN_MENU)
      }
    }, 250)

    this.gameLoop()
  }

  private gameAssetLoaded(asset: GameAssets, percentage: number) {
    const audioWeight = 1.0 // TODO: Audio is 100% of all loaded assets for now
    if (asset === GameAssets.Audio) {
      Game.loadedPercentage = audioWeight * percentage
    }
    if (Game.loadedPercentage === 1.0) {
      Game.loaded = true
    }
  }

  private gameLoop(): void {
    this.update()

    if (FrameRate.nextFrameRenderingShouldBeSkipped() === false) {
      this.render()
    }

    FrameRate.calculateFrameRate()

    window.requestAnimationFrame(() => this.gameLoop())
  }

  private update(): void {
    Game.stateManager.update()
  }

  private render(): void {
    Canvas.clear()
    Game.stateManager.render()
    FrameRate.drawFPS() // TODO: Remove this, used just for debugging
  }
}
