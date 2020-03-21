
import Base64Encoder, { base64UrlOptions } from './Encoder/Base64Encoder'
import Pipe from './Pipe'
import UnicodeEncoder from './Encoder/UnicodeEncoder'
import UTF8Encoder from './Encoder/UTF8Encoder'

/**
 * Handles the communication to the Christopher API.
 */
export default class Christopher {
  /**
   * Static shared instance
   */
  private static sharedInstance: Christopher

  /**
   * Root service endpoint
   */
  private rootEndpoint: string

  /**
   * Constructor
   * @param rootEndpoint - Service root endpoint
   */
  constructor (rootEndpoint: string) {
    this.rootEndpoint = `${rootEndpoint}/v1`
    Christopher.sharedInstance = this
  }

  /**
   * Creates a session and returns it.
   * @return Session object
   */
  async createSession () {
    const response = await window.fetch(`${this.rootEndpoint}/session`)
    if (!response.ok) {
      throw new Error('Unable to create a session')
    }
    return response.json()
  }

  /**
   * Stores the given pipe.
   * @param pipe - Pipe instance to be stored
   * @return
   */
  async storePipe (pipe: Pipe) {
    const session = await this.createSession()

    const response = await window.fetch(`${this.rootEndpoint}/pipes`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${session.token}`
      },
      body: JSON.stringify(pipe.serialize())
    })

    if (!response.ok) {
      throw new Error('Unable to store this pipe')
    }

    const data = await response.json()
    if (data.error !== undefined) {
      throw new Error('Unable to store this pipe: ' + data.error.message)
    }

    return data
  }

  /**
   * Shares the given pipe in a new window.
   * @param pipe - Pipe instance to be shared
   * @param target - Share target
   */
  sharePipe (pipe: Pipe, target: 'pipe'|'facebook'|'twitter'): void {
    // TODO: Retrieve a token beforehand
    const token = 'XXX'

    // Compose share URL
    const pipeJson = JSON.stringify(pipe.serialize())
    const codePoints = UnicodeEncoder.codePointsFromString(pipeJson)
    const data = Base64Encoder.encode(
      UTF8Encoder.bytesFromCodePoints(codePoints),
      base64UrlOptions)
    const url = this.rootEndpoint +
      `/pipes/create/${data}?token=${token}&target=${target}`

    // Share in new window
    window.open(url, '_blank')
  }

  /**
   * Lazily creates a shared app instance and returns it.
   * @returns Shared Christopher instance
   */
  static getSharedInstance (): Christopher {
    return this.sharedInstance
  }
}
