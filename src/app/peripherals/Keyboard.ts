import Player from '@app/domain/Player'

export default class Keyboard {
  public static init(player: Player): void {
    // TODO: Move Player logic to Player class
    document.addEventListener('keydown', e => {
      switch (e.keyCode) {
        case 87: // w
          player.moving.up = true
          break
        case 65: // a
          player.moving.left = true
          break
        case 83: // s
          player.moving.down = true
          break
        case 68: // d
          player.moving.right = true
          break
        default:
          break
      }
    })
    document.addEventListener('keyup', e => {
      switch (e.keyCode) {
        case 87: // w
          player.moving.up = false
          break
        case 65: // a
          player.moving.left = false
          break
        case 83: // s
          player.moving.down = false
          break
        case 68: // d
          player.moving.right = false
          break
        default:
          break
      }
    })
  }
}
