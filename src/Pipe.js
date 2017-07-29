
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
    this._viewPrototype = PipeView

    // brick arrangement
    this._bricks = []

    // meta objects for each brick
    this._brickMeta = []

    // content buckets
    this._bucketContent = [new Chain()]

    // pipe meta
    this._title = null
    this._description = null
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
    this._bricks.splice.apply(this._bricks,
      [index, 0].concat(bricks))

    // insert brick meta objects
    this._brickMeta.splice.apply(this._brickMeta,
      [index, 0].concat(bricks.map(() => ({
        settingsVersion: 1,
        busy: false
      }))))

    // set brick delegate and add brick subview
    let insertedEncoder = false
    bricks.forEach(brick => {
      brick.setPipe(this)
      this.hasView() && this.getView().addSubview(brick.getView())
      insertedEncoder = insertedEncoder || brick instanceof Encoder
    })

    if (insertedEncoder) {
      // only encoder bricks influence buckets
      this.createBuckets()
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
        this._brickMeta.splice(index, 1)
        this.hasView() && this.getView().removeSubview(brick.getView())
        removedEncoder = removedEncoder || brick instanceof Encoder
      })

    if (removedEncoder) {
      // only encoder bricks influence buckets
      this.createBuckets()
    }

    return this
  }

  /**
   * Returns meta entry for given Brick and key.
   * @protected
   * @param {Brick} brick
   * @param {string} key
   * @param {mixed} [defaultValue=undefined] Default value returned when no meta
   * entry was found for given Brick and key.
   * @throws {Error} Throws an error if Brick is not part of the Pipe.
   * @return {mixed} Meta entry value
   */
  getBrickMeta (brick, key, defaultValue = undefined) {
    let index = this._bricks.indexOf(brick)
    if (index === -1) {
      throw new Error(`Brick is not part of the Pipe. Can't retrieve its meta.`)
    }
    let value = this._brickMeta[index][key]
    return value !== undefined ? value : defaultValue
  }

  /**
   * Sets meta value on given brick.
   * @protected
   * @param {Brick} brick
   * @param {string} key
   * @param {mixed} value
   * @return {Pipe} Fluent interface
   */
  setBrickMeta (brick, key, value) {
    let index = this._bricks.indexOf(brick)
    if (index !== -1) {
      this._brickMeta[index][key] = value
    }
    return this
  }

  /**
   * Delegate method triggered by child Viewers if their content changed.
   * @protected
   * @param {Viewer} viewer Sender
   * @param {Chain} content
   */
  viewerContentDidChange (viewer, content) {
    let brickIndex = this._bricks.indexOf(viewer)
    if (brickIndex === -1) {
      // viewer is not part of pipe
      // ignore this event
      return
    }

    let bucket = this.getBucketIndexForBrick(viewer)
    this.setContent(bucket, content, viewer)
  }

  /**
   * Delegate method triggered by child Bricks if their settings changed.
   * @protected
   * @param {Encoder} brick Sender
   */
  brickSettingDidChange (brick) {
    let brickIndex = this._bricks.indexOf(brick)
    if (brickIndex === -1) {
      // encoder is not part of pipe
      // ignore this event
      return
    }

    let brickMeta = this._brickMeta[brickIndex]

    // increment brick settings version
    brickMeta.settingsVersion++

    if (brick instanceof Encoder) {
      // trigger encode or decode depending on last translation direction
      let isEncode = brickMeta.direction !== false
      this.triggerEncoderTranslation(brick, isEncode)
    } else {
      this.triggerViewerView(brick)
    }
  }

  /**
   * Creates empty buckets for current bricks.
   * @protected
   * @return {Pipe} Fluent interface
   */
  createBuckets () {
    // TODO integrate previous buckets
    // count how many buckets are needed
    let encoderCount = this._bricks.reduce((count, brick) =>
      count + (brick instanceof Encoder ? 1 : 0), 0)

    // create empty buckets
    this._bucketContent =
      new Array(encoderCount + 1).fill().map(() => new Chain())

    return this
  }

  /**
   * Returns bucket index for given brick.
   * @param {Brick} brick
   * @throws {Error} Throws an error if brick is not part of Pipe.
   * @return {number}
   */
  getBucketIndexForBrick (brick) {
    // the bucket index is equal to the amount of
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
      throw new Error(`Can't find bucket for brick. Brick is not part of Pipe.`)
    }

    return encoderCount
  }

  /**
   * Returns content of given bucket.
   * @param {number} [bucket=0] Bucket index
   * @throws {Error} Throws an error if bucket index does not exist.
   * @return {Chain} content
   */
  getContent (bucket = 0) {
    if (bucket >= this._bucketContent.length) {
      throw new Error(`Bucket index ${bucket} does not exist.`)
    }
    return this._bucketContent[bucket]
  }

  /**
   * Sets content of given bucket and propagates it through brick chain.
   * @param {number} [bucket=0] Bucket index
   * @param {number[]|string|Uint8Array|Chain} content
   * @param {Brick} [sender] Sender brick
   * @return Fluent interface
   */
  setContent (bucket, content, sender = null) {
    // handle optional first argument
    if (isNaN(bucket)) {
      return this.setContent(0, bucket, content)
    }

    // wrap content inside Chain
    content = Chain.wrap(content)

    // verify changes
    if (this.getContent(bucket).isEqualTo(content)) {
      // nothing to do
      return this
    }

    // set bucket content
    this._bucketContent[bucket] = content

    // collect bricks that are attached to this bucket
    let lowerEncoder = null
    let upperEncoder = null
    let viewers = []

    let encoderCount = 0
    let i = -1
    while (++i < this._bricks.length && encoderCount <= bucket) {
      let brick = this._bricks[i]
      if (brick instanceof Encoder) {
        if (encoderCount === bucket - 1) {
          lowerEncoder = brick
        } else if (encoderCount === bucket) {
          upperEncoder = brick
        }
        encoderCount++
      } else {
        if (encoderCount === bucket) {
          viewers.push(brick)
        }
      }
    }

    // trigger viewer views
    viewers
      .filter(viewer => viewer !== sender)
      .forEach(this.triggerViewerView.bind(this))

    // trigger decode at lower end
    if (lowerEncoder !== null && lowerEncoder !== sender) {
      this.triggerEncoderTranslation(lowerEncoder, false)
    }

    // trigger encode at upper end
    if (upperEncoder !== null && upperEncoder !== sender) {
      this.triggerEncoderTranslation(upperEncoder, true)
    }

    return this
  }

  /**
   * Triggers viewer view. Keeps track of busy viewers and skips
   * view accordingly.
   * @protected
   * @param {Viewer} viewer
   * @return {Pipe} Fluent interface
   */
  triggerViewerView (viewer) {
    // check if brick is currently busy
    if (this.getBrickMeta(viewer, 'busy')) {
      // skip view
      return this
    }

    // mark viewer as busy
    this.setBrickMeta(viewer, 'busy', true)

    // collect view data
    let bucket = this.getBucketIndexForBrick(viewer)
    let content = this.getContent(bucket)
    let settingsVersion = this.getBrickMeta(viewer, 'settingsVersion')

    // trigger view asynchronously
    setTimeout(() => {
      viewer.view(content, () =>
        this.viewerViewDidFinish(viewer, content, settingsVersion))
    }, 0)

    return this
  }

  /**
   * Triggered when viewer did finish viewing content. Triggers new view when
   * the content has changed during previous view.
   * @protected
   * @param {Viewer} viewer
   * @param {Chain} usedContent
   * @param {number} usedSettingsVersion
   */
  viewerViewDidFinish (viewer, usedContent, usedSettingsVersion) {
    // check if viewer is still part of the pipe
    if (!this.containsBrick(viewer)) {
      // do nothing
      return
    }

    // mark brick as no longer busy
    this.setBrickMeta(viewer, 'busy', false)

    let settingsVersion = this.getBrickMeta(viewer, 'settingsVersion')
    let bucket = this.getBucketIndexForBrick(viewer)

    // there were views skipped when the current content or brick
    //  settings changed during last view
    if (!this.getContent(bucket).isEqualTo(usedContent) ||
        settingsVersion !== usedSettingsVersion) {
      // repeat view
      this.triggerViewerView(viewer)
    }
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
    // check if encoder is currently busy
    if (this.getBrickMeta(encoder, 'busy')) {
      // skip translation
      return this
    }

    // update encoder direction
    this.setBrickMeta(encoder, 'direction', isEncode)

    // mark encoder as busy
    this.setBrickMeta(encoder, 'busy', true)

    // collect translation data
    let sourceBucket = this.getBucketIndexForBrick(encoder) + isEncode ? 0 : 1
    let source = this.getContent(sourceBucket)
    let settingsVersion = this.getBrickMeta(encoder, 'settingsVersion')

    // trigger translation asynchronously
    new Promise(resolve =>
      setTimeout(() => {
        let result = isEncode
          ? encoder.encode(source)
          : encoder.decode(source)
        resolve(result)
      }, 0))

      .then(result =>
        this.encoderTranslationDidFinish(
          encoder, isEncode, result, source, settingsVersion))

      .catch(() =>
        this.encoderTranslationDidFinish(
          encoder, isEncode, false, source, settingsVersion))

    return this
  }

  /**
   * Triggered when a result comes back from the encoder. Propagates result and
   * triggers new translation when the source content has changed during
   * previous translation.
   * @protected
   * @param {Encoder} encoder
   * @param {boolean} isEncode True for encoding, false for decoding.
   * @param {Chain|boolean} result Result chain or false, if failed
   * @param {Chain} usedSource
   * @param {number} usedSettingsVersion
   */
  encoderTranslationDidFinish (
    encoder, isEncode, result, usedSource, usedSettingsVersion) {
    // check if encoder is still part of the pipe
    if (!this.containsBrick(encoder)) {
      // result is no longer relevant
      // do nothing
      return
    }

    // mark brick as no longer busy
    this.setBrickMeta(encoder, 'busy', false)

    if (result === false) {
      // TODO handle translation error
      return
    }

    let settingsVersion = this.getBrickMeta(encoder, 'settingsVersion')
    let lowerBucket = this.getBucketIndexForBrick(encoder)
    let sourceBucket = isEncode ? lowerBucket : lowerBucket + 1
    let resultBucket = isEncode ? lowerBucket + 1 : lowerBucket

    // propagate result
    this.setContent(resultBucket, result, encoder)

    // there were translations skipped when the current source content or brick
    //  settings changed during last translation
    if (!this.getContent(sourceBucket).isEqualTo(usedSource) ||
        settingsVersion !== usedSettingsVersion) {
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
