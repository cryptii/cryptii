import Factory from '../Factory.js'

// Package bricks
import A1Z26Encoder from '../Encoder/A1Z26.js'
import ADFGXCipherEncoder from '../Encoder/ADFGXCipher.js'
import AffineCipherEncoder from '../Encoder/AffineCipher.js'
import AlphabeticalSubstitutionEncoder from '../Encoder/AlphabeticalSubstitution.js'
import Ascii85Encoder from '../Encoder/Ascii85.js'
import BaconCipherEncoder from '../Encoder/BaconCipher.js'
import Base32Encoder from '../Encoder/Base32.js'
import Base64Encoder from '../Encoder/Base64.js'
import BaudotCodeEncoder from '../Encoder/BaudotCode.js'
import BifidCipherEncoder from '../Encoder/BifidCipher.js'
import BitwiseOperationEncoder from '../Encoder/BitwiseOperation.js'
import BlockCipherEncoder from '../Encoder/BlockCipher.js'
import BootstringEncoder from '../Encoder/Bootstring.js'
import BytesViewer from '../Viewer/Bytes.js'
import CaesarCipherEncoder from '../Encoder/CaesarCipher.js'
import CaseTransformEncoder from '../Encoder/CaseTransform.js'
import EnigmaEncoder from '../Encoder/Enigma.js'
import HashEncoder from '../Encoder/Hash.js'
import HMACEncoder from '../Encoder/HMAC.js'
import IntegerEncoder from '../Encoder/Integer.js'
import MorseCodeEncoder from '../Encoder/MorseCode.js'
import NihilistCipherEncoder from '../Encoder/NihilistCipher.js'
import NumeralSystemEncoder from '../Encoder/NumeralSystem.js'
import PunchedTapeViewer from '../Viewer/PunchedTape.js'
import PolybiusSquareEncoder from '../Encoder/PolybiusSquare.js'
import PunycodeEncoder from '../Encoder/Punycode.js'
import RailFenceCipherEncoder from '../Encoder/RailFenceCipher.js'
import RC4Encoder from '../Encoder/RC4.js'
import ReplaceEncoder from '../Encoder/Replace.js'
import ReverseEncoder from '../Encoder/Reverse.js'
import ROT13Encoder from '../Encoder/ROT13.js'
import SpellingAlphabetEncoder from '../Encoder/SpellingAlphabet.js'
import TapCodeEncoder from '../Encoder/TapCode.js'
import TextViewer from '../Viewer/Text.js'
import TrifidCipherEncoder from '../Encoder/TrifidCipher.js'
import UnicodeCodePointsEncoder from '../Encoder/UnicodeCodePoints.js'
import URLEncoder from '../Encoder/URL.js'
import VigenereCipherEncoder from '../Encoder/VigenereCipher.js'

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
      // View
      TextViewer,
      BytesViewer,
      PunchedTapeViewer,

      // Transform
      ReplaceEncoder,
      ReverseEncoder,
      CaseTransformEncoder,
      NumeralSystemEncoder,
      BitwiseOperationEncoder,

      // Alphabets
      MorseCodeEncoder,
      SpellingAlphabetEncoder,

      // Ciphers
      EnigmaEncoder,
      CaesarCipherEncoder,
      AffineCipherEncoder,
      ROT13Encoder,
      A1Z26Encoder,
      VigenereCipherEncoder,
      BaconCipherEncoder,
      AlphabeticalSubstitutionEncoder,
      RailFenceCipherEncoder,

      // Polybius square ciphers
      PolybiusSquareEncoder,
      ADFGXCipherEncoder,
      BifidCipherEncoder,
      NihilistCipherEncoder,
      TapCodeEncoder,
      TrifidCipherEncoder,

      // Encoding
      Base32Encoder,
      Base64Encoder,
      Ascii85Encoder,
      BaudotCodeEncoder,
      UnicodeCodePointsEncoder,
      URLEncoder,
      PunycodeEncoder,
      BootstringEncoder,
      IntegerEncoder,

      // Modern cryptography
      BlockCipherEncoder,
      RC4Encoder,
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
