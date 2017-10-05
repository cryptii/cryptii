
const stackTraceModuleUrl =
  'https://cdnjs.cloudflare.com/ajax/libs/stacktrace.js/2.0.0/stacktrace.min.js'

const errorReportingApiBaseUrl =
  'https://clouderrorreporting.googleapis.com/v1beta1/projects/'

// singleton instance
let instance = null

/**
 * Singleton class reporting errors to an external service.
 * @see https://github.com/GoogleCloudPlatform/stackdriver-errors-js/
 */
export default class ErrorReporter {
  /**
   * Constructor
   */
  constructor () {
    this._uncaughtErrorReporting = false
    this._errorReporting = false

    // error reporting context
    this._serviceName = null
    this._serviceVersion = null

    // error reporting service config
    this._googleApiKey = null
    this._googleProjectId = null

    // bind error handler
    this._errorHandler = evt => this.reportError(evt.error)
  }

  /**
   * Configures reporter instance.
   * @param {object} config
   * @return {ErrorReporter} Fluent interface
   */
  configure (config) {
    this._serviceName = config.serviceName
    this._serviceVersion = config.serviceVersion

    this._googleApiKey = config.googleApiKey || null
    this._googleProjectId = config.googleProjectId || null

    this.setUncaughtErrorReporting(config.uncaughtErrorReporting || false)
    this.setErrorReporting(config.errorReporting || false)
    return this
  }

  /**
   * Enables or disables error reporting.
   * @param {boolean} errorReporting
   * @return {ErrorReporter}
   */
  setErrorReporting (errorReporting) {
    this._errorReporting = errorReporting
    return this
  }

  /**
   * Registers a global error handler and reports uncaught
   * exceptions if set to true.
   * @param {boolean} errorReporting
   * @return {ErrorReporter}
   */
  setUncaughtErrorReporting (errorReporting) {
    if (this._uncaughtErrorReporting !== errorReporting) {
      this._uncaughtErrorReporting = errorReporting

      if (errorReporting) {
        window.addEventListener('error', this._errorHandler)
      } else {
        window.removeEventListener('error', this._errorHandler)
      }
    }
    return this
  }

  /**
   * Reports an error.
   * @param {Error} error
   * @return {ErrorReporter} Fluent interface
   */
  reportError (error) {
    if (!error || !this._errorReporting) {
      return this
    }

    if (!this._googleApiKey || !this._googleProjectId) {
      throw new Error(`Can't report error, no api key or project id provided.`)
    }

    let firstStackFrame = 0
    if (typeof error === 'string') {
      // transform message in an error to populate stacktrace
      try {
        throw new Error(error)
      } catch (e) {
        error = e
      }

      // omit first stack line, because it will always mention this method
      firstStackFrame = 1
    }

    // collect payload
    let payload = {
      serviceContext: {
        service: this._serviceName,
        version: this._serviceVersion
      },
      message: null,
      context: {
        httpRequest: {
          userAgent: window.navigator.userAgent,
          url: window.location.href
        }
      }
    }

    // prepare payload message
    // lazily require stack trace module
    this.requireStackTrace(StackTrace => {
      // normalize the stack frames using sourcemaps
      StackTrace.fromError(error)
        .then(stack => {
          // compose stack trace
          payload.message = error.toString()
          for (let i = firstStackFrame; i < stack.length; i++) {
            // reconstruct the stackframe to a js stackframe
            // as expected by error reporting parsers
            payload.message +=
              `\n    at ${stack[i].getFunctionName()} ` +
              `(${stack[i].getFileName()}:${stack[i].getLineNumber()}:` +
              `${stack[i].getColumnNumber()})`
          }

          // send payload to service
          this.sendErrorPayload(payload)
        })
        .catch(reason => {
          // failed to normalize stacktrace, fallback
          payload.message =
            `Error extracting stack trace: ${reason}\n` +
            `${error.toString()}\n` +
            `    (${error.file}:${error.line}:${error.column})`

          // send payload to service
          this.sendErrorPayload(payload)
        })
    })

    return this
  }

  /**
   * Sends error payload to service.
   * @private
   * @param {object} payload
   * @return {ErrorReporter} Fluent interface
   */
  sendErrorPayload (payload) {
    let url = errorReportingApiBaseUrl +
      `${this._googleProjectId}/events:report?key=${this._googleApiKey}`

    // post error payload to service
    let xhr = new window.XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8')
    xhr.send(JSON.stringify(payload))
    return this
  }

  /**
   * Lazily loads StackTrace module when needed to normalize stacktrace.
   * @private
   * @see https://www.npmjs.com/package/stacktrace-js
   * @param {function(StackTrace: object): mixed} callback
   * @return {ErrorReporter} Fluent interface
   */
  requireStackTrace (callback) {
    if (window.StackTrace) {
      callback(window.StackTrace)
    } else {
      let $script = document.createElement('script')
      $script.onload = () => callback(window.StackTrace)
      document.querySelector('head').appendChild($script)
      $script.src = stackTraceModuleUrl
    }
    return this
  }

  /**
   * Get reporting singleton instance.
   * @return {ErrorReporter}
   */
  static getInstance () {
    if (instance === null) {
      instance = new ErrorReporter()
    }
    return instance
  }
}
