import * as CONFIG from '@app/configuration/config.json'

import Point, { angleBetweenPoints } from '@app/infrastructure/geometry/Point'
import GameObject from '@app/domain/objects/GameObject'
import { gameObjects } from '@app/domain/map/Map'

import Canvas, { context } from '@app/infrastructure/Canvas'

export default class Raycaster {
  /**
   * @param p     - Point from which to start Raycasting
   * @param theta - Ray angle
   * @param pEnd? - Optional ending point up to which the cast will be performed
   *
   * @returns {
   *   hitObject, // the game object that has been hit. If no object are hit - hitObject is `null`
   *   hitPoint   // can be either a point where the ray intersects a game object, or a just a point outside the screen if no object is hit
   * }
   */
  public static cast(p: Point, theta: number, pEnd?: Point): { hitPoint: Point, hitObject: GameObject } {
    if (theta >= 0) { // South
      const xInt = p.deltas.dyBottom / Math.tan(theta)

      if (xInt >= 0) { // South East
        return Raycaster.getInterceptPointSE(p, theta, pEnd)
      }
      else if (xInt < 0) { // South West
        return Raycaster.getInterceptPointSW(p, theta, pEnd)
      }
    } else { // North
      const xInt = p.deltas.dyTop / Math.tan(-theta)

      // We must check if xInt is positive because sometimes it can be: 0 or -0
      const xIntIsPositive = (1 / xInt) > 0

      if (xInt >= 0 && xIntIsPositive) { // North East
        return Raycaster.getInterceptPointNE(p, theta, pEnd)
      }
      else { // North West
        return Raycaster.getInterceptPointNW(p, theta, pEnd)
      }
    }
  }

  public static drawRay(hitPoint: Point, color: string = '#4444FF'): void {
    context.strokeStyle = color
    context.lineWidth = 0.5
    context.beginPath()
      context.moveTo(Canvas.halfWidth, Canvas.halfHeight)
      context.lineTo(
        Canvas.halfWidth + hitPoint.x,
        Canvas.halfHeight + hitPoint.y
      )
    context.stroke()
    context.lineWidth = 1
  }

  public static determineIfThereAreObstaclesBetweenTwoPoints(p1: Point, p2: Point): boolean {
    const angleBetweenTwoGivenPoints = angleBetweenPoints(p2, p1)
    const results = Raycaster.cast(p1, angleBetweenTwoGivenPoints, p2)

    // I have to check if results exist because sometimes .cast() can return 'undefined'..
    // Why .cast() sometimes returns 'undefined' could be worth investigating in the future..
    if (results) {
      return results.hitObject !== null
    }
    else {
      return true
    }
  }

  private static outsideOfScreenOffset = CONFIG.TILE_SIZE * 2
  private static rangeHorizontal: number = Canvas.halfWidth  + Raycaster.outsideOfScreenOffset
  private static rangeVertical: number   = Canvas.halfHeight + Raycaster.outsideOfScreenOffset

