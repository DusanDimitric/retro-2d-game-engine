import AudioLoader from '@app/audio/AudioLoader'
import Canvas from '@app/infrastructure/Canvas'

import FrameRate from '../FrameRate'
import IGameState from './game_states/IGameState'
import GameState from './game_states/GameState'
import GameAssets from '../GameAssets'

export default class Game {
  public static loaded: boolean = false
  public static loadedPercentage: number = 0.0 // 0.0 to 1.0

  public static state: IGameState = GameState.loading

  public static togglePause(): void {
    if (Game.state === GameState.paused) {
      Game.state = GameState.playing
    } else {
      Game.state = GameState.paused
    }
  }

  constructor() {
    window.onfocus = () => {
      FrameRate.restart()
    }
    AudioLoader.load(() => this.gameAssetLoaded(GameAssets.Audio))
  }

  public start(): void {
    const loadInterval = setInterval(() => {
      if (Game.loaded) {
        clearInterval(loadInterval)
        Game.state = GameState.mainMenu
        this.gameLoop()
      }
    }, 250)
  }

  private gameAssetLoaded(asset: GameAssets) {
    if (asset === GameAssets.Audio) {
      Game.loadedPercentage += 1.0
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
    Canvas.update()
    Game.state.update()
  }

  private render(): void {
    Canvas.clear()
    Game.state.render()
    FrameRate.drawFPS() // TODO: Remove this, used just for debugging
  }
}
