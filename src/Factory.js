/**
 * Abstract factory implementation resolving registered identifiers to
 * invokables to create instances.
 */
export default class Factory {
  /**
   * Factory constructor
   */
  constructor () {
    this._identifiers = []
    this._invokables = []
  }

  /**
   * Returns available identifiers.
   * @return {string[]}
   */
  getIdentifiers () {
    return this._identifiers
  }

  /**
   * Returns invokable by identifier.
   * @param {string} identifier
   * @return {class}
   */
  getInvokable (identifier) {
    const index = this._identifiers.indexOf(identifier)
    if (index === -1) {
      throw new Error(
        `Invokable for '${identifier}' has not been registered yet.`)
    }
    return this._invokables[index]
  }

  /**
   * Registers invokable to specified identifier.
   * @param {string} identifier
   * @param {class} invokable
   * @throws Throws an error if identifier already exists.
   * @return {Factory} Fluent interface
   */
  register (identifier, invokable) {
    if (this.exists(identifier)) {
      throw new Error(
        'Invokable can\'t be registered. ' +
        `Identifier ${identifier} already exists.`)
    }
    // register invokable
    this._identifiers.push(identifier)
    this._invokables.push(invokable)
    return this
  }

  /**
   * Returns true, if given identifier exists.
   * @param {string} identifier
   * @return {boolean} True, if identifier exists.
   */
  exists (identifier) {
    return this._identifiers.indexOf(identifier) !== -1
  }

  /**
   * Creates a new instance by given identifier.
   * @param {string} identifier
   * @param {...mixed} args Arguments passed to the invokable constructor
   * @return {object} Instantiated object
   */
  create (identifier, ...args) {
    if (!this.exists(identifier)) {
      throw new Error(
        `Can't create '${identifier}', invokable has not been registered.`)
    }

    const index = this._identifiers.indexOf(identifier)
    const invokable = this._invokables[index]

    // the following lines do basically this: new invokable(...args)
    args.splice(0, 0, invokable)
    return new (Function.prototype.bind.apply(invokable, args))()
  }

  /**
   * Returns factory singleton instance.
   * @abstract
   * @return {Factory}
   */
  static getInstance () {
    // abstract method
  }
}
