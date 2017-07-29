
import Factory from '../Factory'

// package bricks
import AffineCipherEncoder from '../Encoder/AffineCipher'
import HashViewer from '../Viewer/Hash'
import ROT13Encoder from '../Encoder/ROT13'
import TextTransformEncoder from '../Encoder/TextTransform'
import TextViewer from '../Viewer/Text'
import VigenereCipherEncoder from '../Encoder/VigenereCipher'

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
    this.register('hash', HashViewer)
    this.register('rot13', ROT13Encoder)
    this.register('text-transform', TextTransformEncoder)
    this.register('text', TextViewer)
    this.register('vigenere-cipher', VigenereCipherEncoder)
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