  // TODO: This is a naive implementation! Add 6x optimization
  private static getInterceptPointSE(p: Point, theta: number, pEnd?: Point): { hitPoint: Point, hitObject: GameObject } {
    // ########################################################################
    // Vertical Intercepts
    // ########################################################################
    let hitPointVertical: Point = null
    let objectHitVertical: GameObject = null

    let i = 0
    let yIntercept
    let tileStepX

    while (true) {
      tileStepX = i * CONFIG.TILE_SIZE
      if (theta === 0) {
        yIntercept = 0
      } else {
        yIntercept = (p.deltas.dxRight + tileStepX) * Math.tan(theta)
      }

      // Outside of screen check
      if ((tileStepX + p.deltas.dxRight > Raycaster.rangeHorizontal) || (yIntercept > Raycaster.rangeVertical)) {
        break
      }

      // Don't cast beyond pEnd
      if (pEnd) {
        if (tileStepX + p.deltas.dxRight > (pEnd.x - p.x) || yIntercept > (pEnd.y - p.y)) {
          break
        }
      }

      if (CONFIG.RAYCASTER.DEBUG) {
        let coordinates: Point
        if (pEnd) {
          coordinates = {
            x: Canvas.center.x - (pEnd.x - p.x) + p.deltas.dxRight + tileStepX,
            y: Canvas.center.y - (pEnd.y - p.y) + yIntercept,
          }
        } else {
          coordinates = {
            x: Canvas.center.x + p.deltas.dxRight + tileStepX,
            y: Canvas.center.y + yIntercept,
          }
        }
        context.strokeStyle = '#4444FF'
        context.beginPath()
        context.arc(coordinates.x, coordinates.y, 2, 0, (2 * Math.PI))
        context.stroke()
      }

      objectHitVertical = Raycaster.checkGameObjectCollisionVerticalSE(i, p, yIntercept)

      if (objectHitVertical) {
        hitPointVertical = { x: tileStepX + p.deltas.dxRight, y: yIntercept }
        break
      }
      ++i
    }

    // ########################################################################
    // Horizontal Intercepts
    // ########################################################################
    let hitPointHorizontal: Point = null
    let objectHitHorizontal: GameObject = null

    let j = 0
    let xIntercept
    let tileStepY

    while (true) {
      tileStepY = j * CONFIG.TILE_SIZE
      if (theta === 0) {
        break
      } else {
        xIntercept = (p.deltas.dyBottom + tileStepY) / Math.tan(theta)
      }

      // Outside of screen check
      if ((tileStepY + p.deltas.dyBottom > Raycaster.rangeVertical) || (xIntercept > Raycaster.rangeHorizontal)) {
        break
      }

      // Don't cast beyond pEnd
      if (pEnd) {
        if (tileStepY + p.deltas.dyBottom > (pEnd.y - p.y) || Math.round(xIntercept) > (pEnd.x - p.x)) {
          break
        }
      }

      if (CONFIG.RAYCASTER.DEBUG) {
        let coordinates: Point
        if (pEnd) {
          coordinates = {
            x: Canvas.center.x - (pEnd.x - p.x) + xIntercept,
            y: Canvas.center.y - (pEnd.y - p.y) + p.deltas.dyBottom + tileStepY,
          }
        } else {
          coordinates = {
            x: Canvas.center.x + xIntercept,
            y: Canvas.center.y + p.deltas.dyBottom + tileStepY,
          }
        }
        context.strokeStyle = '#44FF44'
        context.beginPath()
        context.arc(coordinates.x, coordinates.y, 2, 0, (2 * Math.PI))
        context.stroke()
      }

      // Catch up with the horizontal intercept
      if (yIntercept < tileStepY) {
        break
      }

      objectHitHorizontal = Raycaster.checkGameObjectCollisionHorizontalSE(j, p, xIntercept)

      if (objectHitHorizontal) {
        hitPointHorizontal = { x: xIntercept, y: tileStepY + p.deltas.dyBottom }
        break
      }
      ++j
    }

    // ########################################################################
    // Return the closer hit point
    // ########################################################################

    if (hitPointVertical && hitPointHorizontal === null) {
      return {
        hitPoint  : hitPointVertical,
        hitObject : objectHitVertical
      }
    }
    else if (hitPointHorizontal && hitPointVertical === null) {
      return {
        hitPoint  : hitPointHorizontal,
        hitObject : objectHitHorizontal
      }
    }
    else if (hitPointHorizontal && hitPointVertical) {
      const verticalHitDistanceFromPlayer   = Math.sqrt(Math.pow(  hitPointVertical.x, 2) + Math.pow(  hitPointVertical.y, 2))
      const horizontalHitDistanceFromPlayer = Math.sqrt(Math.pow(hitPointHorizontal.x, 2) + Math.pow(hitPointHorizontal.y, 2))
      if (verticalHitDistanceFromPlayer > horizontalHitDistanceFromPlayer) {
        return {
          hitPoint  : hitPointHorizontal,
          hitObject : objectHitHorizontal
        }
      } else {
        return {
          hitPoint  : hitPointVertical,
          hitObject : objectHitVertical
        }
      }
    }
    else if (hitPointHorizontal === null && hitPointVertical === null) {
      // If nothing is hit, just return the last closest point!
      const hitPointHorizontal = { x: xIntercept, y: tileStepY + p.deltas.dyBottom }
      const hitPointVertical   = { x: tileStepX + p.deltas.dxRight, y: yIntercept }
      const verticalHitDistanceFromPlayer   = Math.sqrt(Math.pow(  hitPointVertical.x, 2) + Math.pow(  hitPointVertical.y, 2))
      const horizontalHitDistanceFromPlayer = Math.sqrt(Math.pow(hitPointHorizontal.x, 2) + Math.pow(hitPointHorizontal.y, 2))
      if (verticalHitDistanceFromPlayer > horizontalHitDistanceFromPlayer) {
        return {
          hitPoint  : hitPointHorizontal,
          hitObject : objectHitHorizontal
        }
      } else {
        return {
          hitPoint  : hitPointVertical,
          hitObject : objectHitVertical
        }
      }
    }
  }

