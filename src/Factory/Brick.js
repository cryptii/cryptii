
import Factory from '../Factory'

// Package bricks
import AffineCipherEncoder from '../Encoder/AffineCipher'
import AlphabeticalSubstitutionEncoder from '../Encoder/AlphabeticalSubstitution'
import Ascii85Encoder from '../Encoder/Ascii85'
import Base64Encoder from '../Encoder/Base64'
import BitwiseOperationEncoder from '../Encoder/BitwiseOperation'
import BlockCipherEncoder from '../Encoder/BlockCipher'
import BootstringEncoder from '../Encoder/Bootstring'
import BytesViewer from '../Viewer/Bytes'
import CaesarCipherEncoder from '../Encoder/CaesarCipher'
import EnigmaEncoder from '../Encoder/Enigma'
import HashEncoder from '../Encoder/Hash'
import HMACEncoder from '../Encoder/HMAC'
import IntegerEncoder from '../Encoder/Integer'
import MorseCodeEncoder from '../Encoder/MorseCode'
import NumeralSystemEncoder from '../Encoder/NumeralSystem'
import PunycodeEncoder from '../Encoder/Punycode'
import ROT13Encoder from '../Encoder/ROT13'
import SpellingAlphabetEncoder from '../Encoder/SpellingAlphabet'
import TextTransformEncoder from '../Encoder/TextTransform'
import TextViewer from '../Viewer/Text'
import UnicodeCodePointsEncoder from '../Encoder/UnicodeCodePoints'
import URLEncoder from '../Encoder/URL'
import VigenereCipherEncoder from '../Encoder/VigenereCipher'

// Singleton instance
let instance = null

/**
 * Factory for brick objects
 */
export default class BrickFactory extends Factory {
  /**
   * Brick factory constructor
   */
  constructor () {
    super()

    // Gather package brick classes
    const invokables = [
      TextViewer,
      BytesViewer,
      TextTransformEncoder,
      NumeralSystemEncoder,
      BitwiseOperationEncoder,
      MorseCodeEncoder,
      SpellingAlphabetEncoder,
      AlphabeticalSubstitutionEncoder,
      ROT13Encoder,
      AffineCipherEncoder,
      CaesarCipherEncoder,
      VigenereCipherEncoder,
      EnigmaEncoder,
      Base64Encoder,
      Ascii85Encoder,
      URLEncoder,
      PunycodeEncoder,
      BootstringEncoder,
      UnicodeCodePointsEncoder,
      IntegerEncoder,
      BlockCipherEncoder,
      HashEncoder,
      HMACEncoder
    ]

    // Register each brick
    invokables.forEach(this.register.bind(this))
  }

  /**
   * Registers brick invokable.
   * @param {class} invokable
   * @throws If identifier already exists.
   * @return {BrickFactory} Fluent interface
   */
  register (invokable) {
    const identifier = invokable.getMeta().name
    return super.register(identifier, invokable)
  }

  /**
   * Returns brick meta for given identifier.
   * @throws If identifier does not exist.
   * @param {string} identifier
   * @return {object} Brick meta
   */
  getMeta (identifier) {
    return this.getInvokable(identifier).getMeta()
  }

  /**
   * Returns array of brick meta objects.
   * @return {object[]}
   */
  getLibrary () {
    return this.getIdentifiers()
      .map(identifier => this.getMeta(identifier))
  }

  /**
   * Get brick factory singleton instance.
   * @return {BrickFactory}
   */
  static getInstance () {
    if (instance === null) {
      instance = new BrickFactory()
    }
    return instance
  }
}
