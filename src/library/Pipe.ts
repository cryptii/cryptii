
import Base64Encoder from './Encoder/Base64Encoder'
import Brick from './Brick/Brick'
import BrickFactory from './Brick/BrickFactory'
import Chain from './Chain'
import EncoderBrick from './Brick/EncoderBrick'
import EventManager from './EventManager'
import InvalidInputError from './Error/InvalidInputError'
import PipeView from '../views/Pipe'
import PlaceholderBrick from './Brick/PlaceholderBrick'
import Service from './Service'
import UndoHistory from './UndoHistory'
import Viewable from './Viewable'
import ViewerBrick from './Brick/ViewerBrick'

/**
 * Arrangement of viewers and encoders.
 */
export default class Pipe extends Viewable {

  private brickFactory?: BrickFactory

  private service?: Service

  private url?: string

  private bricks: Brick[] = []
  private brickState: any[] = []

  private bucketContent: Chain[] = [Chain.from('')]
  private bucketListeners: any[] = [[]]
  private selectedBucket: number = 0

  private undoHistory = new UndoHistory<any>()

  /**
   * React component this model is represented by
   */
  protected viewComponent = PipeView

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      bricks: this.bricks.map(brick => brick.render()),
      brickIds: this.bricks.map(brick => brick.getId()),
      pipes: ['forward', 'forward', 'none'],
      onDragEnter: this.viewDidDragEnter.bind(this),
      onDragDrop: this.viewDidDragDrop.bind(this),
      undoEnabled: this.undoHistory.canUndo(),
      onUndoClick: this.undo.bind(this),
      redoEnabled: this.undoHistory.canRedo(),
      onRedoClick: this.redo.bind(this)
    }
  }

  /**
   * Returns the URL.
   */
  getUrl (): string | undefined {
    return this.url
  }

  /**
   * Sets the url.
   * @param url - New url
   */
  setUrl (url: string | undefined): void {
    this.url = url
  }

  /**
   * Returns the brick factory used upon brick creation inside the pipe.
   */
  getBrickFactory (): BrickFactory {
    if (this.brickFactory === undefined) {
      this.brickFactory = BrickFactory.getSharedInstance()
    }
    return this.brickFactory
  }

  /**
   * Sets the brick factory used upon brick creation inside the pipe.
   * @param brickFactory - New brick factory instance
   */
  setBrickFactory (brickFactory: BrickFactory): void {
    this.brickFactory = brickFactory
  }

  /**
   * Returns the service instance.
   */
  getService (): Service {
    if (this.service === undefined) {
      this.service = Service.getSharedInstance()
    }
    return this.service
  }

  /**
   * Sets the service instance.
   * @param service - New service instance
   */
  setService (service: Service): void {
    this.service = service
  }

  /**
   * Returns the number of bricks.
   */
  getLength (): number {
    return this.bricks.length
  }

  /**
   * Returns a shallow copy of the current pipe bricks.
   */
  getBricks (): Brick[] {
    return this.bricks.slice()
  }

  /**
   * Returns a single brick at given index.
   * @param index - Brick index
   * @throws {Error} If brick index is out of bounds.
   */
  getBrick (index: number): Brick {
    if (index < 0 || index >= this.bricks.length) {
      throw new Error(`Pipe Brick index ${index} out of bounds.`)
    }
    return this.bricks[index]
  }

  /**
   * Returns wether given brick is part of the pipe.
   * @param needle - Brick to search for
   */
  containsBrick (needle: Brick): boolean {
    return this.bricks.indexOf(needle) !== -1
  }

  /**
   * Adds single brick to the end of the pipe.
   * @param brick - Brick instance or serialized brick object to be added
   */
  addBrick (brick: Brick): void {
    this.spliceBricks(-1, 0, [brick])
  }

  /**
   * Adds multiple bricks to the end of the pipe.
   * Convenience method calling {@link Pipe.spliceBricks} internally.
   * @param bricks - Brick instances or serialized brick objects to be added
   */
  addBricks (bricks: Brick[]): void {
    this.spliceBricks(-1, 0, bricks)
  }

  /**
   * Inserts a copy of given brick into the pipe.
   * @param brick - Pipe brick to be duplicated
   * @param index - Index at which the copy should be inserted, inserts the copy
   * after the original brick if omitted
   * @throws {Error} If brick to be duplicated is not part of the pipe.
   */
  copyBrick (brick: Brick, index?: number): void {
    if (!this.containsBrick(brick)) {
      throw new Error(`Brick to be duplicated is not part of the pipe.`)
    }
    if (index === undefined) {
      index = this.bricks.indexOf(brick)
    }
    const duplicate = this.getBrickFactory().duplicate(brick)
    this.spliceBricks(index, 0, [duplicate])
  }

  /**
   * Moves brick to given index.
   * @param brick - Pipe brick to be moved
   * @param index - Index the brick should be moved to
   * @throws {Error} If brick to be moved is not part of the pipe.
   */
  moveBrick (brick: Brick, index: number): void {
    const fromIndex = this.bricks.indexOf(brick)
    if (fromIndex === -1) {
      throw new Error(`Brick to be moved is not part of the pipe.`)
    }
    if (index > fromIndex) {
      index--
    }
    if (index !== fromIndex) {
      this.spliceBricks(fromIndex, 1)
      this.spliceBricks(index, 0, [brick])
    }
  }

  /**
   * Removes single brick from the pipe.
   * Convenience method calling {@link Pipe.spliceBricks} internally.
   * @param brickOrIndex - Brick or index to be removed
   * @throws {Error} If brick to be removed is not part of the pipe.
   */
  removeBrick (brickOrIndex: Brick | number): void {
    let index: number
    if (brickOrIndex instanceof Brick) {
      index = this.bricks.indexOf(brickOrIndex)
      if (index === -1) {
        throw new Error(`Brick to be removed is not part of the pipe.`)
      }
    } else {
      index = brickOrIndex as number
    }
    this.spliceBricks(index, 1)
  }

  /**
   * Removes bricks from the pipe.
   * Convenience method calling {@link Pipe.spliceBricks} internally.
   * @param bricksOrIndicies - Array of bricks or indexes to be removed
   * @throws {Error} If one of the bricks is not part of the pipe.
   */
  removeBricks (bricksOrIndicies: (Brick | number)[]): void {
    const indicies: number[] = new Array(bricksOrIndicies.length)

    // Map receiving array to numeric indicies
    let index
    for (let i = 0; i < bricksOrIndicies.length; i++) {
      if (bricksOrIndicies[i] instanceof Brick) {
        index = this.bricks.indexOf(bricksOrIndicies[i] as Brick)
        if (index === -1) {
          throw new Error(`Brick to be removed is not part of the pipe.`)
        }
        indicies.push(index)
      } else {
        indicies.push(bricksOrIndicies[i] as number)
      }
    }

    // Sort indicies in descending order
    indicies.sort((a, b) => b - a)

    // Remove each requested brick
    for (let i = 0; i < indicies.length; i++) {
      this.spliceBricks(i, 1)
    }
  }

  /**
   * Replaces a single Brick by the given instance.
   * @param needle - Brick instance to be replaced
   * @param replacement - Replacement brick instance
   * @throws {Error} If needle is not part of the pipe.
   */
  replaceBrick (needle: Brick, replacement: Brick): void {
    const index = this.bricks.indexOf(needle)
    if (index === -1) {
      throw new Error(`Brick to be replaced is not part of the pipe.`)
    }
    this.spliceBricks(index, 1, [replacement])
  }

  /**
   * Removes and/or inserts bricks to the pipe at given index maintaining the
   * content buckets and triggering content propagation when needed.
   * @param index - Index at which bricks should be removed or inserted
   * @param removeCount - Number of bricks to be removed
   * @param bricks - Brick instances to be inserted
   * @returns Array of bricks that have been removed
   */
  spliceBricks (
    index: number,
    removeCount: number,
    bricks: Brick[] = []
  ): Brick[] {
    // Normalize index
    index = index >= 0 ? index : Math.max(this.bricks.length + index + 1, 0)

    // Reject all bucket listeners before changing bricks
    this.bucketListeners.map(listeners => {
      listeners.forEach(listener => listener.reject(
        'Pipe bricks have been changed.'))
      return []
    })

    // Splice internal brick array
    const removedBricks = this.bricks.splice.apply(this.bricks,
      [index, removeCount].concat(bricks))

    // Splice internal state array
    this.brickState.splice.apply(this.brickState,
      [index, removeCount].concat(bricks.map(brick => ({
        settingsVersion: 1,
        // Until replaced, placeholder Bricks are always busy
        busy: brick instanceof PlaceholderBrick,
        dragging: false
      }))))

    // Prepare added bricks, reset removed bricks
    let bucketInsertCount = 0
    let bucketRemoveCount = 0

    bricks.forEach(brick => {
      brick.setPipe(this)
      brick.setParentView(this)

      if (brick instanceof EncoderBrick) {
        bucketInsertCount++
      }

      // Track event
      EventManager.trigger('pipeAddBrick', { pipe: this, brick })
    })

    removedBricks.forEach(brick => {
      brick.setPipe(undefined)
      brick.setParentView(undefined)

      if (brick instanceof EncoderBrick) {
        bucketRemoveCount++
      }

      // Track event
      EventManager.trigger('pipeRemoveBrick', { pipe: this, brick })
    })

    // Update buckets if needed
    if (bucketInsertCount > 0 || bucketRemoveCount > 0) {
      // Check where to insert or remove buckets
      let bucketChangeIndex = this.bricks.reduce((count, brick, i) =>
        count + (brick instanceof EncoderBrick && i <= index ? 1 : 0), 0)

      if (bucketChangeIndex === 0) {
        bucketChangeIndex = 1
      }

      // Create new empty buckets
      const insertBuckets = new Array(bucketInsertCount)
        .fill(undefined).map(() => Chain.from(''))

      // Splice buckets
      const removedBuckets =
        this.bucketContent.splice.apply(this.bucketContent,
          [bucketChangeIndex, bucketRemoveCount].concat(insertBuckets))

      // Splice bucket listeners
      this.bucketListeners.splice.apply(this.bucketListeners,
        [bucketChangeIndex, bucketRemoveCount].concat(
          insertBuckets.map(bucket => [])))

      // Update selected bucket and propagate content accordingly
      // There are a few cases to consider
      if (this.selectedBucket <= bucketChangeIndex - 1) {
        // Case 1: Selected bucket is situated before the changing part
        // Leave selection unchanged, trigger forward propagation from before
        // the changed buckets
        this.propagateContent(bucketChangeIndex - 1, true)
      } else if (
        this.selectedBucket === bucketChangeIndex &&
        bucketRemoveCount === 1 &&
        bucketInsertCount === 1
      ) {
        // Case 2: Selected bucket is being replaced (e.g. replacing a brick)
        // Leave the selection unchanged, maintain the old bucket's content and
        // propagate from it backwards
        this.bucketContent[this.selectedBucket] = removedBuckets[0]
        this.propagateContent(this.selectedBucket, false)
      } else if (this.selectedBucket <= bucketChangeIndex - 1 + bucketRemoveCount) {
        // Case 3: Selected bucket is set to be removed
        // Select the bucket before the change and propagate from it forwards
        this.selectedBucket = bucketChangeIndex - 1
        this.propagateContent(this.selectedBucket, true)
      } else {
        // Case 4: Selected bucket is situated after the changing part
        // The change may remove or add buckets, move the selection with it
        // Propagate content backwards from the bucket after the changing part
        const delta = bucketInsertCount - bucketRemoveCount
        this.selectedBucket += delta
        this.propagateContent(bucketChangeIndex + bucketInsertCount, false)
      }
    } else {
      // Buckets stay as is, no encoder brick involved
      // Trigger views on new viewers
      bricks.forEach(viewer => this._triggerViewerView(viewer))
    }

    // Update view
    this.updateView()

    return removedBricks
  }

  /**
   * Returns the number of buckets.
   */
  getBucketCount (): number {
    return this.bucketContent.length
  }

  /**
   * Returns content of given bucket.
   * @param bucket - Bucket index
   * @param waitForCompletion - If set to true, the value is being resolved
   * after all pipe tasks have been completed.
   * @throws {Error} If bucket index is out of bounds.
   */
  getContent (
    bucket: number = 0,
    waitForCompletion: boolean = true
  ): Chain | Promise<Chain> {
    if (bucket >= this.bucketContent.length) {
      throw new Error(`Bucket index ${bucket} is out of bounds.`)
    }
    if (waitForCompletion && this.isBusy()) {
      return new Promise((resolve, reject) => {
        this.bucketListeners[bucket].push({ resolve, reject })
      })
    }
    return this.bucketContent[bucket]
  }

  /**
   * Sets content of given bucket and propagates it through the pipe.
   * @param content - New bucket content
   * @param bucket - Bucket index
   * @param sender - Sender brick or null
   */
  setContent (
    content: number[]|string|Uint8Array|Chain,
    bucket: number = 0,
    sender?: any
  ): void {
    // Wrap content inside Chain
    content = Chain.from(content)

    // Stop here, if no changes are being applied
    if (this.getContent(bucket, false).isEqualTo(content)) {
      return
    }

    // Update bucket content
    this.bucketContent[bucket] = content

    // Select the last changed bucket
    if (sender === undefined || sender instanceof ViewerBrick) {
      this.selectedBucket = bucket

      // Push to undo history
      this.pushUndoHistoryAction('content')
    }

    // Propagate changes through pipe
    this.propagateContent(bucket, sender)
  }

  /**
   * Propagate content through pipe from given bucket.
   * @param bucket - Bucket to propagate content from
   * @param senderOrIsForward - Sender brick to which content
   * should not be propagated to or wether to propagate forward (true) or
   * backward (false). Propagates to every direction by default.
   */
  private propagateContent (
    bucket: number,
    senderOrIsForward?: boolean
  ): void {
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
      this.triggerEncoderTranslation(lowerEncoder, false)
    }

    // Trigger encode at upper end
    if (upperEncoder !== null &&
        senderOrIsForward !== false &&
        upperEncoder !== senderOrIsForward) {
      this.triggerEncoderTranslation(upperEncoder, true)
    }
  }

  /**
   * Triggers viewer view. Keeps track of busy viewers and skips
   * view accordingly.
   * @param viewer
   */
  private async _triggerViewerView (viewer: ViewerBrick): Promise<void> {
    // Check if viewer is busy
    if (this.getBrickState(viewer, 'busy')) {
      return
    }

    // Mark viewer as busy
    this.setBrickState(viewer, 'busy', true)

    // Collect view data
    const bucket = this.getBucketIndexForBrick(viewer)
    const content = this.getContent(bucket, false)
    const settingsVersion = this.getBrickState(viewer, 'settingsVersion')

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
    this.setBrickState(viewer, 'busy', false)

    // Collect post view data, buckets may have changed in the meantime
    const postSettingsVersion = this.getBrickState(viewer, 'settingsVersion')
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
   * @param encoder
   * @param isEncode - True for encoding, false for decoding.
   */
  private async triggerEncoderTranslation (
    encoder: EncoderBrick,
    isEncode: boolean
  ): Promise<void> {
    // Skip translation if encoder is currently busy
    // As soon as the encoder responds the translation will be repeated when the
    // source content differs
    if (this.getBrickState(encoder, 'busy')) {
      return
    }

    // Mark encoder as busy
    this.setBrickState(encoder, 'busy', true)

    // Collect translation data
    const lowerBucket = this.getBucketIndexForBrick(encoder)
    const source = this.getContent(lowerBucket + (isEncode ? 0 : 1), false)
    const settingsVersion = this.getBrickState(encoder, 'settingsVersion')

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
    this.setBrickState(encoder, 'busy', false)

    // Collect post translation data, buckets may have changed in the meantim
    const postSettingsVersion = this.getBrickState(encoder, 'settingsVersion')
    const postLowerBucket = this.getBucketIndexForBrick(encoder)
    const postSourceBucket = postLowerBucket + (isEncode ? 0 : 1)
    const postSource = this.getContent(postSourceBucket, false)
    const resultBucket = postLowerBucket + (isEncode ? 1 : 0)

    // Check if the currently selected bucket has been relocated in the opposite
    // encoding direction in the meantime
    if ((isEncode && this.selectedBucket >= resultBucket) ||
        (!isEncode && this.selectedBucket <= resultBucket)) {
      // Trigger translation in the opposite direction
      this.triggerEncoderTranslation(encoder, !isEncode)
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
      this.triggerEncoderTranslation(encoder, isEncode)
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
   * @param brick
   * @param key
   * @throws {Error} Throws an error if given brick is not part of the pipe.
   */
  private getBrickState (brick: Brick, key: string): any {
    const index = this.bricks.indexOf(brick)
    if (index === -1) {
      throw new Error(`Brick is not part of the pipe and thus has no state.`)
    }
    return this.brickState[index][key]
  }

  /**
   * Updates the current state on given brick.
   * @param brick
   * @param key
   * @param value
   */
  private setBrickState (brick: Brick, key: string, value: any) {
    const index = this.bricks.indexOf(brick)
    if (index === -1) {
      throw new Error(`Brick is not part of the pipe and thus has no state.`)
    }
    this.brickState[index][key] = value
    return this
  }

  /**
   * Returns true if at least one of the bricks is busy.
   */
  isBusy (): boolean {
    return this.bricks.reduce((busy, brick) =>
      busy || this.getBrickState(brick, 'busy'), false)
  }

  /**
   * Returns lower bucket index for given brick.
   * @param brick - Target brick
   * @throws {Error} Throws an error if brick is not part of pipe.
   */
  getBucketIndexForBrick (brick: Brick): number {
    // The bucket index is equal to the amount of
    // encoder bricks placed before given brick
    let foundBrick = false
    let encoderBrickCount = 0
    let i = -1

    while (!foundBrick && ++i < this.bricks.length) {
      if (this.bricks[i] === brick) {
        foundBrick = true
      } else if (this.bricks[i] instanceof EncoderBrick) {
        encoderBrickCount++
      }
    }

    if (!foundBrick) {
      throw new Error(`Can't find bucket for brick. Brick is not part of Pipe.`)
    }
    return encoderBrickCount
  }

  /**
   * Returns an object containing the lower and upper encoder as well as the
   * viewers attached to the given bucket.
   * @param bucket - Bucket index
   */
  getBricksAttachedToBucket (bucket: number): object {
    let lowerEncoder = null
    let upperEncoder = null
    const viewers = []

    let encoderCount = 0
    let i = -1
    let brick

    while (++i < this.bricks.length && encoderCount <= bucket) {
      brick = this.bricks[i]
      if (brick instanceof EncoderBrick) {
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
   * @param viewer - Sender viewer
   * @param content
   */
  viewerContentDidChange (viewer: ViewerBrick, content: Chain): void {
    // Ignore events from bricks that are not part of the pipe
    if (!this.containsBrick(viewer)) {
      return
    }
    const bucket = this.getBucketIndexForBrick(viewer)
    this.setContent(content, bucket, viewer)
  }

  /**
   * Delegate method triggered by child bricks when they change visibility.
   * @param brick - Brick which changed visibility
   * @param hidden - Wether brick is now hidden
   */
  brickVisibilityDidChange (brick: Brick, hidden: boolean): void {
    this.updateView()
  }

  /**
   * Delegate method triggered by child bricks when their settings changed.
   * @param brick - Sender brick
   */
  brickSettingDidChange (brick: Brick): void {
    // Ignore events from bricks that are not part of the pipe
    if (!this.containsBrick(brick)) {
      return
    }

    // Increase brick settings version
    this.setBrickState(
      brick,
      'settingsVersion',
      this.getBrickState(brick, 'settingsVersion') + 1
    )

    if (brick instanceof EncoderBrick) {
      // Trigger encode or decode depending on location of the selected bucket
      const lowerBucket = this.getBucketIndexForBrick(brick)
      const isEncode = this.selectedBucket <= lowerBucket
      this.triggerEncoderTranslation(brick, isEncode)
    } else if (brick instanceof ViewerBrick) {
      // Trigger view
      this._triggerViewerView(brick)
    }

    this.pushUndoHistoryAction('settings')
  }

  /**
   * Delegate method triggered by child bricks when they got reversed.
   * @param brick - Sender brick
   * @param reverse - Wether to reverse translation
   */
  encoderDidReverse (brick: EncoderBrick, reverse: boolean): void {
    if (
      this.bricks.length === 3 &&
      this.bricks[0] instanceof ViewerBrick &&
      this.bricks[1] instanceof EncoderBrick &&
      this.bricks[2] instanceof ViewerBrick
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

    this.pushUndoHistoryAction('settings')
  }

  /**
   * Triggered when a brick finishes a task.
   * @param brick - Brick that just finished the task
   * @param error - Error occured during task.
   */
  brickDidFinish (brick: Brick, error?: Error): void {
    if (!this.isBusy()) {
      // The pipe has just finished all its tasks, notify each content listener
      this.bucketListeners.map((listeners, bucket) => {
        listeners.forEach(listener =>
          error !== undefined
            ? listener.resolve(this.getContent(bucket, false))
            : listener.reject(error))
        return []
      })
    }
  }

  /**
   * Triggered when brick view replace button has been clicked.
   * @param brick
   */
  async brickReplaceButtonDidClick (brick: Brick) {
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
      if (brick instanceof EncoderBrick &&
          replacement instanceof EncoderBrick) {
        // Apply the same reverse state on the replacement brick
        replacement.setReverse(brick.isReverse())
      }
      this.replaceBrick(brick, replacement)
    }
  }

  /**
   * Triggered when view add button has been clicked.
   * @param index - Add button index
   */
  protected async viewAddButtonDidClick (index: number): Promise<void> {
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
   * Triggered when a brick's view is being dragged.
   * @param brick - Sender brick
   */
  brickDragStart (brick: Brick): void {
    for (let i = 0; i < this.bricks.length; i++) {
      this.setBrickState(this.bricks[i], 'dragging', this.bricks[i] === brick)
    }
  }

  /**
   * Triggered when a brick's view is no longer being dragged.
   * @param brick - Sender brick
   */
  brickDragEnd (brick: Brick): void {
    for (let i = 0; i < this.bricks.length; i++) {
      this.setBrickState(this.bricks[i], 'dragging', false)
    }
  }

  /**
   * Triggered when the user is dragging something onto the pipe.
   * @param event - Drag event
   * @returns Wether the drag should be accepted
   */
  private viewDidDragEnter (event: React.DragEvent<HTMLElement>): boolean {
    // Check if brick mime type is among the drop types
    const types = event.dataTransfer.types
    if (types.contains !== undefined) {
      // In Edge, types is a DOMStringList
      return types.contains('application/vnd.cryptii.brick+json')
    }
    return types.indexOf('application/vnd.cryptii.brick+json') !== -1
  }

  /**
   * Triggered when something is dropped onto the pipe.
   * @param index - Index at which the brick has been dropped
   * @param event - Drop event
   */
  private viewDidDragDrop (
    index: number,
    event: React.DragEvent<HTMLElement>
  ): void {
    // Find a brick instance that is currently being dragged inside the pipe
    let brick =
      this.bricks.find(brick => this.getBrickState(brick, 'dragging') === true)

    if (brick !== undefined) {
      // Copy or move brick depending on transfer effect
      if (event.dataTransfer.effectAllowed === 'copy') {
        this.copyBrick(brick, index)
      } else {
        this.moveBrick(brick, index)
      }

      // Clear dragging state
      this.brickDragEnd(brick)
    } else {
      // Parse transfer data (unsafe data)
      const brickData = JSON.parse(event.dataTransfer.getData('application/vnd.cryptii.brick+json'))

      // Create Brick instance and inject it
      brick = this.getBrickFactory().create(brickData)
      this.spliceBricks(index, 0, [brick])
    }

    this.pushUndoHistoryAction('bricks')
  }

  /**
   * Triggered when a hidden brick group has been clicked.
   * @param bricks - Array of bricks in group
   */
  protected viewHiddenBrickGroupDidClick (bricks: Brick[]): void {
    // Make bricks in this collapsed group visible
    bricks.forEach(brick => brick.setHidden(false))
    // Track action
    EventManager.trigger('pipeHiddenBrickGroupClick', { pipe: this, bricks })
  }

  /**
   * Stores this pipe using the backend service.
   */
  async store (): Promise<string> {
    const data = await this.getService().storePipe(this)
    return data.url
  }

  /**
   * Undo last user action
   */
  undo (): void {
    const data = this.undoHistory.undo()
    if (data !== undefined) {
      this.extract(JSON.parse(data))
    }
  }

  /**
   * Redo last undone action
   */
  redo (): void {
    const data = this.undoHistory.redo()
    if (data !== undefined) {
      this.extract(JSON.parse(data))
    }
  }

  /**
   *
   * Push user action onto the undo history stack.
   * @param action - Action string
   */
  private pushUndoHistoryAction (action: string): void {
    this.undoHistory.push(action, JSON.stringify(this.serialize()))
    this.updateView()
  }

  /**
   * Serializes pipe to make it JSON serializable
   * @returns Structured data
   */
  serialize (): any {
    const data: any = {}

    // Pipe meta
    if (this.url !== undefined) {
      data.url = this.url
    }

    // Items
    data.items = this.bricks.map(brick => brick.serialize())

    // Content
    const bucket = this.selectedBucket
    const content = this.bucketContent[bucket]

    if (!content.isEmpty() || bucket > 0) {
      data.content = content.serialize()

      // Calculate content injection index
      const { lowerEncoder } = this.getBricksAttachedToBucket(bucket)
      if (lowerEncoder !== null) {
        data.contentIndex = this.bricks.indexOf(lowerEncoder) + 1
      }
    }

    return data
  }

  /**
   * Extracts Pipe from structured data.
   * @param data - Structured data
   * @throws {Error} Throws an error if structured data is malformed.
   */
  extract (data: any): void {
    // Verify unsafe Pipe data
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error(
        'Pipe property \'items\' is expected to be an array that is not empty')
    }
    if (data.url && typeof data.url !== 'string') {
      throw new Error(
        'Optional pipe property \'url\' is expected to be of type string')
    }
    if (data.content === undefined) {
      throw new Error(
        'Pipe property \'content\' is required')
    }
    if (data.contentIndex !== undefined && typeof data.contentIndex !== 'number') {
      throw new Error(
        'Optional pipe property \'contentIndex\' is expected to be a number')
    }

    // Clear Bricks to prevent old content from flowing around
    this.spliceBricks(0, this.bricks.length)

    // Create Brick instances
    const factory = this.getBrickFactory()
    this.addBricks(data.items.map(factory.create.bind(factory)) as Brick[])
    this.setUrl(data.url ? data.url : undefined)

    // Extract content
    const content = Chain.extract(data.content)

    // Extract bucket index to inject content in
    let bucket = 0
    const contentIndex = data.contentIndex || 0
    if (contentIndex === this.getLength()) {
      bucket = this.getBucketCount() - 1
    } else if (contentIndex >= 0 && contentIndex < this.getLength()) {
      bucket = this.getBucketIndexForBrick(this.getBrick(contentIndex))
    } else {
      throw new Error(
        'Optional pipe property \'contentIndex\' is out of range')
    }

    // Inject content
    this.setContent(content, bucket, this)

    // Initial undo history state
    if (this.undoHistory.current() === undefined) {
      this.pushUndoHistoryAction('initial')
    }
  }
}
