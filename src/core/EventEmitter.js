export default class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }
  on(eventName, callback) {
    if (typeof callback !== 'function')
      throw new TypeError('O callback do evento é inválido.');
    if (!this.listeners.has(eventName))
      this.listeners.set(eventName, new Set());
    this.listeners.get(eventName).add(callback);
    return () => this.off(eventName, callback);
  }
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (...args) => {
      unsubscribe();
      callback(...args);
    });
    return unsubscribe;
  }
  off(eventName, callback) {
    const callbacks = this.listeners.get(eventName);
    if (!callbacks) return this;
    callbacks.delete(callback);
    if (callbacks.size === 0) this.listeners.delete(eventName);
    return this;
  }
  emit(eventName, ...args) {
    const callbacks = this.listeners.get(eventName);
    if (!callbacks) return false;
    for (const callback of [...callbacks]) callback(...args);
    return true;
  }
  clear(eventName = null) {
    eventName === null
      ? this.listeners.clear()
      : this.listeners.delete(eventName);
    return this;
  }
}
