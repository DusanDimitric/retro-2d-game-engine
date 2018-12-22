import Player from '@app/domain/Player'

export default class Gamepad {
  public static init(player: Player): void {
    window.addEventListener('gamepadconnected', (e: any) => {
      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
          e.gamepad.index, e.gamepad.id,
          e.gamepad.buttons.length, e.gamepad.axes.length)
    });
  }
}
