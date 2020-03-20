
/**
 * Class providing access to a pseudo-random number generator (PRNG) in addition
 * to utility functions like array shuffling.
 * @todo Implement a PRNG algorithm using a seed.
 */
export default class Random {
  /**
   * Static shared instance
   */
  private static sharedInstance?: Random

  /**
   * PRNG seed (Reserved for future use)
   */
  readonly seed?: string

  /**
   * Constructor
   * @param seed - PRNG seed (Reserved for future use)
   */
  constructor (seed?: string) {
    this.seed = seed
  }

  /**
   * Returns next number between 0 (inclusive) and 1 (exclusive).
   * @returns Next random float
   */
  next (): number {
    if (typeof window !== 'undefined' && window.crypto !== undefined) {
      // Create a random U32 integer and divide it by 2^32
      const integers = new Uint32Array(1)
      window.crypto.getRandomValues(integers)
      return integers[0] / 0x100000000
    }
    return Math.random()
  }

  /**
   * Returns the next float in the given range [min-max[.
   * @param min - Minimum float (inclusive)
   * @param max - Maximum float (exclusive)
   * @returns Next random float value
   */
  nextFloat (min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  /**
   * Returns the next integer in the given range [min-max].
   * @param min - Minimum integer (inclusive)
   * @param max - Maximum integer (inclusive)
   * @returns Next random integer value
   */
  nextInteger (min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  /**
   * Returns the next array of bytes.
   * @param size - Number of bytes to be produced
   * @returns Next random array of bytes
   */
  nextBytes (size: number): Uint8Array {
    const bytes = new Uint8Array(size)
    if (typeof window !== 'undefined' && window.crypto !== undefined) {
      window.crypto.getRandomValues(bytes)
    } else {
      for (let i = 0; i < size; i++) {
        bytes[i] = this.nextInteger(0x00, 0xFF)
      }
    }
    return bytes
  }

  /**
   * Returns the next boolean value.
   * @returns The next boolean value
   */
  nextBoolean (): boolean {
    return this.next() >= 0.5
  }

  /**
   * Chooses an element from the given array.
   * @param array - Array of elements to choose from
   * @returns Randomly chosen element
   */
  nextElement (array: any[]): any {
    return array[this.nextInteger(0, array.length - 1)]
  }

  /**
   * Shuffle array elements using Fisher–Yates modern shuffle algorithm.
   * @param array - Array to be shuffled
   * @returns Shuffled array
   */
  nextShuffle (array: any[]): any[] {
    const a = array.slice()
    let i, j
    for (i = a.length - 1; i > 0; i--) {
      j = this.nextInteger(0, i)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  /**
   * Lazily creates a shared Random instance without a seed and returns it.
   * @returns Shared Random instance
   */
  static getSharedInstance (): Random {
    if (this.sharedInstance === undefined) {
      this.sharedInstance = new Random()
    }
    return this.sharedInstance
  }
}
