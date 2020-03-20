
import App from './library/App'
import EnvUtil from './library/Util/EnvUtil'

// Import styles
import '../styles/index.scss';

export { App }
export { EnvUtil }

// Libraries
export { default as ArrayUtil } from './library/Util/ArrayUtil'
export { default as Base64Encoder } from './library/Encoder/Base64Encoder'
export { default as BinaryEncoder } from './library/Encoder/BinaryEncoder'
export { default as Brick } from './library/Brick/Brick'
export { default as BrickFactory } from './library/Brick/BrickFactory'
export { default as Chain } from './library/Chain'
export { default as EncoderBrick } from './library/Brick/EncoderBrick'
export { default as EncoderError } from './library/Encoder/EncoderError'
export { default as EventManager } from './library/EventManager'
export { default as Field } from './library/Field/Field'
export { default as FieldFactory } from './library/Field/FieldFactory'
export { default as Form } from './library/Form'
export { default as GenericError } from './library/Error/GenericError'
export { default as InvalidInputError } from './library/Error/InvalidInputError'
export { default as MathUtil } from './library/Util/MathUtil'
export { default as Pipe } from './library/Pipe'
export { default as Random } from './library/Random'
export { default as StringUtil } from './library/Util/StringUtil'
export { default as UnicodeEncoder } from './library/Encoder/UnicodeEncoder'
export { default as UTF8Encoder } from './library/Encoder/UTF8Encoder'
export { default as Viewable } from './library/Viewable'
export { default as ViewerBrick } from './library/Brick/ViewerBrick'

/**
 * The browser entry point
 */
(async () => {
  // Check if we are running in the browser and if the root element is set
  const rootElement = document.querySelector('[data-cryptii-root]')
  if (EnvUtil.isBrowser() && rootElement !== null) {
    // Define app initialization in the browser
    const init = () => {
      // Read optional pipe content
      const pipeDataElement = document.querySelector('script[data-cryptii-pipe]')
      const pipeData = pipeDataElement !== null
        ? JSON.parse(pipeDataElement.innerHTML)
        : null

      // Read optional app config
      const configElement = document.querySelector('script[data-cryptii-config]')
      const config = configElement !== null
        ? JSON.parse(configElement.innerHTML)
        : {}

      // Configure Webpack public path
      if (config.publicPath !== undefined) {
        __webpack_public_path__ = config.publicPath
      }

      // Configure app and bootstrap it
      const app = new App(config, rootElement)
      app.run(pipeData)
    }

    // Trigger initialization when the DOM is ready
    if (document.readyState !== 'loading') {
      init()
    } else {
      window.addEventListener('DOMContentLoaded', init)
    }
  }
})()
