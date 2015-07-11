export default class Emitter {
  constructor () {
    this.events = []
  }
  /**
   * Subscribe to event.
   * @param {String} name of event to observe
   * @param {Function} handler
   */
  on (name, cb) {
    (this.events[name] = this.events[name] || []).push(cb)
    return this
  }
  /**
   * Notify subscribers.
   * @param {String} name of event to emit
   * @param {Object} data to send
   */
  notify (name, obj) {
    (this.events[name] || []).forEach((event) => event.call(this, obj))
    return this
  }
}
