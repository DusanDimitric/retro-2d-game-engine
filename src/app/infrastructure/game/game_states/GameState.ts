import GameStateLoading from './GameStateLoading'
import GameStateMainMenu from './GameStateMainMenu'
import GameStatePlaying from './GameStatePlaying'
import GameStatePaused from './GameStatePaused'

export default class GameState {
  public static loading: GameStateLoading   = new GameStateLoading()
  public static mainMenu: GameStateMainMenu = new GameStateMainMenu()
  public static playing: GameStatePlaying   = new GameStatePlaying()
  public static paused: GameStatePaused     = new GameStatePaused()
}
