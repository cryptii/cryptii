import '../style/index.scss'
import App from './App.js'
import EnvUtil from './EnvUtil.js'

export { App }
export { EnvUtil }

export { default as ArrayUtil } from './ArrayUtil'
export { default as Brick } from './Brick'
export { default as BrickFactory } from './Factory/Brick'
export { default as ByteEncoder } from './ByteEncoder'
export { default as ByteEncodingError } from './Error/ByteEncoding'
export { default as Chain } from './Chain'
export { default as Encoder } from './Encoder'
export { default as EventManager } from './EventManager'
export { default as Factory } from './Factory'
export { default as Field } from './Field'
export { default as FieldFactory } from './Factory/Field'
export { default as Form } from './Form'
export { default as GenericError } from './GenericError'
export { default as InvalidInputError } from './Error/InvalidInput'
export { default as LibraryModalView } from './View/Modal/Library'
export { default as MathUtil } from './MathUtil'
export { default as ModalView } from './View/Modal'
export { default as Pipe } from './Pipe'
export { default as Random } from './Random'
export { default as StringUtil } from './StringUtil'
export { default as TextEncoder } from './TextEncoder'
export { default as TextEncodingError } from './Error/TextEncoding'
export { default as View } from './View'
export { default as Viewable } from './Viewable'
export { default as Viewer } from './Viewer'

// Check if we are running in the browser and if the init flag is set
if (EnvUtil.isBrowser() &&
    document.querySelector('script[data-cryptii-config]') !== null) {
  // Define app initialization in the browser
  const init = () => {
    // Read optional pipe content
    const $pipeData = document.querySelector('script[data-cryptii-pipe]')
    const pipeData = $pipeData !== null ? JSON.parse($pipeData.innerHTML) : null

    // Read optional app config
    const $config = document.querySelector('script[data-cryptii-config]')
    const config = $config !== null ? JSON.parse($config.innerHTML) : {}

    // Configure app and bootstrap it
    const app = new App(config)
    app.run(pipeData)
  }

  // Trigger initialization when the DOM is ready
  if (document.readyState !== 'loading') {
    init()
  } else {
    window.addEventListener('DOMContentLoaded', init)
  }
}