  // TODO: This is a naive implementation! Add 6x optimization
  private static getInterceptPointNE(p: Point, theta: number, pEnd?: Point): { hitPoint: Point, hitObject: GameObject } {
    // ########################################################################
    // Vertical Intercepts
    // ########################################################################
    let hitPointVertical: Point = null
    let objectHitVertical: GameObject = null

    let i = 0
    let yIntercept
    let tileStepX

    while (true) {
      tileStepX = i * CONFIG.TILE_SIZE
      if (theta === 0) {
        yIntercept = 0
      } else {
        yIntercept = (p.deltas.dxRight + tileStepX) * Math.tan(-theta)
      }

      // Outside of screen check
      if ((tileStepX + p.deltas.dxRight > Raycaster.rangeHorizontal) || (yIntercept > Raycaster.rangeVertical)) {
        break
      }

      // Don't cast beyond pEnd
      if (pEnd) {
        if (tileStepX + p.deltas.dxRight > (pEnd.x - p.x) || yIntercept > (p.y - pEnd.y)) {
          break
        }
      }

      if (CONFIG.RAYCASTER.DEBUG) {
        let coordinates: Point
        if (pEnd) {
          coordinates = {
            x: Canvas.center.x - (pEnd.x - p.x) + p.deltas.dxRight + tileStepX,
            y: Canvas.center.y - (pEnd.y - p.y) - yIntercept,
          }
        } else {
          coordinates = {
            x: Canvas.center.x + p.deltas.dxRight + tileStepX,
            y: Canvas.center.y - yIntercept,
          }
        }
        context.strokeStyle = '#4444FF'
        context.beginPath()
        context.arc(coordinates.x, coordinates.y, 2, 0, (2 * Math.PI))
        context.stroke()
      }

      objectHitVertical = Raycaster.checkGameObjectCollisionVerticalNE(i, p, yIntercept)

      if (objectHitVertical) {
        hitPointVertical = { x: tileStepX + p.deltas.dxRight, y: -yIntercept }
        break
      }
      ++i
    }

    // ########################################################################
    // Horizontal Intercepts
    // ########################################################################
    let hitPointHorizontal: Point = null
    let objectHitHorizontal: GameObject = null

    let j = 0
    let xIntercept
    let tileStepY

    while (true) {
      tileStepY = j * CONFIG.TILE_SIZE
      if (theta === 0) {
        break
      } else {
        xIntercept = (p.deltas.dyTop + tileStepY) / Math.tan(-theta)
      }

      // Outside of screen check
      if ((tileStepY + p.deltas.dyTop > Raycaster.rangeVertical) || (xIntercept > Raycaster.rangeHorizontal)) {
        break
      }

      // Don't cast beyond pEnd
      if (pEnd) {
        if (tileStepY + p.deltas.dyTop > (p.y - pEnd.y) || Math.round(xIntercept) > (pEnd.x - p.x)) {
          break
        }
      }

      if (CONFIG.RAYCASTER.DEBUG) {
        let coordinates: Point
        if (pEnd) {
          coordinates = {
            x: Canvas.center.x - (pEnd.x - p.x) + xIntercept,
            y: Canvas.center.y - (pEnd.y - p.y) - p.deltas.dyTop - tileStepY,
          }
        } else {
          coordinates = {
            x: Canvas.center.x + xIntercept,
            y: Canvas.center.y - tileStepY - p.deltas.dyTop,
          }
        }
        context.strokeStyle = '#44FF44'
        context.beginPath()
        context.arc(coordinates.x, coordinates.y, 2, 0, (2 * Math.PI))
        context.stroke()
      }

      // Catch up with the horizontal intercept
      if (yIntercept < tileStepY) {
        break
      }

      objectHitHorizontal = Raycaster.checkGameObjectCollisionHorizontalNE(j, p, xIntercept)

      if (objectHitHorizontal) {
        hitPointHorizontal = { x: xIntercept, y: -tileStepY - p.deltas.dyTop }
        break
      }
      ++j
    }

    // ########################################################################
    // Return the closer hit point
    // ########################################################################

    if (hitPointVertical && hitPointHorizontal === null) {
      return {
        hitPoint  : hitPointVertical,
        hitObject : objectHitVertical
      }
    }
    else if (hitPointHorizontal && hitPointVertical === null) {
      return {
        hitPoint  : hitPointHorizontal,
        hitObject : objectHitHorizontal
      }
    }
    else if (hitPointHorizontal && hitPointVertical) {
      const verticalHitDistanceFromPlayer   = Math.sqrt(Math.pow(  hitPointVertical.x, 2) + Math.pow(  hitPointVertical.y, 2))
      const horizontalHitDistanceFromPlayer = Math.sqrt(Math.pow(hitPointHorizontal.x, 2) + Math.pow(hitPointHorizontal.y, 2))
      if (verticalHitDistanceFromPlayer > horizontalHitDistanceFromPlayer) {
        return {
          hitPoint  : hitPointHorizontal,
          hitObject : objectHitHorizontal
        }
      } else {
        return {
          hitPoint  : hitPointVertical,
          hitObject : objectHitVertical
        }
      }
    }
    else if (hitPointHorizontal === null && hitPointVertical === null) {
      // If nothing is hit, just return the last closest point!
      const hitPointHorizontal = { x: xIntercept, y: -tileStepY - p.deltas.dyTop }
      const hitPointVertical   = { x: tileStepX + p.deltas.dxRight, y: -yIntercept }
      const verticalHitDistanceFromPlayer   = Math.sqrt(Math.pow(  hitPointVertical.x, 2) + Math.pow(  hitPointVertical.y, 2))
      const horizontalHitDistanceFromPlayer = Math.sqrt(Math.pow(hitPointHorizontal.x, 2) + Math.pow(hitPointHorizontal.y, 2))
      if (verticalHitDistanceFromPlayer > horizontalHitDistanceFromPlayer) {
        return {
          hitPoint  : hitPointHorizontal,
          hitObject : objectHitHorizontal
        }
      } else {
        return {
          hitPoint  : hitPointVertical,
          hitObject : objectHitVertical
        }
      }
    }
  }

