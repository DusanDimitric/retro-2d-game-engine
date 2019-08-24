import CreatureSprite from './sprites/CreatureSprite'
import SpriteZerg from './sprites/SpriteZerg'

export default class Sprites {
  public static Zerg: CreatureSprite = new SpriteZerg()

  public static async load(setLoadedPercentage: (percentage: number) => void): Promise<void> {
    await Sprites.Zerg.load(() => setLoadedPercentage(1.0))
  }
}
