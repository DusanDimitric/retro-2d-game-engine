import GameObject from './GameObject'
import MapKeys, { isBox } from '@app/domain/map/MapKeys'
import BoxFactory from '@app/domain/objects/box/BoxFactory'

export default class GameObjectFactory {
  public static createGameObject(row: number, col: number, mapKey: MapKeys): GameObject | null {
    if (isBox(mapKey)) {
      return BoxFactory.createBox(row, col, mapKey)
    }
    else {
      return null
    }
  }
}