  // TODO: This is a naive implementation! Add 6x optimization
  private static getInterceptPointNW(p: Point, theta: number, pEnd?: Point): { hitPoint: Point, hitObject: GameObject } {
    // ########################################################################
    // Vertical Intercepts
    // ########################################################################
    let hitPointVertical: Point = null
    let objectHitVertical: GameObject = null

    let i = 0
    let yIntercept
    let tileStepX

    while (true) {
      tileStepX = i * CONFIG.TILE_SIZE
      if (theta === 0) {
        yIntercept = 0
      } else {
        yIntercept = (p.deltas.dxLeft + tileStepX) * Math.tan(Math.PI - (-theta))
      }

      // Outside of screen check
      if ((tileStepX + p.deltas.dxLeft > Raycaster.rangeHorizontal) || (yIntercept > Raycaster.rangeVertical)) {
        break
      }

      // Don't cast beyond pEnd
      if (pEnd) {
        if (tileStepX + p.deltas.dxLeft > (p.x - pEnd.x) || yIntercept > (p.y - pEnd.y)) {
          break
        }
      }

      if (CONFIG.RAYCASTER.DEBUG) {
        let coordinates: Point
        if (pEnd) {
          coordinates = {
            x: Canvas.center.x - (pEnd.x - p.x) - p.deltas.dxLeft - tileStepX,
            y: Canvas.center.y - (pEnd.y - p.y) - yIntercept,
          }
        } else {
          coordinates = {
            x: Canvas.center.x - p.deltas.dxLeft - tileStepX,
            y: Canvas.center.y - yIntercept,
          }
        }
        context.strokeStyle = '#4444FF'
        context.beginPath()
        context.arc(coordinates.x, coordinates.y, 2, 0, (2 * Math.PI))
        context.stroke()
      }

      objectHitVertical = Raycaster.checkGameObjectCollisionVerticalNW(i, p, yIntercept)

      if (objectHitVertical) {
        hitPointVertical = { x: - tileStepX - p.deltas.dxLeft, y: -yIntercept }
        break
      }
      ++i
    }

    // ########################################################################
    // Horizontal Intercepts
    // ########################################################################
    let hitPointHorizontal: Point = null
    let objectHitHorizontal: GameObject = null

    let j = 0
    let xIntercept
    let tileStepY

    while (true) {
      tileStepY = j * CONFIG.TILE_SIZE
      if (theta === 0) {
        break
      } else {
        xIntercept = (p.deltas.dyTop + tileStepY) / Math.tan(Math.PI - (-theta))
      }

      // Outside of screen check
      if ((tileStepY + p.deltas.dyTop > Raycaster.rangeVertical) || (xIntercept > Raycaster.rangeHorizontal)) {
        break
      }

      // Don't cast beyond pEnd
      if (pEnd) {
        if (tileStepY + p.deltas.dyTop > (p.y - pEnd.y) || Math.round(xIntercept) > (p.x - pEnd.x)) {
          break
        }
      }

      if (CONFIG.RAYCASTER.DEBUG) {
        let coordinates: Point
        if (pEnd) {
          coordinates = {
            x: Canvas.center.x - (pEnd.x - p.x) - xIntercept,
            y: Canvas.center.y - (pEnd.y - p.y) - p.deltas.dyTop - tileStepY,
          }
        } else {
          coordinates = {
            x: Canvas.center.x - xIntercept,
            y: Canvas.center.y - p.deltas.dyTop - tileStepY,
          }
        }
        context.strokeStyle = '#44FF44'
        context.beginPath()
        context.arc(coordinates.x, coordinates.y, 2, 0, (2 * Math.PI))
        context.stroke()
      }

      // Catch up with the horizontal intercept
      if (yIntercept < tileStepY) {
        break
      }

      objectHitHorizontal = Raycaster.checkGameObjectCollisionHorizontalNW(j, p, xIntercept)

      if (objectHitHorizontal) {
        hitPointHorizontal = { x: -xIntercept, y: -tileStepY - p.deltas.dyTop }
        break
      }
      ++j
    }

    // ########################################################################
    // Return the closer hit point
    // ########################################################################

    if (hitPointVertical && hitPointHorizontal === null) {
      return {
        hitPoint  : hitPointVertical,
        hitObject : objectHitVertical
      }
    }
    else if (hitPointHorizontal && hitPointVertical === null) {
      return {
        hitPoint  : hitPointHorizontal,
        hitObject : objectHitHorizontal
      }
    }
    else if (hitPointHorizontal && hitPointVertical) {
      const verticalHitDistanceFromPlayer   = Math.sqrt(Math.pow(  hitPointVertical.x, 2) + Math.pow(  hitPointVertical.y, 2))
      const horizontalHitDistanceFromPlayer = Math.sqrt(Math.pow(hitPointHorizontal.x, 2) + Math.pow(hitPointHorizontal.y, 2))
      if (verticalHitDistanceFromPlayer > horizontalHitDistanceFromPlayer) {
        return {
          hitPoint  : hitPointHorizontal,
          hitObject : objectHitHorizontal
        }
      } else {
        return {
          hitPoint  : hitPointVertical,
          hitObject : objectHitVertical
        }
      }
    }
    else if (hitPointHorizontal === null && hitPointVertical === null) {
      // If nothing is hit, just return the last closest point!
      const hitPointHorizontal = { x: -xIntercept, y: -tileStepY - p.deltas.dyTop }
      const hitPointVertical   = { x: - tileStepX - p.deltas.dxLeft, y: -yIntercept }
      const verticalHitDistanceFromPlayer   = Math.sqrt(Math.pow(  hitPointVertical.x, 2) + Math.pow(  hitPointVertical.y, 2))
      const horizontalHitDistanceFromPlayer = Math.sqrt(Math.pow(hitPointHorizontal.x, 2) + Math.pow(hitPointHorizontal.y, 2))
      if (verticalHitDistanceFromPlayer > horizontalHitDistanceFromPlayer) {
        return {
          hitPoint  : hitPointHorizontal,
          hitObject : objectHitHorizontal
        }
      } else {
        return {
          hitPoint  : hitPointVertical,
          hitObject : objectHitVertical
        }
      }
    }
  }

