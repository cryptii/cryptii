
/**
 * Class storing and managing undo history
 */
export default class UndoHistory<T> {
  /**
   * Action state stack
   */
  private stack: T[] = []

  /**
   * Index pointing at the current state.
   */
  private index: number = -1

  /**
   * Stack limit
   */
  private limit: number = 50

  /**
   * Repeating action limit
   */
  private actionLimit: number = 2

  /**
   * Last action
   */
  private lastAction?: string

  /**
   * How often the last action was repeated
   */
  private lastActionCount: number = 0

  /**
   * Pushes a new action ontop of the stack.
   * @param action - Action type used for throttling (e.g. typing, formatting)
   * @param state - New state
   */
  push (action: string, state: T): void {
    // Count repeating actions
    if (action === this.lastAction) {
      this.lastActionCount++
    } else {
      this.lastAction = action
      this.lastActionCount = 1
    }

    // If repeating action count surpasses the limit, replace the last action
    const replace = this.lastActionCount > this.actionLimit

    // Pop redo part of the stack, if any
    const popIndex = replace ? this.index : this.index + 1
    while (popIndex !== -1 && popIndex < this.stack.length) {
      this.stack.pop()
    }

    // Push new state to the stack and update index
    this.stack.push(state)

    // Shift stack to fit inside the stack limit
    if (this.stack.length > this.limit) {
      this.stack.shift()
    }

    // Update index
    this.index = this.stack.length - 1
  }

  /**
   * Returns the current state.
   */
  current (): T | undefined {
    return this.stack.length === 0 ? undefined : this.stack[this.index]
  }

  /**
   * Wether undo is possible.
   * @returns True, if undo is possible.
   */
  canUndo (): boolean {
    return this.index > 0
  }

  /**
   * Undoes last action and returns the new state.
   * @returns New state
   */
  undo (): T | undefined {
    if (this.canUndo()) {
      this.index--
      return this.current()
    }
    return undefined
  }

  /**
   * Wether redo is possible.
   * @returns True, if redo is possible.
   */
  canRedo (): boolean {
    return this.index < this.stack.length - 1
  }

  /**
   * Redoes last action and returns the new state.
   * @returns New state
   */
  redo (): T | undefined {
    if (this.canRedo()) {
      this.index++
      return this.current()
    }
    return undefined
  }
}
