
import Brick from './Brick'
import BrickFactory from './Factory/Brick'
import Chain from './Chain'
import Encoder from './Encoder'
import PipeView from './View/Pipe'
import Viewable from './Viewable'

/**
 * Arrangement of Viewers and Encoders.
 */
export default class Pipe extends Viewable {
  /**
   * Creates empty Pipe.
   */
  constructor () {
    super()

    this._bricks = []
    this._stores = []

    this._title = null
    this._description = null

    this._viewPrototype = PipeView
  }

  /**
   * Returns Pipe bricks.
   * @return {Brick[]}
   */
  getBricks () {
    return this._bricks
  }

  /**
   * Adds Bricks to the end of the Pipe.
   * @param {...Brick|string} bricksOrNames Bricks to be added.
   * @return {Pipe} Fluent interface
   */
  addBrick (...bricksOrNames) {
    return this.insertBrick.apply(this, [-1].concat(bricksOrNames))
  }

  /**
   * Inserts Bricks at index.
   * @param {number} index Index to insert Bricks at.
   * @param {...Brick|string} bricksOrNames Bricks to be inserted.
   * @return {Pipe} Fluent interface
   */
  insertBrick (index, ...bricksOrNames) {
    // map brick names to actual brick instances
    let bricks = bricksOrNames.map(brickOrName =>
      typeof brickOrName === 'string'
        ? BrickFactory.getInstance().create(brickOrName)
        : brickOrName)

    // insert brick instances
    this._bricks.splice.apply(this._bricks, [index, 0].concat(bricks))

    // set brick delegate and add brick subview
    let insertedEncoder = false
    bricks.forEach(brick => {
      brick.setPipe(this)
      this.hasView() && this.getView().addSubview(brick.getView())
      insertedEncoder = insertedEncoder || brick instanceof Encoder
    })

    if (insertedEncoder) {
      // only encoder bricks influence stores
      this.createStores()
    }

    return this
  }

  /**
   * Removes Bricks.
   * @param {...Brick|number} elements Brick objects or indexes to be removed.
   * @return {Pipe} Fluent interface
   */
  removeBrick (...elements) {
    let removedEncoder = false
    elements
      // map bricks to indexes
      .map(brickOrIndex => {
        if (brickOrIndex instanceof Brick) {
          return this._bricks.indexOf(brickOrIndex)
        } else {
          return brickOrIndex
        }
      })
      // filter 'not found' indexes
      .filter(index => index !== -1)
      // sort index descending
      .sort((a, b) => b - a)
      // remove each
      .forEach(index => {
        const brick = this._bricks[index]
        brick.setPipe(null)
        this._bricks.splice(index, 1)
        this.hasView() && this.getView().removeSubview(brick.getView())
        removedEncoder = removedEncoder || brick instanceof Encoder
      })

    if (removedEncoder) {
      // only encoder bricks influence stores
      this.createStores()
    }

    return this
  }

  /**
   * Delegate method triggered by child Viewers if their content changed.
   * @protected
   * @param {Viewer} viewer Sender
   * @param {Chain} content
   * @return {Pipe} Fluent interface
   */
  viewerContentDidChange (viewer, content) {
    let storeIndex = this.getStoreIndexForBrick(viewer)
    this.setContent(storeIndex, content, viewer)
    return this
  }

  /**
   * Delegate method triggered by child Encoders if their settings changed.
   * @protected
   * @param {Encoder} encoder Sender
   * @return {Pipe} Fluent interface
   */
  encoderSettingDidChange (encoder) {
    // TODO repeat last encoding or decoding and propagate content
  }

  /**
   * Creates empty stores for current bricks.
   * @return {Pipe} Fluent interface
   */
  createStores () {
    // TODO integrate previous stores
    // count how many stores are needed
    let encoderCount = this._bricks.reduce((count, brick) =>
      (count || 1) + (brick instanceof Encoder ? 1 : 0))

    // create empty stores
    this._stores = new Array(encoderCount).map(() => new Chain())
    return this
  }

