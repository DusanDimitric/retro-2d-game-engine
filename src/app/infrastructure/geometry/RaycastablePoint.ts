import Point from './Point'

export default interface RaycastablePoint extends Point {
  row: number
  col: number
  deltas: {
    dyTop    : number
    dyBottom : number
    dxLeft   : number
    dxRight  : number
  }
}
