import GameObject from './GameObject'
import BoxFactory from '@app/domain/objects/box/BoxFactory'

export default class GameObjectFactory {
  public static createGameObject(row: number, col: number, mapObject: string): GameObject | null {
    if (mapObject === null) {
      return null
    }
    else if (mapObject.startsWith('Box')) {
      return BoxFactory.createBox(row, col, mapObject)
    }
  }
}
