import Mixer from './Mixer'
import context from './AudioContext'
import { load } from './AudioBufferLoader'

export default class SoundFX {
  private static SMG: AudioBuffer[] = []
  private static SMG_INDEX = 0

  public static async load(): Promise<void> {
    this.SMG[0] = await load('./audio/smg_1.wav')
    this.SMG[1] = await load('./audio/smg_2.wav')
    this.SMG[2] = await load('./audio/smg_3.wav')
    this.SMG[3] = await load('./audio/smg_4.wav')
    this.SMG[4] = await load('./audio/smg_5.wav')
  }

  public static playSMG(): void {
    const playSound = context.createBufferSource()
    playSound.buffer = this.SMG[this.SMG_INDEX]

    const gainNode = context.createGain()
    gainNode.gain.value = Mixer.soundFxVolume
    playSound.connect(gainNode)

    gainNode.connect(context.destination)

    playSound.start()
    this.SMG_INDEX = ++this.SMG_INDEX % this.SMG.length // Shuffle the SMG FX
  }
}
