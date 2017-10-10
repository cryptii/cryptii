
/**
 * Analytics wrapper providing static methods for event tracking.
 */
export default class Analytics {
  /**
   * Tracks an event. Forwards event to gtag lib, if available.
   * @see https://developers.google.com/analytics/devguides/collection/gtagjs/events
   * @param {string} name
   * @param {object} [parameters]
   * @return {Analytics} Fluent interface
   */
  static trackEvent (name, parameters = {}) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, parameters)
    }
    return this
  }
}
