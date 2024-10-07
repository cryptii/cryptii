import Brick from './Brick.js'
import ByteEncoder from './ByteEncoder.js'
import Chain from './Chain.js'
import Encoder from './Encoder.js'
import EventManager from './EventManager.js'
import InvalidInputError from './Error/InvalidInput.js'
import LibraryModalView from './View/Modal/Library.js'
import PipeView from './View/Pipe.js'
import Viewable from './Viewable.js'
import Viewer from './Viewer.js'

/**
 * Arrangement of viewers and encoders.
 */
export default class Pipe extends Viewable {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._viewPrototype = PipeView
    this._brickFactory = null
    this._service = null

    // Meta
    this._id = null
    this._url = null
    this._title = null
    this._description = null

    // Empty array of bricks and brick state objects
    this._bricks = []
    this._brickState = []

    // New pipes contain one empty bucket
    this._bucketContent = [Chain.empty()]
    this._bucketListeners = [[]]
    this._selectedBucket = 0

    // Lazily instantiated library modal view
    this._libraryModalView = null
  }

  /**
   * Returns the id.
   * @return {number}
   */
  getId () {
    return this._id
  }

  /**
   * Sets the id.
   * @param {number} id
   * @return {Pipe} Fluent interface
   */
  setId (id) {
    this._id = id
    return this
  }

  /**
   * Returns the URL.
   * @return {string}
   */
  getUrl () {
    return this._url
  }

  /**
   * Sets the url.
   * @param {string} url
   * @return {Pipe} Fluent interface
   */
  setUrl (url) {
    this._url = url
    return this
  }

  /**
   * Returns the title.
   * @return {string|null}
   */
  getTitle () {
    return this._title
  }

  /**
   * Sets the title.
   * @param {string|null} title Pipe title
   * @return {Pipe} Fluent interface
   */
  setTitle (title) {
    this._title = title
    return this
  }

  /**
   * Returns the description.
   * @return {string|null}
   */
  getDescription () {
    return this._description
  }

  /**
   * Sets the description.
   * @param {string|null} description Pipe description
   * @return {Pipe} Fluent interface
   */
  setDescription (description) {
    this._description = description
    return this
  }

  /**
   * Returns the brick factory used upon brick creation inside the pipe.
   * @return {Factory} Factory
   */
  getBrickFactory () {
    return this._brickFactory
  }

  /**
   * Sets the brick factory used upon brick creation inside the pipe.
   * @param {Factory} brickFactory Factory
   * @return {Pipe} Fluent interface
   */
  setBrickFactory (brickFactory) {
    this._brickFactory = brickFactory
    return this
  }

  /**
   * Returns the service instance.
   * @return {Service|null}
   */
  getService () {
    return this._service
  }

  /**
   * Sets the service instance.
   * @param {Service} service Service instance
   */
  setService (service) {
    this._service = service
    return this
  }

  /**
   * Returns a lazily instantiated library modal view instance.
   * @return {ModalView} Library modal view
   */
  getLibraryModalView () {
    if (this._libraryModalView === null) {
      const library = this.getBrickFactory().getLibrary()
      this._libraryModalView = new LibraryModalView(library)
    }
    return this._libraryModalView
  }

  /**
   * Returns the number of bricks.
   * @return {number}
   */
  getLength () {
    return this._bricks.length
  }

  /**
   * Returns a shallow copy of the current pipe bricks.
   * @return {Brick[]}
   */
  getBricks () {
    return this._bricks.slice()
  }

  /**
   * Returns a single brick at given index.
   * @param {number} index Pipe brick index
   * @throws {Error} If index is out of bounds.
   * @return {Brick} Pipe brick
   */
  getBrick (index) {
    if (index < 0 || index > this._bricks.length) {
      throw new Error('Brick index is out of bounds.')
    }
    return this._bricks[index]
  }

  /**
   * Returns wether given brick is part of the pipe.
   * @param {Brick} needle Brick to search for
   * @return {boolean} True, if brick is part of pipe
   */
  containsBrick (needle) {
    return this._bricks.indexOf(needle) !== -1
  }

  /**
   * Adds single brick to the end of the pipe.
   * @param {Brick|object} brick Brick instance or serialized brick object
   * to be added to the pipe
   * @return {Pipe} Fluent interface
   */
  addBrick (brick) {
    this.spliceBricks(-1, 0, [brick])
    return this
  }

  /**
   * Adds multiple bricks to the end of the pipe.
   * Convenience method calling {@link Pipe.spliceBricks} internally.
   * @param {Brick[]|object[]} bricks Brick instances or serialized brick
   * objects to be added to the pipe
   * @return {Pipe} Fluent interface
   */
  addBricks (bricks) {
    this.spliceBricks(-1, 0, bricks)
    return this
  }

  /**
   * Inserts a copy of given brick into the pipe.
   * @param {Brick} brick Pipe brick to be copied
   * @param {number} index Index at which the copy should be inserted, inserts
   * the copy after the original brick if omitted
   * @return {Pipe} Fluent interface
   */
  duplicateBrick (brick, index = null) {
    if (!this.containsBrick(brick)) {
      throw new Error('Brick is not part of the pipe.')
    }
    if (index === null) {
      index = this._bricks.indexOf(brick)
    }
    this.spliceBricks(index, 0, [brick.copy()])
    return this
  }

  /**
   * Moves brick to given index.
   * @param {Brick} brick Pipe brick to be moved
   * @param {number} index Index the brick should be moved to
   * @return {Pipe} Fluent interface
   */
  moveBrick (brick, index) {
    const fromIndex = this._bricks.indexOf(brick)
    if (fromIndex === -1) {
      throw new Error('Brick is not part of the pipe.')
    }
    if (index > fromIndex) {
      index--
    }
    this.spliceBricks(fromIndex, 1)
    this.spliceBricks(index, 0, [brick])
    return this
  }

  /**
   * Removes single brick from the pipe.
   * Convenience method calling {@link Pipe.spliceBricks} internally.
   * @param {Brick|number} brickOrIndex Brick or index to be removed
   * @throws {Error} If brick is not part of the pipe.
   * @return {Pipe} Fluent interface
   */
  removeBrick (brickOrIndex) {
    let index = brickOrIndex
    if (brickOrIndex instanceof Brick) {
      index = this._bricks.indexOf(brickOrIndex)
      if (index === -1) {
        throw new Error(
          'Brick is not part of the pipe and thus can\'t be removed.')
      }
    }
    this.spliceBricks(index, 1)
    return this
  }

  /**
   * Removes bricks from the pipe.
   * Convenience method calling {@link Pipe.spliceBricks} internally.
   * @param {Brick[]|number[]} bricksOrIndexes Array of bricks or indexes
   * to be removed
   * @throws {Error} If one of the bricks is not part of the pipe.
   * @return {Pipe} Fluent interface
   */
  removeBricks (bricksOrIndexes) {
    bricksOrIndexes
      // Map brick instances to indexes
      .map(brickOrIndex => {
        let index = brickOrIndex
        if (brickOrIndex instanceof Brick) {
          index = this._bricks.indexOf(brickOrIndex)
          if (index === -1) {
            throw new Error(
              'Brick is not part of the pipe and thus can\'t be removed.')
          }
        }
        return index
      })
      // Sort indexes in descending order
      .sort((a, b) => b - a)
      // Remove each
      .forEach(index => this.spliceBricks(index, 1))
    return this
  }

  /**
   * Replaces a single brick.
   * Convenience method calling {@link Pipe.spliceBricks} internally.
   * @param {Brick} needle Instance to be replaced
   * @param {Brick|object} replacement Replacement brick instance or
   * serialized brick object
   * @throws {Error} If needle is not part of the pipe.
   * @return {Pipe} Fluent interface
   */
  replaceBrick (needle, replacement) {
    const index = this._bricks.indexOf(needle)
    if (index === -1) {
      throw new Error('Can\'t replace a brick not being part of the pipe.')
    }
    this.spliceBricks(index, 1, [replacement])
    return this
  }

  /**
   * Removes and/or inserts bricks to the pipe at given index maintaining the
   * content buckets and triggering content propagation when needed.
   * @param {number} index Index at which bricks should be removed or inserted
   * @param {number} removeCount Amount of bricks to be removed
   * @param {Brick[]|object[]} [bricks=[]] Brick instances or serialized brick
   * objects to be inserted into the pipe
   * @return {Brick[]} Array of bricks that have been removed
   */
  spliceBricks (index, removeCount, bricks = []) {
    // Normalize index
    index = index >= 0 ? index : Math.max(this._bricks.length + index + 1, 0)

    // Reject all bucket listeners before changing bricks
    this._bucketListeners.map(listeners => {
      listeners.forEach(listener => listener.reject(
        'Pipe bricks have been changed.'))
      return []
    })

    // Instanciate serialized bricks
    bricks = bricks.map(brick =>
      !(brick instanceof Brick)
        ? Brick.extract(brick, this.getBrickFactory())
        : brick)

    // Splice internal brick array
    const removedBricks = this._bricks.splice.apply(this._bricks,
      [index, removeCount].concat(bricks))

    // Splice internal state array
    this._brickState.splice.apply(this._brickState,
      [index, removeCount].concat(bricks.map(() => ({
        settingsVersion: 1,
        busy: false
      }))))

    // Prepare added bricks, reset removed bricks
    let bucketInsertCount = 0
    let bucketRemoveCount = 0

    bricks.forEach(brick => {
      brick.setPipe(this)
      this.hasView() && this.getView().addSubview(brick.getView())

      if (brick instanceof Encoder) {
        bucketInsertCount++
      }

      // Track event
      EventManager.trigger('pipeAddBrick', { pipe: this, brick })
    })

    removedBricks.forEach(brick => {
      this.hasView() && this.getView().removeSubview(brick.getView())
      brick.setPipe(null)

      if (brick instanceof Encoder) {
        bucketRemoveCount++
      }

      // Track event
      EventManager.trigger('pipeRemoveBrick', { pipe: this, brick })
    })

    // Update buckets if needed
    if (bucketInsertCount > 0 || bucketRemoveCount > 0) {
      // Check where to insert or remove buckets
      let bucketChangeIndex = this._bricks.reduce((count, brick, i) =>
        count + (brick instanceof Encoder && i <= index ? 1 : 0), 0)

      if (bucketChangeIndex === 0) {
        bucketChangeIndex = 1
      }

      // Create new empty buckets
      const insertBuckets = new Array(bucketInsertCount)
        .fill().map(() => Chain.empty())

      // Splice buckets
      const removedBuckets =
        this._bucketContent.splice.apply(this._bucketContent,
          [bucketChangeIndex, bucketRemoveCount].concat(insertBuckets))

      // Splice bucket listeners
      this._bucketListeners.splice.apply(this._bucketListeners,
        [bucketChangeIndex, bucketRemoveCount].concat(
          insertBuckets.map(bucket => [])))

      // Update selected bucket and propagate content accordingly
      // There are a few cases to consider
      if (this._selectedBucket <= bucketChangeIndex - 1) {
        // Case 1: Selected bucket is situated before the changing part
        // Leave selection unchanged, trigger forward propagation from before
        // the changed buckets
        this._propagateContent(bucketChangeIndex - 1, true)
      } else if (
        this._selectedBucket === bucketChangeIndex &&
        bucketRemoveCount === 1 &&
        bucketInsertCount === 1
      ) {
        // Case 2: Selected bucket is being replaced (e.g. replacing a brick)
        // Leave the selection unchanged, maintain the old bucket's content and
        // propagate from it backwards
        this._bucketContent[this._selectedBucket] = removedBuckets[0]
        this._propagateContent(this._selectedBucket, false)
      } else if (this._selectedBucket <= bucketChangeIndex - 1 + bucketRemoveCount) {
        // Case 3: Selected bucket is set to be removed
        // Select the bucket before the change and propagate from it forwards
        this._selectedBucket = bucketChangeIndex - 1
        this._propagateContent(this._selectedBucket, true)
      } else {
        // Case 4: Selected bucket is situated after the changing part
        // The change may remove or add buckets, move the selection with it
        // Propagate content backwards from the bucket after the changing part
        const delta = bucketInsertCount - bucketRemoveCount
        this._selectedBucket += delta
        this._propagateContent(bucketChangeIndex + bucketInsertCount, false)
      }
    } else {
      // Buckets stay as is, no encoder brick involved
      // Trigger views on new viewers
      bricks.forEach(viewer => this._triggerViewerView(viewer))
    }

    // Layout
    this.hasView() && this.getView().layout()
    return removedBricks
  }

  /**
   * Returns the number of buckets.
   * @return {number}
   */
  getBucketLength () {
    return this._bucketContent.length
  }

  /**
   * Returns content of given bucket.
   * @param {number} [bucket=0] Bucket index
   * @param {boolean} [waitForCompletion=true] If set to true, the value is
   * being resolved after all pipe tasks have been completed.
   * @throws {Error} If bucket index is out of bounds.
   * @return {Chain|Promise} content
   */
  getContent (bucket = 0, waitForCompletion = true) {
    if (bucket >= this._bucketContent.length) {
      throw new Error(`Bucket index ${bucket} is out of bounds.`)
    }
    if (waitForCompletion && this.isBusy()) {
      return new Promise((resolve, reject) => {
        this._bucketListeners[bucket].push({ resolve, reject })
      })
    }
    return this._bucketContent[bucket]
  }

  /**
   * Sets content of given bucket and propagates it through the pipe.
   * @param {number[]|string|Uint8Array|Chain} content
   * @param {number} [bucket=0] Bucket index
   * @param {Brick} [sender=null] Sender brick or null
   * @return Fluent interface
   */
  setContent (content, bucket = 0, sender = null) {
    // Wrap content inside Chain
    content = Chain.wrap(content)

    // Stop here, if no changes are being applied
    if (this.getContent(bucket, false).isEqualTo(content)) {
      return this
    }

    // Update bucket content
    this._bucketContent[bucket] = content

    // Select the last changed bucket
    if (sender === null || sender instanceof Viewer) {
      this._selectedBucket = bucket
    }

    // Propagate changes through pipe
    this._propagateContent(bucket, sender)
    return this
  }

  /**
   * Propagate content through pipe from given bucket.
   * @protected
   * @param {number} bucket
   * @param {Brick|boolean} [senderOrIsForward] Sender brick to which content
   * should not be propagated to or wether to propagate forward (true) or
   * backward (false). Propagates to every direction by default.
   * @return {Pipe} Fluent interface
   */
  _propagateContent (bucket, senderOrIsForward = null) {
    const { lowerEncoder, upperEncoder, viewers } =
      this.getBricksAttachedToBucket(bucket)

    // Trigger viewer views
    viewers
      .filter(viewer => viewer !== senderOrIsForward)
      .forEach(this._triggerViewerView.bind(this))

    // Trigger decode at lower end
    if (lowerEncoder !== null &&
        senderOrIsForward !== true &&
        lowerEncoder !== senderOrIsForward) {
      this._triggerEncoderTranslation(lowerEncoder, false)
    }

    // Trigger encode at upper end
    if (upperEncoder !== null &&
        senderOrIsForward !== false &&
        upperEncoder !== senderOrIsForward) {
      this._triggerEncoderTranslation(upperEncoder, true)
    }

    return this
  }

  /**
   * Triggers viewer view. Keeps track of busy viewers and skips
   * view accordingly.
   * @protected
   * @param {Viewer} viewer
   */
  async _triggerViewerView (viewer) {
    // Check if viewer is busy
    if (this._getBrickState(viewer, 'busy')) {
      return this
    }

    // Mark viewer as busy
    this._setBrickState(viewer, 'busy', true)

    // Collect view data
    const bucket = this.getBucketIndexForBrick(viewer)
    const content = this.getContent(bucket, false)
    const settingsVersion = this._getBrickState(viewer, 'settingsVersion')

    // Trigger viewer view and await completion
    let error
    try {
      await viewer.view(content)
    } catch (e) {
      error = e
    }

    // Stop here if viewer is no longer part of the pipe
    if (!this.containsBrick(viewer)) {
      return
    }

    // Mark viewer as no longer busy
    this._setBrickState(viewer, 'busy', false)

    // Collect post view data, buckets may have changed in the meantime
    const postSettingsVersion = this._getBrickState(viewer, 'settingsVersion')
    const postBucket = this.getBucketIndexForBrick(viewer)

    // Check if the bucket or the viewer settings have changed in the meantime
    if (!this.getContent(postBucket, false).isEqualTo(content) ||
        settingsVersion !== postSettingsVersion) {
      // Repeat view
      this._triggerViewerView(viewer)
    }

    // Trigger brick finish event
    this.brickDidFinish(viewer, error)

    // Throw unexpected errors
    if (error && !(error instanceof InvalidInputError)) {
      throw error
    }
  }

  /**
   * Triggers encoder translation and handles their results. Keeps track of busy
   * encoders and skips or repeats translations accordingly.
   * @protected
   * @param {Encoder} encoder
   * @param {boolean} isEncode True for encoding, false for decoding.
   */
  async _triggerEncoderTranslation (encoder, isEncode) {
    // Skip translation if encoder is currently busy
    // As soon as the encoder responds the translation will be repeated when the
    // source content differs
    if (this._getBrickState(encoder, 'busy')) {
      return this
    }

    // Mark encoder as busy
    this._setBrickState(encoder, 'busy', true)

    // Collect translation data
    const lowerBucket = this.getBucketIndexForBrick(encoder)
    const source = this.getContent(lowerBucket + (isEncode ? 0 : 1), false)
    const settingsVersion = this._getBrickState(encoder, 'settingsVersion')

    // Trigger encoder translation and await result
    let result, error
    try {
      result = await encoder.translate(source, isEncode)
    } catch (e) {
      error = e
    }

    // Stop here if encoder is no longer part of the pipe
    if (!this.containsBrick(encoder)) {
      return
    }

    // Mark encoder as no longer busy
    this._setBrickState(encoder, 'busy', false)

    // Collect post translation data, buckets may have changed in the meantim
    const postSettingsVersion = this._getBrickState(encoder, 'settingsVersion')
    const postLowerBucket = this.getBucketIndexForBrick(encoder)
    const postSourceBucket = postLowerBucket + (isEncode ? 0 : 1)
    const postSource = this.getContent(postSourceBucket, false)
    const resultBucket = postLowerBucket + (isEncode ? 1 : 0)

    // Check if the currently selected bucket has been relocated in the opposite
    // encoding direction in the meantime
    if ((isEncode && this._selectedBucket >= resultBucket) ||
        (!isEncode && this._selectedBucket <= resultBucket)) {
      // Trigger translation in the opposite direction
      this._triggerEncoderTranslation(encoder, !isEncode)
      // Result of this translation is no longer relevant
      // Throw it away and stop here
      return
    }

    // If translation succeeded, propagate result
    if (!error) {
      this.setContent(result, resultBucket, encoder)
    }

    // Check if the source or the encoder settings have changed in the meantime
    if (!postSource.isEqualTo(source) ||
        settingsVersion !== postSettingsVersion) {
      // Repeat translation
      this._triggerEncoderTranslation(encoder, isEncode)
    }

    // Trigger brick finish event
    this.brickDidFinish(encoder, error)

    // Throw unexpected errors
    if (error && !(error instanceof InvalidInputError)) {
      throw error
    }
  }

  /**
   * Returns the current state for given brick.
   * @protected
   * @param {Brick} brick
   * @param {string} key
   * @throws {Error} Throws an error if given brick is not part of the pipe.
   * @return {mixed} Current brick state
   */
  _getBrickState (brick, key) {
    const index = this._bricks.indexOf(brick)
    if (index === -1) {
      throw new Error('Brick is not part of the pipe and thus has no state.')
    }
    return this._brickState[index][key]
  }

  /**
   * Updates the current state on given brick.
   * @protected
   * @param {Brick} brick
   * @param {string} key
   * @param {mixed} value
   * @return {Pipe} Fluent interface
   */
  _setBrickState (brick, key, value) {
    const index = this._bricks.indexOf(brick)
    if (index === -1) {
      throw new Error('Brick is not part of the pipe and thus has no state.')
    }
    this._brickState[index][key] = value
    return this
  }

  /**
   * Returns true if at least one of the bricks is busy.
   * @return {boolean}
   */
  isBusy () {
    return this._bricks.reduce((busy, brick) =>
      busy || this._getBrickState(brick, 'busy'), false)
  }

  /**
   * Returns lower bucket index for given brick.
   * @param {Brick} brick
   * @throws {Error} Throws an error if brick is not part of pipe.
   * @return {number}
   */
  getBucketIndexForBrick (brick) {
    // The bucket index is equal to the amount of
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
      throw new Error(
        'Can\'t find bucket for brick. Brick is not part of Pipe.')
    }
    return encoderCount
  }

  /**
   * Returns an object containing the lower and upper encoder as well as the
   * viewers attached to the given bucket.
   * @param {number} bucket
   * @return {object}
   */
  getBricksAttachedToBucket (bucket) {
    let lowerEncoder = null
    let upperEncoder = null
    const viewers = []

    let encoderCount = 0
    let i = -1
    let brick

    while (++i < this._bricks.length && encoderCount <= bucket) {
      brick = this._bricks[i]
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

    return { lowerEncoder, upperEncoder, viewers }
  }

  /**
   * Delegate method triggered by child viewers if their content changed.
   * @protected
   * @param {Viewer} viewer Sender viewer
   * @param {Chain} content
   */
  viewerContentDidChange (viewer, content) {
    // Ignore events from bricks that are not part of the pipe
    if (!this.containsBrick(viewer)) {
      return
    }
    const bucket = this.getBucketIndexForBrick(viewer)
    this.setContent(content, bucket, viewer)
  }

  /**
   * Delegate method triggered by child bricks when they change visibility.
   * @param {Brick} brick Brick which changed visibility
   * @param {boolean} hidden Wether brick is now hidden
   */
  brickVisibilityDidChange (brick, hidden) {
    this.updateView()
  }

  /**
   * Delegate method triggered by child bricks when their settings changed.
   * @protected
   * @param {Encoder} brick Sender brick
   */
  brickSettingDidChange (brick) {
    // Ignore events from bricks that are not part of the pipe
    if (!this.containsBrick(brick)) {
      return
    }

    // Increase brick settings version
    this._setBrickState(
      brick,
      'settingsVersion',
      this._getBrickState(brick, 'settingsVersion') + 1
    )

    if (brick instanceof Encoder) {
      // Trigger encode or decode depending on location of the selected bucket
      const lowerBucket = this.getBucketIndexForBrick(brick)
      const isEncode = this._selectedBucket <= lowerBucket
      this._triggerEncoderTranslation(brick, isEncode)
    } else {
      // Trigger view
      this._triggerViewerView(brick)
    }
  }

  /**
   * Delegate method triggered by child bricks when they got reversed.
   * @protected
   * @param {Encoder} brick Sender brick
   * @param {boolean} reverse Wether to reverse translation
   */
  encoderDidReverse (brick, reverse) {
    if (
      this._bricks.length === 3 &&
      this._bricks[0].getMeta().type === 'viewer' &&
      this._bricks[1].getMeta().type === 'encoder' &&
      this._bricks[2].getMeta().type === 'viewer'
    ) {
      // Having this constellation, swap source and result viewer
      // when reversing the encoder brick in the middle
      const resultContent = this.getContent(1, false)
      const bricks = this.spliceBricks(0, 3)
      bricks.reverse()
      this.setContent(resultContent, 0)
      this.spliceBricks(0, 0, bricks)
    } else {
      // Treat other scenarios like setting change events
      this.brickSettingDidChange(brick)
    }
  }

  /**
   * Triggered when a brick finishes a task.
   * @protected
   * @param {Brick} brick Brick that just finished the task
   * @param {Error?} error Error occured during task.
   */
  brickDidFinish (brick, error) {
    if (!this.isBusy()) {
      // The pipe has just finished all its tasks, notify each content listener
      this._bucketListeners.map((listeners, bucket) => {
        listeners.forEach(listener =>
          error !== null
            ? listener.resolve(this.getContent(bucket, false))
            : listener.reject(error))
        return []
      })
    }
  }

  /**
   * Triggered when brick view replace button has been clicked.
   * @protected
   * @param {Brick} brick
   */
  async brickReplaceButtonDidClick (brick) {
    // Show only bricks of the same type in the modal view
    const modalView = this.getLibraryModalView()
    modalView.applyFilter(brickMeta => brickMeta.type === brick.getMeta().type)

    // Ignore event when library modal view is already visible
    if (modalView.isVisible()) {
      return
    }

    let name = brick.getMeta().name
    try {
      name = await modalView.prompt(name)
    } catch (error) {
      // Stop here when user cancels the modal view
      return
    }

    // Replace brick only if a different one is selected
    if (name !== brick.getMeta().name) {
      const replacement = this.getBrickFactory().create(name)
      if ((brick instanceof Encoder) && (replacement instanceof Encoder)) {
        // Apply the same reverse state on the replacement brick
        replacement.setReverse(brick.isReverse())
      }
      this.replaceBrick(brick, replacement)
    }
  }

  /**
   * Triggered when view add button has been clicked.
   * @protected
   * @param {PipeView} view
   * @param {number} index
   */
  async viewAddButtonDidClick (view, index) {
    // Track action
    EventManager.trigger('pipeAddButtonClick', { pipe: this, index })

    // Offer all bricks in the modal view
    const modalView = this.getLibraryModalView()
    modalView.clearFilter()

    let name
    try {
      name = await modalView.prompt()
    } catch (error) {
      // Stop here when user cancels the modal view
      return
    }

    // Create brick and add it to the pipe
    const brick = this.getBrickFactory().create(name)
    this.spliceBricks(index, 0, [brick])
  }

  /**
   * Triggered when a brick is dropped on given index.
   * @param {PipeView} view Sender
   * @param {number} index Index at which the brick is dropped
   * @param {Brick|object} brick Brick instance or serialized brick object
   * @param {boolean} copy Wether to copy or move the brick
   */
  viewBrickDidDrop (view, index, brick, copy = false) {
    if (brick instanceof Brick) {
      if (copy) {
        this.duplicateBrick(brick, index)
      } else {
        this.moveBrick(brick, index)
      }
    } else {
      this.spliceBricks(index, 0, [brick])
    }
    // Track action
    EventManager.trigger('pipeBrickDrop', { pipe: this, index, brick, copy })
  }

  /**
   * Triggered when a hidden brick group has been clicked.
   * @param {PipeView} view Sender
   * @param {Brick[]} bricks Array of bricks in group
   */
  viewHiddenBrickGroupDidClick (view, bricks) {
    // Make bricks in this collapsed group visible
    bricks.forEach(brick => brick.setHidden(false))
    // Track action
    EventManager.trigger('pipeHiddenBrickGroupClick', { pipe: this, bricks })
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    // Add each brick as subview
    this._bricks.forEach(brick => view.addSubview(brick.getView()))
  }

  /**
   * Stores this pipe using the backend service.
   * @return {string} Pipe URL
   */
  async store () {
    const data = await this.getService().storePipe(this)
    return data.url
  }

  /**
   * Serializes pipe to make it JSON serializable
   * @return {mixed} Structured data.
   */
  serialize () {
    const data = {}

    // Pipe meta
    if (this._id !== null) {
      data.id = this._id
    }
    if (this._url !== null) {
      data.url = this._url
    }
    if (this._title !== null) {
      data.title = this._title
    }
    if (this._description !== null) {
      data.description = this._description
    }

    // Items
    data.items = this._bricks.map(brick => brick.serialize())

    // Content
    const bucket = this._selectedBucket
    const content = this._bucketContent[bucket]

    if (!content.isEmpty() || bucket > 0) {
      data.content = {}

      // Encode content data
      if (!content.needsTextEncoding()) {
        data.content.data = content.getString()
      } else {
        data.content.data = ByteEncoder.base64StringFromBytes(content.getBytes())
        data.content.encoding = 'base64'
      }

      // Calculate content injection index
      const { lowerEncoder } = this.getBricksAttachedToBucket(bucket)
      if (lowerEncoder !== null) {
        data.content.index = this._bricks.indexOf(lowerEncoder) + 1
      }
    }

    return data
  }

  /**
   * Extracts pipe from structured data.
   * @param {mixed} data Structured data
   * @param {Factory} brickFactory Brick factory used for brick creation
   * @throws {Error} Throws an error if structured data is malformed.
   * @return {Pipe} Extracted pipe
   */
  static extract (data, brickFactory) {
    // Verify items
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error(
        'Pipe property \'items\' is expected to be of type \'array\' ' +
        'and must not be empty')
    }

    // Create pipe instance
    const pipe = new Pipe()
    pipe.setBrickFactory(brickFactory)
    pipe.addBricks(data.items)

    // Handle id property
    if (data.id !== undefined && data.id !== null) {
      if (typeof data.id !== 'number') {
        throw new Error(
          'Optional pipe property \'id\' is expected to be of type \'number\'')
      }
      pipe.setId(data.id)
    }

    // Handle url property
    if (data.url !== undefined && data.url !== null) {
      if (typeof data.url !== 'string') {
        throw new Error(
          'Optional pipe property \'url\' is expected to be of type \'string\'')
      }
      pipe.setUrl(data.url)
    }

    // Handle title property
    if (data.title !== undefined && data.title !== null) {
      if (typeof data.title !== 'string') {
        throw new Error(
          'Optional pipe property \'title\' is expected to be of ' +
          'type \'string\'')
      }
      pipe.setTitle(data.title)
    }

    // Handle description property
    if (data.description !== undefined && data.description !== null) {
      if (typeof data.description !== 'string') {
        throw new Error(
          'Optional pipe property \'description\' is expected to be of ' +
          'type \'string\'')
      }
      pipe.setDescription(data.description)
    }

    // Handle content property
    let content = ''
    let bucket = 0

    if (data.content !== undefined && data.content !== null) {
      if (typeof data.content !== 'object') {
        throw new Error(
          'Optional pipe property \'content\' is expected to be of ' +
          'type \'object\'')
      }

      if (data.content.data === undefined ||
          typeof data.content.data !== 'string') {
        throw new Error(
          'Pipe property \'content.data\' is expected to be of ' +
          'type \'string\'')
      }

      if (data.content.encoding !== undefined &&
          typeof data.content.encoding !== 'string') {
        throw new Error(
          'Optional pipe property \'content.encoding\' is expected to be of ' +
          'type \'string\'')
      }

      if (data.content.index !== undefined &&
          typeof data.content.index !== 'number') {
        throw new Error(
          'Optional pipe property \'content.index\' is expected to be of ' +
          'type \'number\'')
      }

      // Decode content
      const contentEncoding = data.content.encoding || 'text'
      switch (contentEncoding) {
        case 'text':
          content = data.content.data
          break
        case 'base64':
          content = ByteEncoder.bytesFromBase64String(data.content.data)
          break
        default:
          throw new Error(
            'Optional pipe property \'content.encoding\' is set to an ' +
            `unsupported encoding '${contentEncoding}'; Supported values: ` +
            'text, base64')
      }

      // Inject content into pipe
      const contentIndex = data.content.index || 0
      if (contentIndex === pipe.getLength()) {
        // Handle content injection at the very end of the pipe
        bucket = pipe.getBucketLength() - 1
      } else if (contentIndex >= 0 && contentIndex < pipe.getLength()) {
        // Handle content injection before the given brick
        bucket = pipe.getBucketIndexForBrick(pipe.getBrick(contentIndex))
      } else {
        // Out of range error
        throw new Error(
          'Optional pipe property \'content.index\' is expected to be a ' +
          `number ranging from 0 to ${pipe.getBucketLength() - 1}`)
      }
    }

    // Inject content
    pipe.setContent(content, bucket)

    return pipe
  }
}
