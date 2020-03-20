
import ArrayUtil from './Util/ArrayUtil'
import Base64Encoder from './Encoder/Base64Encoder'
import InvalidInputError from './Error/InvalidInputError'
import UnicodeEncoder from './Encoder/UnicodeEncoder'
import UTF8Encoder from './Encoder/UTF8Encoder'

/**
 * It is called TypeScript but it does not even know about typed arrays.
 */
export type TypedArray =
  Int8Array |
  Uint8Array |
  Int16Array |
  Uint16Array |
  Int32Array |
  Uint32Array |
  Uint8ClampedArray |
  Float32Array |
  Float64Array;

/**
 * Value types that Chain objects can be created from.
 */
export type ChainValueType =
  TypedArray | ArrayBuffer | number[] | string | Chain | undefined;

/**
 * Immutable container for arbitrary binary data. It is basically the least
 * common denominator of 'content' being exchanged between Bricks. Chains can be
 * created using the {@link Chain.from} method.
 *
 * Stores, serializes and extracts n-bit sized (not necessarily byte-sized)
 * binary data. Chain objects containing binary data that is not byte-sized have
 * non-zero paddings.
 *
 * Chains offer convenience operations on the UTF-8 text representation (e.g.
 * `getCodePoints`, `getLength`, `getString`). If the binary data is not
 * valid UTF-8 encoded text interacting with such operations will throw. You may
 * guard against this using {@link Chain.isTextEncoded}.
 */
export default class Chain {
  /**
   * Empty instance object
   */
  private static empty?: Chain

  /**
   * Lazily created binary data buffer
   */
  private buffer?: ArrayBuffer

  /**
   * Number of bits of padding that were appended to the bytes array
   * comprising the actual contents. Set of values: 0-7
   */
  private padding: number

  /**
   * Lazily created Unicode code points representation
   */
  private codePoints?: number[]

  /**
   * Lazily created string representation
   */
  private string?: string

  /**
   * Attention! Use {@link Chain.from} to create new Chain objects from values.
   * This constructor is for internal use only and may change.
   * @param value - Value to create a Chain instance from
   * @param padding - Value bit padding, if value is an ArrayBuffer
   */
  constructor (value?: ArrayBuffer | string | number[], padding: number = 0) {
    if (value === undefined) {
      // Create empty Chain singleton
      this.buffer = new ArrayBuffer(0)
      this.padding = 0
      this.codePoints = []
      this.string = ''
    } else if (value instanceof ArrayBuffer) {
      // Create Chain instance from ArrayBuffer
      this.buffer = value
      this.padding = padding
    } else if (typeof value === 'string') {
      // Create Chain instance from string
      this.string = value
      // There is no bit padding in UTF-8 content
      this.padding = 0
    } else {
      // Assume this to be an array of code points
      this.codePoints = value
      // There is no bit padding in UTF-8 content
      this.padding = 0
    }
  }

