import SoundFX from './SoundFX'

export default class AudioLoader {
  public static async load(loadCallback: () => void) {
    await SoundFX.load()
    loadCallback()
  }
}
