// shared instance
let instance = null

/**
 * Class generating random values.
 * @todo Implement pseudo-random number generator (PRNG).
 */
export default class Random {
  /**
   * Constructor
   * @param {?string} [seed] PRNG seed (Reserved for future implementation)
   */
  constructor (seed = null) {
    this._seed = seed

    // Retrieve Web Crypto API's crypto object, if available
    this._crypto =
      typeof window !== 'undefined'
        ? window.crypto || window.msCrypto || null
        : null
  }

  /**
   * Returns next number between 0 (inclusive) and 1 (exclusive).
   * @return {number}
   */
  next () {
    if (this._crypto) {
      // Create one random u32 integer and divide it by 2^32
      const integers = new Uint32Array(1)
      this._crypto.getRandomValues(integers)
      return integers / 0x100000000
    }
    return Math.random()
  }

  /**
   * Returns next float in given range [min-max[.
   * @param {number} min Minimum float (inclusive)
   * @param {number} max Maximum float (exclusive)
   * @return {number}
   */
  nextFloat (min, max) {
    return this.next() * (max - min) + min
  }

  /**
   * Returns next integer in given range [min-max].
   * @param {number} min Minimum integer (inclusive)
   * @param {number} max Maximum integer (inclusive)
   * @return {number}
   */
  nextInteger (min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  /**
   * Returns next given number of bytes.
   * @param {number} size Amount of bytes to produce
   * @return {Uint8Array}
   */
  nextBytes (size) {
    const bytes = new Uint8Array(size)
    if (this._crypto) {
      this._crypto.getRandomValues(bytes)
    } else {
      for (let i = 0; i < size; i++) {
        bytes[i] = this.nextInteger(0, 0xFF)
      }
    }
    return bytes
  }

  /**
   * Returns next boolean value.
   * @return {boolean}
   */
  nextBoolean () {
    return this.next() >= 0.5
  }

  /**
   * Chooses element from given array.
   * @param {mixed[]} array Elements to choose from
   * @return {mixed}
   */
  nextChoice (array) {
    return array[this.nextInteger(0, array.length - 1)]
  }

  /**
   * Returns shared instance.
   * @return {Random}
   */
  static getInstance () {
    if (instance === null) {
      instance = new Random()
    }
    return instance
  }
}
