
import Pipe from './Pipe'

/**
 * Handles the communication to the cryptii service API.
 */
export default class Service {
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
}
