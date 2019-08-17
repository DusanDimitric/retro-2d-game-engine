import IGameState from './IGameState'
import GAME_STATES from './GameStates'

export default class GameStateManager {
  private currentState: IGameState = GAME_STATES.LOADING

  public getState(): IGameState {
    return this.currentState
  }
  public setState(nextState: IGameState): IGameState {
    this.currentState.exit(nextState)
    const previousState = this.currentState
    nextState.enter(previousState)
    this.currentState = nextState
    return this.currentState
  }

  public update(): void {
    this.currentState.update()
  }
  public render(): void {
    this.currentState.render()
  }
}
