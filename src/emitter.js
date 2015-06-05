/** @desc Simple pub/sub pattern class */
export default class Emitter {
  constructor () {
    this.events = []
  }
  /** @desc Subscribe to event. */
  on (name, cb) {
    (this.events[name] = this.events[name] || []).push(cb)
    return this
  }
  /** @desc Notify subscribers. */
  notify (name, obj) {
    (this.events[name] || []).forEach((event) => event.call(this, obj))
    return this
  }
}
