export default interface IGameState {
  update(): void
  render(): void
  finishInitialization?(): void
}
