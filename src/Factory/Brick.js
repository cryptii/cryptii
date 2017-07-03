
import Factory from '../Factory'

// package bricks
import AffineCipherEncoder from '../Encoder/AffineCipher'
import ROT13Encoder from '../Encoder/ROT13'

// singleton instance
let instance = null

/**
 * Factory for Brick objects.
 */
export default class BrickFactory extends Factory {
  /**
   * Brick Factory constructor.
   */
  constructor () {
    super()

    // register package bricks
    this.register('affine-cipher', AffineCipherEncoder)
    this.register('rot13', ROT13Encoder)
  }

  /**
   * Get brick factory singleton instance.
   */
  static getInstance () {
    if (instance === null) {
      instance = new BrickFactory()
    }
    return instance
  }
}