  /**
   * Creates a Chain object from the given value. Supported types: ArrayBuffer,
   * typed arrays, a simple array of code points or strings.
   * @example Different ways to create the exact same Chain object
   *   Chain.from('🦊🚀')
   *   Chain.from([129418, 128640])
   *   Chain.from(new Uint8Array([240, 159, 166, 138, 240, 159, 154, 128]))
   * @param value - Content value
   * @param padding - Number of bits of padding that were appended to the bytes
   * array comprising the actual contents. Set of values: 0-7
   */
  static from (
    value: ChainValueType,
    padding: number = 0
  ): Chain {
    // Bail out early if already having a Chain instance
    if (value instanceof Chain) {
      return value
    }

    // Provide an empty chain singleton for all possible empty values
    if (value === undefined || (value instanceof ArrayBuffer
        ? value.byteLength : value.length) === 0) {
      // Verify padding
      if (padding !== 0) {
        throw new Error('Chain.from expects a zero-padding for empty values')
      }
      // Lazily instantiate empty Chain object if not done, yet
      if (this.empty === undefined) {
        this.empty = new Chain(undefined)
      }
      return this.empty
    }

    // Create Chain instance from a string
    if (typeof value === 'string') {
      return new Chain(value)
    }

    // Create Chain instance from an array of code points
    if (Object.prototype.toString.call(value) === '[object Array]') {
      if (!UnicodeEncoder.validateCodePoints(value as number[])) {
        throw new Error('Chain.from expects a valid array of code points')
      }
      return new Chain(value)
    }

    // Verify padding range
    if (isNaN(padding) || padding < 0 || padding > 7 ||
        Math.floor(padding) !== padding) {
      throw new Error('Chain.from expects padding values between 0 and 7 incl.')
    }

    // Create a copy of the binary content buffer to make sure the content of
    // the chain stays immutable from the outside
    const buffer =
      value instanceof ArrayBuffer
        ? value.slice(0)
        : (value as TypedArray).buffer.slice(0)

    // Set padding bits to 0
    if (padding > 0 && buffer.byteLength > 0) {
      const bytes = new Uint8Array(buffer)
      bytes[bytes.length - 1] &= 0xff >> padding << padding
    }

    return new Chain(buffer, padding)
  }

  /**
   * Lazily creates a content buffer and returns a copy of it.
   */
  getBuffer (): ArrayBuffer {
    if (this.buffer === undefined) {
      const bytes = UTF8Encoder.bytesFromCodePoints(this.getCodePoints())
      this.buffer = bytes.buffer
    }
    return this.buffer.slice(0)
  }

  /**
   * Returns the binary content as an array of data chunks of given bit length.
   * @param unitBits - Chunk unit bit length
   * @returns Array of data chunks
   */
  getUnits (unitBits: number = 8): number[]|Uint8Array {
    return ArrayUtil.resizeBitSizedArray(this.getBytes(), 8, unitBits)
  }

  /**
   * Returns the number of units, depending on the given number of bits in each
   * unit, that is necessary to comprise the binary content of this object.
   * @param unitBits - Unit bit length
   */
  getSize (unitBits: number = 8): number {
    const bitSize = this.getBuffer().byteLength * 8 - this.padding
    return Math.ceil(bitSize / unitBits)
  }

  /**
   * Returns the byte-sized representation of the content.
   */
  getBytes (): Uint8Array {
    return new Uint8Array(this.getBuffer())
  }

  /**
   * Returns the number of bits of padding that were appended to the bytes array
   * comprising the actual contents. Set of values: 0-7
   */
  getPadding (): number {
    return this.padding
  }

  /**
   * Returns true, if the text representation is available without the need to
   * implicitly UTF-8 decode it from the binary representation which may throw.
   */
  isTextEncoded (): boolean {
    return this.codePoints !== undefined || this.string !== undefined
  }

  /**
   * Returns the Unicode code point representation of the content.
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @returns Array of Unicode code points
   */
  getCodePoints (): number[] {
    if (this.codePoints === undefined) {
      if (this.padding > 0) {
        throw new InvalidInputError(
          'UTF-8 encoded content must not have a non-zero bit padding')
      }
      if (this.string !== undefined) {
        // Retrieve code points from string representation
        this.codePoints = UnicodeEncoder.codePointsFromString(this.string)
      } else {
        // Retrieve code points from byte representation (may throw)
        this.codePoints = UTF8Encoder.codePointsFromBytes(this.getBytes())
      }
    }
    return this.codePoints
  }

  /**
   * Returns a Unicode code point at given index.
   * @param index - Unicode code point index
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @return Unicode code point or undefined, if index is out of bounds
   */
  getCodePointAt (index: number): number {
    return this.getCodePoints()[index]
  }

