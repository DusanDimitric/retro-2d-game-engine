import Mixer from './Mixer'
import context from './AudioContext'
import { load } from './AudioBufferLoader'

export default class SoundFX {
  private static SMG: AudioBuffer[] = []
  private static SMG_INDEX = 0

  private static CRATE_HIT: AudioBuffer[] = []

  private static ENEMY_HIT: AudioBuffer[] = []
  private static ENEMY_HIT_INDEX = 0
  private static ENEMY_HIT_READY: boolean = true

  private static ENEMY_DEATH: AudioBuffer[] = []

  public static async load(setLoadedPercentage: (percentage: number) => void): Promise<void> {
    // TODO: Load audio in parallel
    this.SMG[0] = await load('./audio/smg_1.wav')
    this.SMG[1] = await load('./audio/smg_2.wav')
    this.SMG[2] = await load('./audio/smg_3.wav')
    this.SMG[3] = await load('./audio/smg_4.wav')
    this.SMG[4] = await load('./audio/smg_5.wav')
    setLoadedPercentage(0.40)

    this.CRATE_HIT[0] = await load('./audio/crate_hit_1.wav')
    setLoadedPercentage(0.45)

    this.ENEMY_HIT[0] = await load('./audio/enemy_hit_1.mp3')
    this.ENEMY_HIT[1] = await load('./audio/enemy_hit_2.mp3')
    this.ENEMY_HIT[2] = await load('./audio/enemy_hit_3.mp3')
    this.ENEMY_HIT[3] = await load('./audio/enemy_hit_4.mp3')
    this.ENEMY_HIT[4] = await load('./audio/enemy_hit_5.mp3')
    setLoadedPercentage(0.95)

    this.ENEMY_DEATH[0] = await load('./audio/enemy_die_1.mp3')
    setLoadedPercentage(1.0)
  }

  public static playSMG(): void {
    const playSound = context.createBufferSource()
    playSound.buffer = this.SMG[this.SMG_INDEX]

    const gainNode = context.createGain()
    gainNode.gain.value = Mixer.soundFxVolume * 0.2
    playSound.connect(gainNode)

    gainNode.connect(context.destination)

    playSound.start()
    this.SMG_INDEX = ++this.SMG_INDEX % this.SMG.length // Shuffle the SMG FX
  }

  public static playEnemyHit(): void {
    if (this.ENEMY_HIT_READY === false) {
      return
    }
    const playSound = context.createBufferSource()
    playSound.buffer = this.ENEMY_HIT[this.ENEMY_HIT_INDEX]

    const gainNode = context.createGain()
    gainNode.gain.value = Mixer.soundFxVolume
    playSound.connect(gainNode)

    gainNode.connect(context.destination)

    playSound.start()
    this.ENEMY_HIT_INDEX = ++this.ENEMY_HIT_INDEX % this.ENEMY_HIT.length // Shuffle

    this.ENEMY_HIT_READY = false
    setTimeout(() => { this.ENEMY_HIT_READY = true }, 500)
  }

  public static playEnemyDeath(): void {
    const playSound = context.createBufferSource()
    playSound.buffer = this.ENEMY_DEATH[0]

    const gainNode = context.createGain()
    gainNode.gain.value = Mixer.soundFxVolume
    playSound.connect(gainNode)

    gainNode.connect(context.destination)

    playSound.start()
  }

  public static playCrateHit(): void {
    const playSound = context.createBufferSource()
    playSound.buffer = this.CRATE_HIT[0]

    const gainNode = context.createGain()
    gainNode.gain.value = Mixer.soundFxVolume
    playSound.connect(gainNode)

    gainNode.connect(context.destination)

    playSound.start()
  }
}