  // TODO: This is a naive implementation! Add 6x optimization
  private static getInterceptPointSW(p: Point, theta: number, pEnd?: Point): { hitPoint: Point, hitObject: GameObject } {
    // ########################################################################
    // Vertical Intercepts
    // ########################################################################
    let hitPointVertical: Point = null
    let objectHitVertical: GameObject = null

    let i = 0
    let yIntercept
    let tileStepX

    while (true) {
      tileStepX = i * CONFIG.TILE_SIZE
      if (theta === 0) {
        yIntercept = 0
      } else {
        yIntercept = (p.deltas.dxLeft + tileStepX) * Math.tan(Math.PI - theta)
      }

      // Outside of screen check
      if ((tileStepX + p.deltas.dxLeft > Raycaster.rangeHorizontal) || (yIntercept > Raycaster.rangeVertical)) {
        break
      }

      // Don't cast beyond pEnd
      if (pEnd) {
        if (tileStepX + p.deltas.dxLeft > (p.x - pEnd.x) || yIntercept > (pEnd.y - p.y)) {
          break
        }
      }

      if (CONFIG.RAYCASTER.DEBUG) {
        let coordinates: Point
        if (pEnd) {
          coordinates = {
            x: Canvas.center.x - (pEnd.x - p.x) - p.deltas.dxLeft - tileStepX,
            y: Canvas.center.y - (pEnd.y - p.y) + yIntercept,
          }
        } else {
          coordinates = {
            x: Canvas.center.x - p.deltas.dxLeft - tileStepX,
            y: Canvas.center.y + yIntercept,
          }
        }
        context.strokeStyle = '#4444FF'
        context.beginPath()
        context.arc(coordinates.x, coordinates.y, 2, 0, (2 * Math.PI))
        context.stroke()
      }

      objectHitVertical = Raycaster.checkGameObjectCollisionVerticalSW(i, p, yIntercept)

      if (objectHitVertical) {
        hitPointVertical = { x: -tileStepX - p.deltas.dxLeft, y: yIntercept }
        break
      }
      ++i
    }

    // ########################################################################
    // Horizontal Intercepts
    // ########################################################################
    let hitPointHorizontal: Point = null
    let objectHitHorizontal: GameObject = null

    let j = 0
    let xIntercept
    let tileStepY

    while (true) {
      tileStepY = j * CONFIG.TILE_SIZE
      if (theta === 0) {
        break
      } else {
        xIntercept = (p.deltas.dyBottom + tileStepY) / Math.tan(theta)
      }

      // Outside of screen check
      if ((tileStepY + p.deltas.dyBottom > Raycaster.rangeVertical) || (-xIntercept > Raycaster.rangeHorizontal)) {
        break
      }

      // Don't cast beyond pEnd
      if (pEnd) {
        if ((tileStepY + p.deltas.dyBottom > (pEnd.y - p.y)) || (-xIntercept > (p.x - pEnd.x))) {
          break
        }
      }

      if (CONFIG.RAYCASTER.DEBUG) {
        let coordinates: Point
        if (pEnd) {
          coordinates = {
            x: Canvas.center.x - (pEnd.x - p.x) + xIntercept,
            y: Canvas.center.y - (pEnd.y - p.y) + p.deltas.dyBottom + tileStepY,
          }
        } else {
          coordinates = {
            x: Canvas.center.x + xIntercept,
            y: Canvas.center.y + p.deltas.dyBottom + tileStepY,
          }
        }
        context.strokeStyle = '#44FF44'
        context.beginPath()
        context.arc(coordinates.x, coordinates.y, 2, 0, (2 * Math.PI))
        context.stroke()
      }

      // Catch up with the horizontal intercept
      if (yIntercept < tileStepY) {
        break
      }

      objectHitHorizontal = Raycaster.checkGameObjectCollisionHorizontalSW(j, p, xIntercept)

      if (objectHitHorizontal) {
        hitPointHorizontal = { x: xIntercept, y: tileStepY + p.deltas.dyBottom }
        break
      }
      ++j
    }

    // ########################################################################
    // Return the closer hit point & hit object
    // ########################################################################

    if (hitPointVertical && hitPointHorizontal === null) {
      return {
        hitPoint  : hitPointVertical,
        hitObject : objectHitVertical
      }
    }
    else if (hitPointHorizontal && hitPointVertical === null) {
      return {
        hitPoint  : hitPointHorizontal,
        hitObject : objectHitHorizontal
      }
    }
    else if (hitPointHorizontal && hitPointVertical) {
      const verticalHitDistanceFromPlayer   = Math.sqrt(Math.pow(  hitPointVertical.x, 2) + Math.pow(  hitPointVertical.y, 2))
      const horizontalHitDistanceFromPlayer = Math.sqrt(Math.pow(hitPointHorizontal.x, 2) + Math.pow(hitPointHorizontal.y, 2))
      if (verticalHitDistanceFromPlayer > horizontalHitDistanceFromPlayer) {
        return {
          hitPoint  : hitPointHorizontal,
          hitObject : objectHitHorizontal
        }
      } else {
        return {
          hitPoint  : hitPointVertical,
          hitObject : objectHitVertical
        }
      }
    }
    else if (hitPointHorizontal === null && hitPointVertical === null) {
      // If nothing is hit, just return the last closest point!
      const hitPointHorizontal = { x: xIntercept, y: tileStepY + p.deltas.dyBottom }
      const hitPointVertical   = { x: -tileStepX - p.deltas.dxLeft, y: yIntercept }
      const verticalHitDistanceFromPlayer   = Math.sqrt(Math.pow(  hitPointVertical.x, 2) + Math.pow(  hitPointVertical.y, 2))
      const horizontalHitDistanceFromPlayer = Math.sqrt(Math.pow(hitPointHorizontal.x, 2) + Math.pow(hitPointHorizontal.y, 2))
      if (verticalHitDistanceFromPlayer > horizontalHitDistanceFromPlayer) {
        return {
          hitPoint  : hitPointHorizontal,
          hitObject : objectHitHorizontal
        }
      } else {
        return {
          hitPoint  : hitPointVertical,
          hitObject : objectHitVertical
        }
      }
    }
  }

