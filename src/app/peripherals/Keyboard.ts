import Player from '@app/domain/Player'

export default class Keyboard {
  constructor(private player: Player) {
    this.initializeKeyListeners()
  }

  private initializeKeyListeners(): void {
    // TODO: Move Player logic to Player class
    document.addEventListener('keydown', e => {
      switch (e.keyCode) {
        case 87: // w
          this.player.moving.up = true
          break
        case 65: // a
          this.player.moving.left = true
          break
        case 83: // s
          this.player.moving.down = true
          break
        case 68: // d
          this.player.moving.right = true
          break
        default:
          break
      }
    })
    document.addEventListener('keyup', e => {
      switch (e.keyCode) {
        case 87: // w
          this.player.moving.up = false
          break
        case 65: // a
          this.player.moving.left = false
          break
        case 83: // s
          this.player.moving.down = false
          break
        case 68: // d
          this.player.moving.right = false
          break
        default:
          break
      }
    })
  }
}
