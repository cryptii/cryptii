
import Analytics from './Analytics'
import Brick from './Brick'
import BrickFactory from './Factory/Brick'
import ByteEncoder from './ByteEncoder'
import Chain from './Chain'
import Encoder from './Encoder'
import PipeView from './View/Pipe'
import InvalidInputError from './Error/InvalidInput'
import Viewable from './Viewable'
import Viewer from './Viewer'

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
    this._selectedBucket = 0

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
    this.spliceBricks.apply(this, [-1, 0].concat(bricksOrNames))
    return this
  }

  /**
   * Removes Bricks from the Pipe.
   * @param {...Brick|number} bricksOrIndexes Bricks to be removed.
   * @return {Pipe} Fluent interface
   */
  removeBrick (...bricksOrIndexes) {
    bricksOrIndexes
      // map brick instances to indexes
      .map(brickOrIndex =>
        brickOrIndex instanceof Brick
          ? this._bricks.indexOf(brickOrIndex)
          : brickOrIndex
      )
      // sort indexes descending
      .sort((a, b) => b - a)
      // remove each
      .forEach(index => this.spliceBricks(index, 1))

    return this
  }

  /**
   * Replaces brick.
   * @param {Brick} needle
   * @param {Brick|string} brickOrName
   * @return {Pipe} Fluent interface
   */
  replaceBrick (needle, brickOrName) {
    let index = this._bricks.indexOf(needle)
    if (index === -1) {
      throw new Error(`Brick is not part of the Pipe. Can't replace it.`)
    }

    let brick = brickOrName
    if (typeof brickOrName === 'string') {
      brick = BrickFactory.getInstance().create(brickOrName)
      // apply the same reverse state on the new brick
      if ((needle instanceof Encoder) && (brick instanceof Encoder)) {
        brick.setReverse(needle.isReverse())
      }
    }

    this.spliceBricks(index, 1, brick)
    return this
  }

  /**
   * Removes and inserts bricks at given index.
   * @param {number} index Index at which bricks should be removed or inserted.
   * @param {number} removeCount How many bricks should be removed at position.
   * @param {...Brick|string} bricksOrNames Bricks to be added.
   * @return {Brick[]} Array of bricks that have been removed.
   */
  spliceBricks (index, removeCount, ...bricksOrNames) {
    // normalize index
    if (index < 0) {
      index = Math.max(this._bricks.length + index, 0)
    }

    // map brick names to actual brick instances
    let bricks = bricksOrNames.map(brickOrName =>
      typeof brickOrName === 'string'
        ? BrickFactory.getInstance().create(brickOrName)
        : brickOrName)

    // splice internal brick array
    let removedBricks = this._bricks.splice.apply(this._bricks,
      [index, removeCount].concat(bricks))

    // splice internal meta array
    this._brickMeta.splice.apply(this._brickMeta,
      [index, removeCount].concat(bricks.map(() => ({
        settingsVersion: 1,
        busy: false
      }))))

    // prepare added bricks, reset removed bricks
    let bucketInsertCount = 0
    let bucketRemoveCount = 0

    bricks.forEach(brick => {
      brick.setPipe(this)
      this.hasView() && this.getView().addSubview(brick.getView())

      if (brick instanceof Encoder) {
        bucketInsertCount++
      }

      Analytics.trackEvent('brick_view', {
        'event_category': 'bricks',
        'event_action': 'view',
        'event_label': brick.getMeta().name,
        'non_interaction': true
      })
    })

    removedBricks.forEach(brick => {
      this.hasView() && this.getView().removeSubview(brick.getView())
      brick.setPipe(null)

      if (brick instanceof Encoder) {
        bucketRemoveCount++
      }
    })

    // update buckets if needed
    if (bucketInsertCount > 0 || bucketRemoveCount > 0) {
      // check where to insert or remove buckets
      let bucketChangeIndex = this._bricks.reduce((count, brick, i) =>
        count + (brick instanceof Encoder && i <= index ? 1 : 0), 0)

      if (bucketChangeIndex === 0) {
        bucketChangeIndex = 1
      }

      // create new empty buckets
      let insertBuckets = new Array(bucketInsertCount)
        .fill().map(() => Chain.empty())

      if (bucketRemoveCount > 0) {
        insertBuckets[insertBuckets.length - 1] =
          this._bucketContent[bucketChangeIndex + bucketRemoveCount - 1]
      }

      // splice buckets
      this._bucketContent.splice.apply(this._bucketContent,
        [bucketChangeIndex, bucketRemoveCount].concat(insertBuckets))

      // update selected bucket accordingly
      if (this._selectedBucket <= bucketChangeIndex - 1) {
        // selected bucket is situated before the changing part
        // leave it unchanged, propagate content forward before changing part
        this.propagateContent(bucketChangeIndex - 1, true)
      } else if (this._selectedBucket <= bucketChangeIndex - 1 + bucketRemoveCount) {
        // selected bucket is set to be removed
        // don't know wether to select bucket before or after
        // select the bucket before the changing part and propagate it forward
        this._selectedBucket = bucketChangeIndex - 1
        this.propagateContent(this._selectedBucket, true)
      } else {
        let delta = bucketInsertCount - bucketRemoveCount
        // selected bucket is situated after the changing part
        this._selectedBucket += delta
        // propagate content backward after changing part
        this.propagateContent(bucketChangeIndex + Math.max(delta, 0), false)
      }
    } else {
      // buckets stay as is, no encoder brick involved
      // trigger views on new viewers
      bricks.forEach(viewer => this.triggerViewerView(viewer))
    }

    Analytics.trackEvent('pipe_view', {
      'event_category': 'pipe',
      'event_action': 'view',
      'event_label': this._bricks.map(brick => brick.getMeta().name).join(', '),
      'non_interaction': true
    })

    // layout
    this.hasView() && this.getView().layout()
    return removedBricks
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
    if (!this.containsBrick(viewer)) {
      // ignore this event
      return
    }

    let bucket = this.getBucketIndexForBrick(viewer)
    this.setContent(content, bucket, viewer)
  }

  /**
   * Delegate method triggered by child Bricks when their settings changed.
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
      let translationMeta = brick.getLastTranslationMeta()
      let isEncode = translationMeta === null || translationMeta.isEncode
      this.triggerEncoderTranslation(brick, isEncode)
    } else {
      this.triggerViewerView(brick)
    }
  }

  /**
   * Delegate method triggered by child Bricks when they got reversed.
   * @protected
   * @param {Encoder} brick Sender
   * @param {boolean} reverse Wether to reverse translation.
   */
  encoderDidReverse (brick, reverse) {
    let sourceBucket = this.getBucketIndexForBrick(brick)
    let resultBucket = sourceBucket + 1

    // swap source and result content
    let sourceContent = this.getContent(sourceBucket)
    let resultContent = this.getContent(resultBucket)
    this.setContent(sourceContent, resultBucket, brick)
    this.setContent(resultContent, sourceBucket, brick)
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
   * @param {number[]|string|Uint8Array|Chain} content
   * @param {number} [bucket=0] Bucket index
   * @param {Brick} [sender=null] Sender brick or null
   * @return Fluent interface
   */
  setContent (content, bucket = 0, sender = null) {
    // wrap content inside Chain
    content = Chain.wrap(content)

    // check for changes
    if (this.getContent(bucket).isEqualTo(content)) {
      // nothing to do
      return this
    }

    // set bucket content
    this._bucketContent[bucket] = content

    if (sender === null || sender instanceof Viewer) {
      // track last changed bucket to propagate from here when changing pipe
      this._selectedBucket = bucket
    }

    // propagate changes through pipe
    this.propagateContent(bucket, sender)
    return this
  }

  /**
   * Propagate content through pipe from given bucket.
   * @param {number} bucket
   * @param {Brick|boolean} [senderOrIsForward] Sender brick to which content
   * should not be propagated to or wether to propagate forward (true) or
   * backward (false). Propagates to every direction by default.
   * @return {Pipe} Fluent interface
   */
  propagateContent (bucket, senderOrIsForward = null) {
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
      .filter(viewer => viewer !== senderOrIsForward)
      .forEach(this.triggerViewerView.bind(this))

    // trigger decode at lower end
    if (lowerEncoder !== null &&
        senderOrIsForward !== true &&
        lowerEncoder !== senderOrIsForward) {
      this.triggerEncoderTranslation(lowerEncoder, false)
    }

    // trigger encode at upper end
    if (upperEncoder !== null &&
        senderOrIsForward !== false &&
        upperEncoder !== senderOrIsForward) {
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
    // check if viewer is busy
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
      try {
        viewer.view(content, () =>
          this.viewerViewDidFinish(viewer, null, content, settingsVersion))
      } catch (error) {
        this.viewerViewDidFinish(viewer, error, content, settingsVersion)
      }
    }, 0)

    return this
  }

  /**
   * Triggered when viewer did finish viewing content. Triggers new view when
   * the content has changed during previous view.
   * @protected
   * @param {Viewer} viewer
   * @param {?Error} error
   * @param {Chain} usedContent
   * @param {number} usedSettingsVersion
   */
  viewerViewDidFinish (viewer, error, usedContent, usedSettingsVersion) {
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

    // throw unexpected errors
    if (error && !(error instanceof InvalidInputError)) {
      throw error
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
    // check if encoder is not busy
    if (this.getBrickMeta(encoder, 'busy')) {
      // skip translation
      return this
    }

    // mark encoder as busy
    this.setBrickMeta(encoder, 'busy', true)

    // collect translation data
    let sourceBucket = this.getBucketIndexForBrick(encoder) + (isEncode ? 0 : 1)
    let source = this.getContent(sourceBucket)
    let settingsVersion = this.getBrickMeta(encoder, 'settingsVersion')

    // trigger translation, create a promise to catch all errors
    new Promise(resolve =>
      resolve(isEncode ? encoder.encode(source) : encoder.decode(source)))

      // handle result
      .then(result =>
        this.encoderTranslationDidFinish(
          encoder, null, isEncode, result, source, settingsVersion))

      // catch errors
      .catch(error =>
        this.encoderTranslationDidFinish(
          encoder, error, isEncode, false, source, settingsVersion))

    return this
  }

  /**
   * Triggered when a result comes back from the encoder. Propagates result and
   * triggers new translation when the source content has changed during
   * previous translation.
   * @protected
   * @param {Encoder} encoder
   * @param {?Error} error
   * @param {boolean} isEncode True for encoding, false for decoding.
   * @param {Chain|boolean} result Result chain or false, if failed
   * @param {Chain} usedSource
   * @param {number} usedSettingsVersion
   */
  encoderTranslationDidFinish (
    encoder, error, isEncode, result, usedSource, usedSettingsVersion) {
    // check if encoder is still part of the pipe
    if (!this.containsBrick(encoder)) {
      // result is no longer relevant
      // do nothing
      return
    }

    // mark brick as no longer busy
    this.setBrickMeta(encoder, 'busy', false)

    let settingsVersion = this.getBrickMeta(encoder, 'settingsVersion')
    let lowerBucket = this.getBucketIndexForBrick(encoder)
    let sourceBucket = isEncode ? lowerBucket : lowerBucket + 1
    let resultBucket = isEncode ? lowerBucket + 1 : lowerBucket

    if (!error) {
      // propagate result
      this.setContent(result, resultBucket, encoder)
    }

    // there were translations skipped when the current source content or brick
    //  settings changed during last translation
    if (!this.getContent(sourceBucket).isEqualTo(usedSource) ||
        settingsVersion !== usedSettingsVersion) {
      // repeat translation
      this.triggerEncoderTranslation(encoder, isEncode)
    }

    // throw unexpected errors
    if (error && !(error instanceof InvalidInputError)) {
      throw error
    }
  }

  /**
   * Returns Brick Factory instance.
   * @return {BrickFactory}
   */
  getBrickFactory () {
    return BrickFactory.getInstance()
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
   * Triggered when view add button has been clicked.
   * @protected
   * @param {View} view
   * @param {number} index
   */
  viewAddButtonDidClick (view, index) {
    let content = null
    if (index === this._bricks.length) {
      content = this.getContent(this._bucketContent.length - 1)
    } else {
      let bucket = this.getBucketIndexForBrick(this._bricks[index])
      content = this.getContent(bucket)
    }

    let name = 'text'
    if (content.needsTextEncoding()) {
      name = 'bytes'
    }

    let brick = this.getBrickFactory().create(name)
    this.spliceBricks(index, 0, brick)
    brick.getView().toggleSelection(true)
  }

  /**
   * Serializes Pipe to make it JSON serializable
   * @return {mixed} Structured data.
   */
  serialize () {
    // serialize content
    let bucket = this._selectedBucket
    let content = this._bucketContent[bucket]

    let contentObject = { bucket }
    if (!content.needsTextEncoding()) {
      contentObject.string =
        content.getString()
    } else {
      contentObject.bytes =
        ByteEncoder.base64StringFromBytes(content.getBytes())
    }

    // serialize pipe
    return {
      version: 1,
      title: this.getTitle(),
      description: this.getDescription(),
      bricks: this._bricks.map(brick => brick.serialize()),
      content: contentObject
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
    let brickFactory = BrickFactory.getInstance()
    let bricks =
      data.bricks.map(brickData =>
        Brick.extract(brickData, brickFactory))

    // compose pipe
    let pipe = new Pipe()
    pipe.addBrick.apply(pipe, bricks)
    pipe.setTitle(data.title)
    pipe.setDescription(data.description)

    // set content
    if (data.content) {
      let bucket = data.content.bucket || 0
      if (typeof data.content.string === 'string') {
        pipe.setContent(data.content.string, bucket)
      } else if (typeof data.content.bytes === 'string') {
        let bytes = ByteEncoder.bytesFromBase64String(data.content.bytes)
        pipe.setContent(bytes, bucket)
      }
    }

    return pipe
  }
}