  /**
   * Returns an array of Unicode character strings.
   * @throws {Error} If lazy implicit encoding from binary to text fails
   */
  getChars (): string[] {
    return this.getCodePoints().map(codePoint =>
      UnicodeEncoder.stringFromCodePoints([codePoint]))
  }

  /**
   * Returns the string representation of Unicode character at given index.
   * @param index - Unicode code point index
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @returns Character string
   */
  getCharAt (index: number) {
    return UnicodeEncoder.stringFromCodePoints([this.getCodePointAt(index)])
  }

  /**
   * Returns the byte representation of a Unicode character at the given index.
   * @param index - Unicode code point index
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @returns Character bytes
   */
  getCharBytesAt (index: number): Uint8Array {
    const codePoints = this.getCodePoints()
    return UTF8Encoder.bytesFromCodePoints([codePoints[index]])
  }

  /**
   * Number of Unicode code points of the text representation. Please be aware
   * that the number of code points may differ from the string length.
   * @throws {Error} If lazy implicit encoding from binary to text fails
   */
  getLength (): number {
    return this.getCodePoints().length
  }

  /**
   * Returns the string representation of the content.
   * @throws {Error} If lazy implicit encoding from binary to text fails
   */
  getString (): string {
    if (this.string === undefined) {
      this.string = UnicodeEncoder.stringFromCodePoints(this.getCodePoints())
    }
    return this.string
  }

  /**
   * Alias to {@link Chain.getString}.
   * @throws {Error} If lazy implicit encoding from binary to text fails
   */
  toString (): string {
    return this.getString()
  }

  /**
   * Returns the first Unicode code point index at which a given string can be
   * found. If it can't be found -1 is returned.
   * @param needle - Search element
   * @param start - Index to start the search at
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @returns Unicode code point index; -1 if not found
   */
  indexOfString (needle: string | Chain, start: number): number {
    const stringIndex = this.getString().indexOf(needle.toString(), start)
    if (stringIndex === -1) {
      return -1
    } else {
      return this.toUnicodeIndex(stringIndex)
    }
  }

  /**
   * Returns the first index at which a given code point can be found
   * and -1 if not found.
   * @param codePoint - Unicode code point to search for
   * @param start - Index to start the search at
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @returns Code point index or -1 if not found
   */
  indexOfCodePoint (codePoint: number, start?: number): number {
    return this.getCodePoints().indexOf(codePoint, start)
  }

  /**
   * Maps the given string index to an Unicode code point index.
   * @param stringIndex - Native string index
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @returns Unicode code point index
   */
  toUnicodeIndex (stringIndex: number) {
    const leftPart = this.getString().substr(0, stringIndex)
    const leftPartCodePoints = UnicodeEncoder.codePointsFromString(leftPart)
    return leftPartCodePoints.length
  }

  /**
   * Maps the given Unicode code point index into a string index.
   * @param index - Unicode code point index
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @returns Native string index
   */
  toStringIndex (index: number) {
    const codePoints = this.getCodePoints().slice(0, index)
    const leftPartString = UnicodeEncoder.stringFromCodePoints(codePoints)
    return leftPartString.length
  }

  /**
   * Returns the text representation characters beginning at the specified
   * Unicode code point start index through the specified number of characters.
   * @param start - Start Unicode character index
   * @param length - Number of Unicode characters
   * @throws {Error} If lazy implicit encoding from binary to text fails
   * @returns Chain instance containing the substring
   */
  substr (start: number, length?: number): Chain {
    if (length !== undefined && (length <= 0 || start >= this.getLength())) {
      return Chain.from('')
    } else if (start < 0) {
      start = Math.max(this.getLength() + start, 0)
    }
    const codePoints = this.getCodePoints().slice(
      start, length ? start + length : undefined)
    return Chain.from(codePoints)
  }