  private static checkGameObjectCollisionVerticalSE(i: number, p: Point, yIntercept: number): GameObject {
    const xTile = 1 + p.col + i
    const yTile = p.row + Math.floor((p.deltas.dyTop + yIntercept) / CONFIG.TILE_SIZE)
    const yTile_aboveByOnePixel = p.row + Math.floor((p.deltas.dyTop + yIntercept - 1) / CONFIG.TILE_SIZE)

    let gameObjectHit = null
    if (gameObjects[yTile]) {
      if (gameObjects[yTile][xTile]) {
        gameObjectHit = gameObjects[yTile][xTile]
      }
      else if (gameObjects[yTile_aboveByOnePixel][xTile]) {
        gameObjectHit = gameObjects[yTile_aboveByOnePixel][xTile]
      }
    }

    if (CONFIG.RAYCASTER.DEBUG) {
      context.fillText(`col: ${xTile}, row: ${yTile}, hit: ${gameObjectHit ? [gameObjectHit.row, gameObjectHit.col] : null}`, 10, 112 + i * 12)
    }

    return gameObjectHit
  }
  private static checkGameObjectCollisionHorizontalSE(i: number, p: Point, xIntercept: number): GameObject {
    const xTile = p.col + Math.floor((p.deltas.dxLeft + xIntercept) / CONFIG.TILE_SIZE)
    const yTile = p.row + i + 1

    let gameObjectHit = null
    if (gameObjects[yTile] && gameObjects[yTile][xTile]) {
      gameObjectHit = gameObjects[yTile][xTile]
    }

    if (CONFIG.RAYCASTER.DEBUG) {
      context.fillText(`col: ${xTile}, row: ${yTile}, hit: ${gameObjectHit ? [gameObjectHit.row, gameObjectHit.col] : null}`, 10, 212 + i * 12)
    }

    return gameObjectHit
  }

