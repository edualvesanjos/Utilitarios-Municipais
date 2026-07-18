export default class Storage {
  constructor(namespace = 'app') {
    this.namespace = namespace;
  }
  buildKey(key) {
    return `${this.namespace}:${key}`;
  }
  set(key, value) {
    localStorage.setItem(this.buildKey(key), JSON.stringify(value));
    return value;
  }
  get(key, fallback = null) {
    const serialized = localStorage.getItem(this.buildKey(key));
    if (serialized === null) return fallback;
    try {
      return JSON.parse(serialized);
    } catch {
      return fallback;
    }
  }
  has(key) {
    return localStorage.getItem(this.buildKey(key)) !== null;
  }
  remove(key) {
    localStorage.removeItem(this.buildKey(key));
    return this;
  }
  clear() {
    const prefix = `${this.namespace}:`;
    const keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
    return this;
  }
}