  /**
   * Splits the Chain content into an array of Chain objects by separating it,
   * using the specified separator to determine where to make each split.
   * @param separator - Split separator
   * @param limit - Split limit
   */
  splitString (separator: string | Chain, limit?: number): Chain[] {
    return this.getString()
      .split(separator.toString(), limit)
      .map(stringPart => Chain.from(stringPart))
  }

  /**
   * Creates a mixed alphabet by extending this Chain content by the given one.
   * @param alphabet - Alphabet the target should be extended by.
   * @returns Mixed alphabet
   */
  extendString (alphabet: ChainValueType): Chain {
    const key = this.getCodePoints()
    const codePoints = Chain.from(alphabet).getCodePoints()
    const mixedAlphabet = key.slice()
    let element
    let i = 0
    while (mixedAlphabet.length < codePoints.length && i < codePoints.length) {
      element = codePoints[i++]
      if (key.indexOf(element) === -1) {
        mixedAlphabet.push(element)
      }
    }
    return Chain.from(mixedAlphabet)
  }

  /**
   * Lower case the text representation of this chain and return a new instance.
   * @throws {Error} If lazy implicit encoding from binary to text fails
   */
  toLowerCase (): Chain {
    return Chain.from(this.getString().toLowerCase())
  }

  /**
   * Upper case the text representation of this chain and return a new instance.
   * @throws {Error} If lazy implicit encoding from binary to text fails
   */
  toUpperCase (): Chain {
    return Chain.from(this.getString().toUpperCase())
  }

  /**
   * Returns wether the given Chain is contained within this Chain.
   * @param needle - Needle to search for in the haystack chain
   * @param bitSize - Unit bit size to compare Chains with (defaults to bytes)
   * @returns True, if the given Chain is contained within this Chain instance
   */
  contains (needle: ChainValueType, bitSize: number = 8): boolean {
    const needleChain = Chain.from(needle)
    if (bitSize === 8 && needleChain.isTextEncoded() && this.isTextEncoded()) {
      return this.getString().indexOf(needleChain.getString()) !== -1
    } else {
      const haystackUnits = this.getUnits(bitSize)
      const needleUnits = needleChain.getUnits(bitSize)
      return ArrayUtil.indexOfSlice(haystackUnits, needleUnits) !== -1
    }
  }

  /**
   * Returns true, if this Chain instance is empty.
   */
  isEmpty (): boolean {
    return this === Chain.empty
  }

  /**
   * Efficiently compares two Chain objects with each other.
   * @param chain - Object to compare Chain to
   * @returns Returns true, if both Chain objects are considered equal
   */
  isEqualTo (chain: any): boolean {
    // Compare pointer (fastest)
    if (chain === this) {
      return true
    }

    // Verify chain instance
    if (!(chain instanceof Chain)) {
      return false
    }

    // If the text representation is already available, compare it efficiently
    if (this.isTextEncoded() && chain.isTextEncoded()) {
      return this.getString() === chain.getString()
    }

    // Compare binary data
    // UTF-8 encoding text to binary data is safe
    return (
      this.getPadding() === chain.getPadding() &&
      ArrayUtil.isEqual(this.getBytes(), chain.getBytes())
    )
  }

  /**
   * Returns a string describing the content of this Chain. Tuncates the
   * description to the given length. Useful for logging, debugging and for
   * labeling unit tests.
   */
  describe (truncateLength = 60): string {
    if (this.string !== undefined) {
      // Describe string as-is
      if (this.string.length > truncateLength) {
        return this.string.substr(0, truncateLength - 1) + '…'
      }
      return this.string
    } else if (this.codePoints !== undefined) {
      // Describe Unicode code points
      truncateLength -= 12
      let string = ''
      let i = -1
      while (++i < this.codePoints.length && string.length < truncateLength) {
        string += (i > 0 ? ', ' : '') + this.codePoints[i]
      }
      if (i !== this.codePoints.length) {
        string += ', …'
      }
      return `unicode(${string})`
    } else {
      // Describe binary value
      truncateLength -= 11
      let string = Base64Encoder.encode(this.getBytes())
      if (string.length > truncateLength) {
        string = string.substr(0, truncateLength - 1) + '…'
      }
      return `binary(${string}, ${this.padding})`
    }
  }

