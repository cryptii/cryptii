
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
    this._busyEncoders = []

    this._stores = [new Chain()]

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
   * Returns wether given brick is part of this pipe.
   * @param {Brick} brick
   * @return {boolean} True, if brick is part of pipe.
   */
  containsBrick (brick) {
    return this._bricks.indexOf(brick) !== -1
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
      count + (brick instanceof Encoder ? 1 : 0), 0)

    // create empty stores
    this._stores = new Array(encoderCount + 1).fill().map(() => new Chain())
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
    // handle optional first argument
    if (isNaN(index)) {
      return this.setContent(0, index, content)
    }

    // wrap content inside Chain
    content = Chain.wrap(content)

    // verify changes
    if (this._stores[index].isEqualTo(content)) {
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

    // propagate content to each viewer
    viewers
      .filter(viewer => viewer !== sender)
      .forEach(viewer => viewer.view(content))

    if (lowerEncoder !== null && lowerEncoder !== sender) {
      // trigger decode at lower end
      this.triggerEncoderTranslation(lowerEncoder, false)
    }

    if (upperEncoder !== null && upperEncoder !== sender) {
      // trigger encode at upper end
      this.triggerEncoderTranslation(upperEncoder, true)
    }

    return this
  }

  /**
   * Triggers encoder translation. Keeps track of busy encoders and skips
   * translations accordingly.
   * @protected
   * @param {Encoder} encoder
   * @param {boolean} isEncode True for encoding, false for decoding.
   * @return {Pipe} Fluent interface
   */
  triggerEncoderTranslation (encoder, isEncode) {
    let encoderIndex = this.getStoreIndexForBrick(encoder)
    let sourceStore = isEncode ? encoderIndex : encoderIndex + 1

    // check if encoder is currently busy
    if (this._busyEncoders.indexOf(encoder) !== -1) {
      // skip this translation
      return this
    }

    // translate source to result asynchronously
    let source = this._stores[sourceStore]
    let resultPromise =
      new Promise(resolve =>
        setTimeout(() => {
          let result = isEncode
            ? encoder.encode(source)
            : encoder.decode(source)
          resolve(result)
        }, 0))

    // mark this encoder as busy
    this._busyEncoders.push(encoder)

    // add promise resolve handler
    resultPromise
      .then(result => {
        // mark encoder as no longer busy
        this._busyEncoders.splice(this._busyEncoders.indexOf(encoder), 1)

        // there are no store indexes handed over because they may have changed
        //  due to new brick arrangement during translation
        this.encoderTranslationDidFinish(encoder, isEncode, result, source)
        return result
      })
      .catch(() => {
        // TODO Handle Encoder Promise rejects somehow
        // mark encoder as no longer busy
        this._busyEncoders.splice(this._busyEncoders.indexOf(encoder), 1)
      })

    return this
  }

  /**
   * Triggered when a result comes back from the encoder. Checks wether the
   * encoder brick is still contained in this pipe. Triggers new translation
   * when the source content has changed during previous translation.
   * @protected
   * @param {Encoder} encoder
   * @param {boolean} isEncode True for encoding, false for decoding.
   * @param {Chain} result
   * @param {Chain} source
   */
  encoderTranslationDidFinish (encoder, isEncode, result, source) {
    // check if encoder is still part of the pipe
    if (!this.containsBrick(encoder)) {
      // result is no longer relevant
      // do nothing
      return
    }

    let encoderIndex = this.getStoreIndexForBrick(encoder)
    let sourceStore = isEncode ? encoderIndex : encoderIndex + 1
    let resultStore = isEncode ? encoderIndex + 1 : encoderIndex

    // propagate result
    this.setContent(resultStore, result, encoder)

    // there were translations skipped when the current source content is
    //  different from the source content of last translation
    // comparing the pointer instead of calling isEqualTo should lead faster
    //  to the same result in this case
    if (this._stores[sourceStore] !== source) {
      // repeat translation
      this.triggerEncoderTranslation(encoder, isEncode)
    }
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
