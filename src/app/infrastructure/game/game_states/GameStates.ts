import GameStateLoading from './GameStateLoading'
import GameStateMainMenu from './GameStateMainMenu'
import GameStatePlaying from './GameStatePlaying'
import GameStatePaused from './GameStatePaused'

// TODO: Add a IGameState type definition
const GAME_STATES = {
  LOADING   : new GameStateLoading(),
  MAIN_MENU : new GameStateMainMenu(),
  PLAYING   : new GameStatePlaying(),
  PAUSED    : new GameStatePaused(),
}

export default GAME_STATES