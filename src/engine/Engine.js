export default class Engine {
  static instance = null;

  constructor() {
    if (Engine.instance) return Engine.instance;
    Engine.instance = this;

    this.application = 'Utilitários Municipais';
    this.version = '0.1.0';
    this.started = false;
    this.debug = false;
    this.container = null;
    this.config = {
      container: '#app',
      language: 'pt-BR',
      theme: 'light',
      debug: false,
      autoStartModules: [],
    };
    this.state = {};
    this.modules = new Map();
    this.components = new Map();
    this.services = new Map();
    this.events = new Map();
  }

  configure(options = {}) {
    this.config = { ...this.config, ...options };
    this.debug = Boolean(this.config.debug);
    return this;
  }

  getConfig() {
    return structuredClone(this.config);
  }

  setConfig(key, value) {
    this.config[key] = value;
    if (key === 'debug') this.debug = Boolean(value);
    return this;
  }

  async start() {
    if (this.started) return this;
    this.container = document.querySelector(this.config.container);
    if (!this.container)
      throw new Error(`Container '${this.config.container}' não encontrado.`);
    this.state.startedAt = new Date();
    this.started = true;
    await this.initializeServices();
    await this.initializeComponents();
    await this.initializeModules();
    this.emit('engine:start', this);
    this.log('Engine iniciada.');
    return this;
  }

  async initializeServices() {
    for (const service of this.services.values()) {
      if (typeof service.initialize === 'function')
        await service.initialize(this);
    }
    return this;
  }

  async initializeComponents() {
    for (const ComponentClass of this.components.values()) {
      if (typeof ComponentClass.initialize === 'function')
        await ComponentClass.initialize(this);
    }
    return this;
  }

  async initializeModules() {
    for (const moduleName of this.config.autoStartModules)
      await this.openModule(moduleName);
    return this;
  }

  registerService(name, service) {
    this.assertName(name, 'serviço');
    if (!service) throw new TypeError('O serviço informado é inválido.');
    if (this.services.has(name))
      throw new Error(`O serviço '${name}' já está registrado.`);
    this.services.set(name, service);
    this.emit('service:registered', name, service);
    return this;
  }

  getService(name) {
    return this.services.get(name) ?? null;
  }
  getServices() {
    return Array.from(this.services.keys());
  }

  registerComponent(name, ComponentClass) {
    this.assertName(name, 'componente');
    if (typeof ComponentClass !== 'function')
      throw new TypeError('A classe do componente é inválida.');
    if (this.components.has(name))
      throw new Error(`O componente '${name}' já está registrado.`);
    this.components.set(name, ComponentClass);
    this.emit('component:registered', name, ComponentClass);
    return this;
  }

  createComponent(name, options = {}) {
    const ComponentClass = this.components.get(name);
    if (!ComponentClass)
      throw new Error(`Componente '${name}' não encontrado.`);
    return new ComponentClass(options, this);
  }

  registerModule(name, ModuleClass) {
    this.assertName(name, 'módulo');
    if (typeof ModuleClass !== 'function')
      throw new TypeError('A classe do módulo é inválida.');
    if (this.modules.has(name))
      throw new Error(`O módulo '${name}' já está registrado.`);
    this.modules.set(name, {
      name,
      ModuleClass,
      instance: null,
      initialized: false,
      opened: false,
    });
    this.emit('module:registered', name);
    return this;
  }

  async openModule(name, options = {}) {
    const registration = this.modules.get(name);
    if (!registration) throw new Error(`Módulo '${name}' não encontrado.`);
    if (!registration.instance)
      registration.instance = new registration.ModuleClass(this, options);
    if (
      !registration.initialized &&
      typeof registration.instance.initialize === 'function'
    ) {
      await registration.instance.initialize();
      registration.initialized = true;
    }
    if (typeof registration.instance.render === 'function')
      await registration.instance.render();
    registration.opened = true;
    registration.lastOpenedAt = new Date();
    this.emit('module:opened', name, registration.instance);
    return registration.instance;
  }

  async closeModule(name) {
    const registration = this.modules.get(name);
    if (!registration || !registration.opened) return this;
    if (
      registration.instance &&
      typeof registration.instance.destroy === 'function'
    )
      await registration.instance.destroy();
    registration.opened = false;
    registration.lastClosedAt = new Date();
    this.emit('module:closed', name, registration.instance);
    return this;
  }

  setState(key, value) {
    this.state[key] = value;
    this.emit('state:changed', key, value);
    return this;
  }

  getState(key, fallback = undefined) {
    return Object.prototype.hasOwnProperty.call(this.state, key)
      ? this.state[key]
      : fallback;
  }

  removeState(key) {
    delete this.state[key];
    this.emit('state:removed', key);
    return this;
  }

  on(eventName, callback) {
    if (typeof callback !== 'function')
      throw new TypeError('O callback do evento é inválido.');
    if (!this.events.has(eventName)) this.events.set(eventName, []);
    this.events.get(eventName).push({ callback, once: false });
    return this;
  }

  once(eventName, callback) {
    if (typeof callback !== 'function')
      throw new TypeError('O callback do evento é inválido.');
    if (!this.events.has(eventName)) this.events.set(eventName, []);
    this.events.get(eventName).push({ callback, once: true });
    return this;
  }

  off(eventName, callback = null) {
    if (!this.events.has(eventName)) return this;
    if (callback === null) {
      this.events.delete(eventName);
      return this;
    }
    const listeners = this.events
      .get(eventName)
      .filter((listener) => listener.callback !== callback);
    listeners.length === 0
      ? this.events.delete(eventName)
      : this.events.set(eventName, listeners);
    return this;
  }

  emit(eventName, ...args) {
    const listeners = this.events.get(eventName);
    if (!listeners) return this;
    for (const listener of [...listeners]) {
      try {
        listener.callback(...args);
      } catch (error) {
        this.error(`Erro no evento '${eventName}'.`, error);
      }
      if (listener.once) this.off(eventName, listener.callback);
    }
    return this;
  }

  ready(callback) {
    if (typeof callback !== 'function')
      throw new TypeError('O callback de inicialização é inválido.');
    this.started ? callback(this) : this.once('engine:start', callback);
    return this;
  }

  async stop() {
    if (!this.started) return this;
    for (const [name, registration] of this.modules.entries()) {
      if (registration.opened) await this.closeModule(name);
    }
    this.started = false;
    this.state.stoppedAt = new Date();
    this.emit('engine:stop', this);
    return this;
  }

  async restart() {
    await this.stop();
    await this.start();
    return this;
  }

  stats() {
    return {
      application: this.application,
      version: this.version,
      started: this.started,
      modules: this.modules.size,
      components: this.components.size,
      services: this.services.size,
      events: this.events.size,
    };
  }

  assertName(name, entity) {
    if (typeof name !== 'string' || name.trim() === '')
      throw new TypeError(`O nome do ${entity} é obrigatório.`);
  }

  log(...args) {
    if (this.debug) console.log('[ENGINE]', ...args);
  }
  warn(...args) {
    console.warn('[ENGINE]', ...args);
  }
  error(...args) {
    console.error('[ENGINE]', ...args);
  }
}
