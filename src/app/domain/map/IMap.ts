export default interface IMap {
  gameObjects: number[][]
  enemies: Array<{ x: number, y: number, healthPercentage: number }>
}
