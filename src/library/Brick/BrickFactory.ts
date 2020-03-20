
import Brick from './Brick'
import PlaceholderBrick from './PlaceholderBrick'
import TextBrick from '../../bricks/text/index'

/**
 * Factory class tasked with importing and instantiating brick instances.
 */
export default class BrickFactory {
  /**
   * Static shared instance
   */
  private static sharedInstance?: BrickFactory

  /**
   * Object mapping names directly or to promises of brick constructables that
   * are fulfilled once the import has been completed. Constructables set
   * initially are imported directly to make Webpack add them to the main bundle
   * instead of creating separate ones.
   */
  private namedConstructables: { [index: string] : Promise<any> | any } = {
    text: TextBrick,
  }

  /**
   * Creates a new Brick instance from the given name or serialized Brick data.
   * Either returns the final Brick instance, if already loaded, or a
   * placeholder Brick pre-configured to be resolved to the final brick.
   * @param nameOrData - Brick name or serialized brick data
   * @throws {Error} If brick module has not been imported
   * @returns Newly created brick instance
   */
  create (nameOrData: string | any): Brick {
    // Resolve and verify brick data
    const data = typeof nameOrData === 'string'
      ? { name: nameOrData }
      : nameOrData

    if (typeof data.name !== 'string') {
      throw new Error(`Brick property 'name' is expected to be of type string`)
    }

    // When Brick has not been loaded, yet, create placeholder brick insetad
    const constructable = this.namedConstructables[data.name]
    const brick = this.isLoaded(data.name)
      ? new constructable()
      : new PlaceholderBrick()

    brick.extract(data)
    brick.prepare(this)
    return brick
  }

  /**
   * Loads a new brick instance for the given name or serialized data.
   * @param nameOrData - Brick name or serialized brick data
   * @throws {Error} If brick module cannot be loaded
   * @returns Promise that resolves to the newly created brick instance
   */
  async loadAndCreate (nameOrData: string | any): Promise<Brick> {
    // Resolve and verify brick data
    const data = typeof nameOrData === 'string'
      ? { name: nameOrData }
      : nameOrData

    if (typeof data.name !== 'string') {
      throw new Error(`Brick property 'name' is expected to be of type string`)
    }

    const name = data.name

    // Check wether this brick has already been requested
    if (this.namedConstructables[name] === undefined) {
      // Try to dynamically import the requested brick constructable
      // Let Webpack create lazy-loadable chunks for each brick target
      // Storing the promise like this prevents race conditions
      this.namedConstructables[name] = import(
        /* webpackMode: "lazy" */
        `../../bricks/${name}/index`
      )
        .then(module => {
          // Unwrap Brick constructable from module container
          return module.default
        })
        .then(constructable => {
          // Prepare static Brick type, e.g. it may depend on other Bricks
          constructable.prepare(this)
          return constructable
        })
        .then(constructable => {
          // Replace the promise by the value it resolved to to allow for
          // synchronous Brick instance creation if the same Brick type is
          // requested again
          this.namedConstructables[name] = constructable
        })
        .catch(error => {
          // Allow retrying by clearing the stored promise
          this.namedConstructables[name] = undefined
          // The loading error still needs to be handled by the caller
          throw error
        })
    }

    // Wait for the brick constructable to be imported
    // (may take a while due to network requests)
    await this.namedConstructables[name]

    // Safely create new brick instance using the synchronous create method
    return this.create(nameOrData)
  }

  /**
   * Returns true if the Brick for the given name has finished loading.
   * If so it may be safely instantiated synchronously using the create method.
   * @param name - Brick name
   */
  isLoaded (name: string): boolean {
    const constructable = this.namedConstructables[name]
    return constructable !== undefined && !(constructable instanceof Promise)
  }

  /**
   * Duplicates the given brick to a new instance synchronously.
   * @param brick - Brick to be duplicated
   * @returns The newly created brick instance
   */
  duplicate (brick: Brick): Brick {
    return this.create(brick.serialize())
  }

  /**
   * Register brick constructable to specified name.
   * @param name - Brick name
   * @param constructable - Brick constructable
   * @throws If the given name has already been assigned to a brick.
   */
  register (name: string, constructable: any): void {
    if (this.namedConstructables[name] !== undefined) {
      throw new Error(`Name '${name}' has already been assigned to a brick.`)
    }
    this.namedConstructables[name] = constructable
  }

  /**
   * Lazily creates a shared BrickFactory instance and returns it.
   * @returns Shared BrickFactory instance
   */
  static getSharedInstance (): BrickFactory {
    if (this.sharedInstance === undefined) {
      this.sharedInstance = new BrickFactory()
    }
    return this.sharedInstance
  }
}
