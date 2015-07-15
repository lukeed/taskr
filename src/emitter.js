export default class Emitter {
  constructor () { this.events = [] }
  /**
   * Listen to an event.
   * @param {String} name of event to observe
   * @param {Function} handler
   */
  on (name, cb) {
    (this.events[name] = this.events[name] || []).push(cb)
    return this
  }
  /**
   * Emit an event to listeners.
   * @param {String} name of event to emit
   * @param {Object} data to send
   */
  emit (name, obj) {
    (this.events[name] || []).forEach((event) => event.call(this, obj))
    return this
  }
}
