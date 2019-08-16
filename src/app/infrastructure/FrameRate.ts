import * as CONFIG from '@app/configuration/config.json'

import { context } from './Canvas'

let lastFrameTime: number
let frameDeltaTime: number
let frameOverstepTime: number = 0

const ONE_FRAME_LENGTH_IN_SECONDS = 0.01667
const FPS_ARR: number[] = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
let FPS: number
let skipNextFrameRendering = false

export default class FrameRate {
  public static nextFrameRenderingShouldBeSkipped(): boolean {
    return skipNextFrameRendering
  }

  public static restart() {
    lastFrameTime = null
    for (let i = 0; i < FPS_ARR.length; ++i) {
      FPS_ARR[i] = 0
    }
  }

  public static calculateFrameRate(): void {
    if (!lastFrameTime) {
      lastFrameTime = performance.now()
      FPS = 0
    } else {
      const now = performance.now()
      frameDeltaTime = (now - lastFrameTime) / 1000
      if (frameDeltaTime > ONE_FRAME_LENGTH_IN_SECONDS) {
        frameOverstepTime += frameDeltaTime - ONE_FRAME_LENGTH_IN_SECONDS
      }

      FPS_ARR.unshift(1 / (frameDeltaTime + frameOverstepTime))
      FPS_ARR.pop()
      FPS = FPS_ARR.reduce((sum, current) => sum += current, 0) / FPS_ARR.length

      if (frameOverstepTime >= ONE_FRAME_LENGTH_IN_SECONDS) {
        frameOverstepTime = frameOverstepTime - ONE_FRAME_LENGTH_IN_SECONDS
        skipNextFrameRendering = true
      } else {
        skipNextFrameRendering = false
      }

      lastFrameTime = now
    }
  }

  public static drawFPS() {
    context.beginPath()
      context.fillStyle = '#FFC100'
      context.font = '8px Monospace'

      context.fillText(`FPS: ${FPS && FPS.toFixed(2) || 'unknown'}`, 10, CONFIG.CANVAS_HEIGHT - 10)
    context.stroke()
  }
}