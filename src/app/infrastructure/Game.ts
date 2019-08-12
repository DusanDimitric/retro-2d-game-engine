import AudioLoader from '@app/audio/AudioLoader'
import Grid from '@app/domain/Grid'
import Map from '@app/domain/map/Map'
import Player from '@app/domain/player/Player'
import Canvas from '@app/infrastructure/Canvas'
import Keyboard from '@app/peripherals/Keyboard'
import Mouse from '@app/peripherals/Mouse'
import Gamepads from '@app/peripherals/Gamepads'

import FrameRate from './FrameRate'
import PauseMenu from './menus/PauseMenu'
import GameAssets from './GameAssets'

export default class Game {
  public static loaded: boolean = false
  public static loadedPercentage: number = 0.0 // 0.0 to 1.0
  public static paused: boolean = false

  private grid: Grid
  private player: Player
  private map: Map

  constructor() {
    window.onfocus = () => {
      FrameRate.restart()
    }
    window.onblur = () => {
      Game.paused = true
    }

    this.showLoadingProgress()
    AudioLoader.load(() => this.gameAssetLoaded(GameAssets.Audio))

    this.grid = new Grid()
    this.player = new Player(128, 64)
    this.map = new Map(this.grid, this.player)
  }

  public start(): void {
    const loadInterval = setInterval(() => {
      if (Game.loaded) {
        clearInterval(loadInterval)
        this.finishInitialization()
        window.requestAnimationFrame(() => this.gameLoop())
      }
    }, 250)
  }
  private showLoadingProgress(): void {
    const loadingProgressElement = document.getElementById('loading-progress')
    loadingProgressElement.style.display = 'block'
    loadingProgressElement.textContent = 'Loading... 0%'
  }

  private hideLoadingProgress(): void {
    document.getElementById('loading-progress').style.display = 'none'
  }

  private gameAssetLoaded(asset: GameAssets) {
    if (asset === GameAssets.Audio) {
      Game.loadedPercentage += 1.0
    }
    if (Game.loadedPercentage === 1.0) {
      Game.loaded = true
    }
  }

  private finishInitialization(): void {
    Keyboard.init(this.player)
    Mouse.init(this.player)
    this.hideLoadingProgress()
  }

  private gameLoop(): void {
    if (Game.paused === false) {
      this.update()
    }

    if (FrameRate.nextFrameRenderingShouldBeSkipped() === false) {
      this.render()
    }

    FrameRate.calculateFrameRate()

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

    if (Game.paused) {
      PauseMenu.render()
    }

    FrameRate.drawFPS() // TODO: Remove this, used just for debugging
  }
}