  /**
   * Returns store index for given brick.
   * @param {Brick} brick
   * @throws {Error} Throws an error if brick is not part of Pipe.
   * @return {number}
   */
  getStoreIndexForBrick (brick) {
    // the store index is equal to the amount of
    // encoder bricks placed before given brick
    let foundBrick = false
    let encoderCount = 0
    let i = -1

    while (!foundBrick && ++i < this._bricks.length) {
      if (this._bricks[i] === brick) {
        foundBrick = true
      } else if (this._bricks[i] instanceof Encoder) {
        encoderCount++
      }
    }

    if (!foundBrick) {
      throw new Error(`Can't find store for brick. Brick is not part of Pipe.`)
    }

    return encoderCount
  }

  /**
   * Sets content of store.
   * @param {number} [index] Store index
   * @param {number[]|string|Uint8Array|Chain} content
   * @param {Brick} [sender] Sender brick
   * @return Fluent interface
   */
  setContent (index, content, sender = null) {
    if (isNaN(index)) {
      // handle optional first arg
      return this.setContent(0, index, content)
    }

    content = Chain.wrap(content)
    if (Chain.isEqual(this._stores[index], content)) {
      // nothing to do
      return this
    }

    // set content
    this._stores[index] = content

    // collect bricks that are attached to this store
    let lowerEncoder = null
    let upperEncoder = null
    let viewers = []

    let encoderCount = 0
    let i = -1
    while (++i < this._bricks.length && encoderCount <= index) {
      let brick = this._bricks[i]
      if (brick instanceof Encoder) {
        if (encoderCount === index - 1) {
          lowerEncoder = brick
        } else if (encoderCount === index) {
          upperEncoder = brick
        }
        encoderCount++
      } else {
        if (encoderCount === index) {
          viewers.push(brick)
        }
      }
    }

    if (lowerEncoder !== null && lowerEncoder !== sender) {
      // propagate content through lower encoder
      // TODO handle result promise
      this.setContent(
        index - 1,
        lowerEncoder.decode(content),
        lowerEncoder)
    }

    if (upperEncoder !== null && upperEncoder !== sender) {
      // propagate content through upper encoder
      // TODO handle result promise
      this.setContent(
        index + 1,
        upperEncoder.encode(content),
        upperEncoder)
    }

    // propagate content to each viewer
    viewers
      .filter(viewer => viewer !== sender)
      .forEach(viewer => viewer.view(content))

    return this
  }

  /**
   * Returns Pipe title.
   * @return {?string} Pipe title
   */
  getTitle () {
    return this._title
  }

  /**
   * Sets Pipe title.
   * @param {?string} title Pipe title
   * @return {Pipe} Fluent interface
   */
  setTitle (title) {
    this._title = title
    return this
  }

  /**
   * Returns Pipe description.
   * @return {?string} Pipe description
   */
  getDescription () {
    return this._description
  }

  /**
   * Sets Pipe description.
   * @param {?string} description Pipe description
   * @return {Pipe} Fluent interface
   */
  setDescription (description) {
    this._description = description
    return this
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    // add each brick as subview
    this._bricks.forEach(brick => view.addSubview(brick.getView()))
  }

  /**
   * Serializes Pipe to make it JSON serializable
   * @return {mixed} Structured data.
   */
  serialize () {
    return {
      title: this.getTitle(),
      description: this.getDescription(),
      bricks: this._bricks.map(brick => brick.serialize())
    }
  }

  /**
   * Extracts Pipe from structured data.
   * @param {mixed} data Structured data.
   * @throws {Error} Throws an error if structured data is malformed.
   * @return {Pipe} Extracted Pipe.
   */
  static extract (data) {
    // verify data
    if (!Array.isArray(data.bricks)) {
      throw new Error(`Can't extract bricks from structured data.`)
    }

    // extract bricks
    let bricks = data.bricks.map(brickData => Brick.extract(brickData))

    // compose pipe
    let pipe = new Pipe()
    pipe.add.apply(pipe, bricks)
    pipe.setTitle(data.title)
    pipe.setDescription(data.description)
    return pipe
  }
}