  private static checkGameObjectCollisionVerticalNE(i: number, p: Point, yIntercept: number): GameObject {
    const xTile = 1 + p.col + i
    const yTile = p.row + Math.floor((p.deltas.dyTop - yIntercept) / CONFIG.TILE_SIZE)

    let gameObjectHit = null
    if (gameObjects[yTile] && gameObjects[yTile][xTile]) {
      gameObjectHit = gameObjects[yTile][xTile]
    }

    if (CONFIG.RAYCASTER.DEBUG) {
      context.fillText(`col: ${xTile}, row: ${yTile}, hit: ${gameObjectHit ? [gameObjectHit.row, gameObjectHit.col] : null}`, 10, 112 + i * 12)
    }

    return gameObjectHit
  }
  private static checkGameObjectCollisionHorizontalNE(i: number, p: Point, xIntercept: number): GameObject {
    const xTile = p.col + Math.floor((p.deltas.dxLeft + xIntercept) / CONFIG.TILE_SIZE)
    const xTile_leftByOnePixel = p.col + Math.floor((p.deltas.dxLeft + xIntercept - 1) / CONFIG.TILE_SIZE)
    const yTile = p.row - i - 1

    let gameObjectHit = null
    if (gameObjects[yTile]) {
      if (gameObjects[yTile][xTile]) {
        gameObjectHit = gameObjects[yTile][xTile]
      }
      else if (gameObjects[yTile][xTile_leftByOnePixel]) {
        gameObjectHit = gameObjects[yTile][xTile_leftByOnePixel]
      }
    }

    if (CONFIG.RAYCASTER.DEBUG) {
      context.fillText(`col: ${xTile}, row: ${yTile}, hit: ${gameObjectHit ? [gameObjectHit.row, gameObjectHit.col] : null}`, 10, 212 + i * 12)
    }

    return gameObjectHit
  }

