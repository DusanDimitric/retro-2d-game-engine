import SoundFX from './SoundFX'

export default class AudioLoader {
  public static async load(loadCallback: (percentage: number) => void) {
    await SoundFX.load(loadCallback)
  }
}
