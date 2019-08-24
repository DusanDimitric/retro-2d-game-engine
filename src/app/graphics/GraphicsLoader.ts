import Sprites from './Sprites'

export default class GraphicsLoader {
  public static async load(setLoadedPercentage: (percentage: number) => void) {
    Sprites.load(setLoadedPercentage)
  }
}