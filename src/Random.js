
/**
 * Pseudo-random number generator (PRNG).
 */
export default class Random {
  /**
   * Random generator constructor.
   * @param {string} [seed] Seed to be used during randomization.
   */
  constructor (seed = null) {
    this._seed = seed
  }

  /**
   * Returns next pseudo-random number between 0 (inclusive) and 1 (exclusive).
   * @return {number} Pseudo-random number
   */
  next () {
    // TODO implement actual PRNG
    return Math.random()
  }

  /**
   * Returns next random float between min (inclusive) and max (exclusive).
   * @param {number} min Minimum float (inclusive)
   * @param {number} max Maximum float (exclusive)
   * @return {number} Pseudo-random float
   */
  nextFloat (min, max) {
    return this.next() * (max - min) + min
  }

  /**
   * Returns next random integer between min (inclusive) and max (inclusive).
   * @param {number} min Minimum integer (inclusive)
   * @param {number} max Maximum integer (exclusive)
   * @return {number} Pseudo-random integer
   */
  nextInteger (min, max) {
    return parseInt(this.next() * (max - min)) + min
  }

  /**
   * Returns next random bytes of given size.
   * @param {number} size Amount of bytes to produce
   * @return {Uint8Array} Pseudo-random bytes
   */
  nextBytes (size) {
    const bytes = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
      bytes[i] = this.nextInteger(0, 256)
    }
    return bytes
  }

  /**
   * Returns next random boolean.
   * @return {boolean} Pseudo-random boolean
   */
  nextBoolean () {
    return this.next() >= 0.5
  }

  /**
   * Chooses random item from given array.
   * @param {mixed[]} array Array of items to choose from
   * @return {mixed} Pseudo-random chosen item
   */
  nextChoice (array) {
    const index = this.nextInteger(0, array.length - 1)
    return array[index]
  }
}