  /**
   * Serializes the content of this Chain object into a value that can later
   * be extracted using {@link Chain.extract} to retrieve its original state.
   * @returns Serialized data string
   */
  serialize (): string | object {
    if (this.isTextEncoded()) {
      return this.getString()
    }
    const data = Base64Encoder.encode(this.getBytes())
    return this.padding === 0 ? { data } : { data, padding: this.padding }
  }

  /**
   * Extracts a Chain object serialized by {@link Chain.serialize}
   * @param value - Serialized data
   * @returns Extracted Chain instance
   */
  static extract (value: any): Chain {
    if (typeof value === 'string') {
      return Chain.from(value)
    }

    if (typeof value !== 'object' || value.data === undefined) {
      throw new Error('Unexpected Chain format')
    }

    if (value.padding !== undefined && typeof value.padding !== 'number') {
      throw new Error('Unexpected Chain padding')
    }

    const bytes = Base64Encoder.decode(value.data)
    const padding = value.padding || 0
    return Chain.from(bytes, padding)
  }

  /**
   * Joins an array of elements together to a Chain.
   * @example Joining binary chains with non-zero paddings
   *   const a = Chain.from(new Uint8Array([0b10001100, 0b01000000]), 6)
   *   const b = Chain.join([a, a, a, a], a)
   *   // b contains 14x 0b10001 joined together with a padding of 2
   * @param elements - Elements to be joined together
   * @param separator - Join separator
   * @returns Joined together Chain object
   */
  static join (
    elements: ChainValueType[],
    separator?: ChainValueType
  ): Chain {
    const separatorChain = Chain.from(separator)

    // Compose an array of chains to be merged and track text encoding
    const chains: Chain[] = new Array(elements.length * 2 - 1)
    let isTextEncoded = separatorChain.isTextEncoded()
    let chain

    for (let i = 0; i < elements.length; i++) {
      if (i > 0) {
        chains[i * 2 - 1] = separatorChain
      }
      chain = Chain.from(elements[i])
      chains[i * 2] = chain
      isTextEncoded = isTextEncoded && chain.isTextEncoded()
    }

    // If all elements and the separator are already text encoded we can safely
    // and efficiently join the string representations together
    if (isTextEncoded) {
      return Chain.from(chains.join(''))
    }

    // At least one of the chains not being text encoded we can't assume that
    // all of them are UTF-8 encoded. We need to merge the binary data of all
    // the chains together. First, count the total byte size and padding
    let byteSize = 0
    let padding = 0
    for (let i = 0; i < chains.length; i++) {
      byteSize += chains[i].getSize()
      padding += chains[i].getPadding()
    }

    // Subtract padding of entire bytes from the total size
    byteSize -= Math.floor(padding / 8)

    // Create new buffer
    const buffer = new ArrayBuffer(byteSize)
    const byteView = new Int8Array(buffer)

    // Iterate through chains and inject each of them into the buffer
    let chainBytes
    let j = 0
    padding = 0

    for (let k = 0; k < chains.length; k++) {
      // Iterate through bytes
      chainBytes = chains[k].getBytes()
      for (let i = 0; i < chainBytes.length; i++) {
        // Depending on current padding the bits need to be shifted into the
        // previous and current bytes
        if (padding > 0) {
          byteView[j - 1] |= chainBytes[i] >>> (8 - padding)
        }
        byteView[j++] = chainBytes[i] << padding
      }

      // Calculate the padding of following additions
      padding += chains[k].getPadding()
      if (padding > 7) {
        padding -= 8
        j--
      }
    }

    // Create Chain instance from buffer
    return Chain.from(buffer, padding)
  }
}
