const version = 'v1'

/**
 * Handles the communication to the cryptii service API.
 */
export default class Service {
  /**
   * Constructor
   * @param {string} rootEndpoint Service root endpoint
   */
  constructor (rootEndpoint) {
    this._rootEndpoint = `${rootEndpoint}/${version}`
  }

  /**
   * Creates a session and returns it.
   * @return {object} Session object
   */
  async createSession () {
    const response = await window.fetch(`${this._rootEndpoint}/session`)
    if (!response.ok) {
      throw new Error('Unable to create a session')
    }
    return response.json()
  }

  /**
   * Stores the given pipe.
   * @param {Pipe} pipe Pipe instance to be stored
   * @return {void}
   */
  async storePipe (pipe) {
    const session = await this.createSession()

    const response = await window.fetch(`${this._rootEndpoint}/pipes`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${session.token}`
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
