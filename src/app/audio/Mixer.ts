export default class Mixer {
  private static _musicVolume   : number = 0.3
  private static _soundFxVolume : number = 0.15

  public static get musicVolume(): number {
    return this._musicVolume
  }
  public static set musicVolume(vol: number) {
    if (vol >= 0 && vol <= 1) {
      this._musicVolume = vol
    }
  }

  public static get soundFxVolume(): number {
    return this._soundFxVolume
  }
  public static set soundFxVolume(vol: number) {
    if (vol >= 0 && vol <= 1) {
      this._soundFxVolume = vol
    }
  }
}
