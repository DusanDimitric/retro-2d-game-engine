import GameStatePlaying from './GameStatePlaying'
import GameStatePaused from './GameStatePaused'

export default class GameState {
  public static playing: GameStatePlaying = new GameStatePlaying()
  public static paused: GameStatePaused   = new GameStatePaused()
}