  private static checkGameObjectCollisionVerticalNW(i: number, p: Point, yIntercept: number): GameObject {
    const xTile = - 1 + p.col - i
    const yTile = p.row + Math.floor((p.deltas.dyTop - yIntercept) / CONFIG.TILE_SIZE)

    let gameObjectHit = null
    if (gameObjects[yTile] && gameObjects[yTile][xTile]) {
      gameObjectHit = gameObjects[yTile][xTile]
    }

    if (CONFIG.RAYCASTER.DEBUG) {
      context.fillText(`col: ${xTile}, row: ${yTile}, hit: ${gameObjectHit ? [gameObjectHit.row, gameObjectHit.col] : null}`, 10, 112 + i * 12)
    }

    return gameObjectHit
  }
  private static checkGameObjectCollisionHorizontalNW(i: number, p: Point, xIntercept: number): GameObject {
    const xTile = p.col - Math.floor((p.deltas.dxRight + xIntercept) / CONFIG.TILE_SIZE)
    const yTile = p.row - i - 1

    let gameObjectHit = null
    if (gameObjects[yTile] && gameObjects[yTile][xTile]) {
      gameObjectHit = gameObjects[yTile][xTile]
    }

    if (CONFIG.RAYCASTER.DEBUG) {
      context.fillText(`col: ${xTile}, row: ${yTile}, hit: ${gameObjectHit ? [gameObjectHit.row, gameObjectHit.col] : null}`, 10, 212 + i * 12)
    }

    return gameObjectHit
  }

  private static checkGameObjectCollisionVerticalSW(i: number, p: Point, yIntercept: number): GameObject {
    const xTile = p.col - i - 1
    const yTile = p.row + Math.floor((p.deltas.dyTop + yIntercept) / CONFIG.TILE_SIZE)
    const yTile_aboveByOnePixel = p.row + Math.floor((p.deltas.dyTop + yIntercept - 1) / CONFIG.TILE_SIZE)

    let gameObjectHit = null
    if (gameObjects[yTile]) {
      if (gameObjects[yTile][xTile]) {
        gameObjectHit = gameObjects[yTile][xTile]
      }
      else if (gameObjects[yTile_aboveByOnePixel][xTile]) {
        gameObjectHit = gameObjects[yTile_aboveByOnePixel][xTile]
      }
    }

    if (CONFIG.RAYCASTER.DEBUG) {
      context.fillText(`col: ${xTile}, row: ${yTile}, hit: ${gameObjectHit ? [gameObjectHit.row, gameObjectHit.col] : null}`, 10, 112 + i * 12)
    }

    return gameObjectHit
  }
  private static checkGameObjectCollisionHorizontalSW(i: number, p: Point, xIntercept: number): GameObject {
    const xTile = p.col - Math.floor((p.deltas.dxRight - xIntercept) / CONFIG.TILE_SIZE)
    const yTile = p.row + i + 1

    let gameObjectHit = null
    if (gameObjects[yTile] && gameObjects[yTile][xTile]) {
      gameObjectHit = gameObjects[yTile][xTile]
    }

    if (CONFIG.RAYCASTER.DEBUG) {
      context.fillText(`col: ${xTile}, row: ${yTile}, hit: ${gameObjectHit ? [gameObjectHit.row, gameObjectHit.col] : null}`, 10, 212 + i * 12)
    }

    return gameObjectHit
  }
}
