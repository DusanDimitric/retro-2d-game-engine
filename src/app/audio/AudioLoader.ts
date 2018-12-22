import SoundFX from './SoundFX'

export default class AudioLoader {
  public static async load() {
    await SoundFX.load()
  }
}
