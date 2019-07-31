import Player from '@app/domain/Player'
import { KEYBOARD_KEYS } from './constants/KeyCodes'

export default class Keyboard {
  public static init(player: Player): void {
    // TODO: Move Player logic to Player class
    document.addEventListener('keydown', e => {
      switch (e.keyCode) {
        case KEYBOARD_KEYS.w:
          player.moving.up = true
          break
        case KEYBOARD_KEYS.a:
          player.moving.left = true
          break
        case KEYBOARD_KEYS.s:
          player.moving.down = true
          break
        case KEYBOARD_KEYS.d:
          player.moving.right = true
          break
        default:
          break
      }
    })
    document.addEventListener('keyup', e => {
      switch (e.keyCode) {
        case KEYBOARD_KEYS.w:
          player.moving.up = false
          break
        case KEYBOARD_KEYS.a:
          player.moving.left = false
          break
        case KEYBOARD_KEYS.s:
          player.moving.down = false
          break
        case KEYBOARD_KEYS.d:
          player.moving.right = false
          break
        default:
          break
      }
    })
  }
}
