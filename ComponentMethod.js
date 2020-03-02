class ComponentMethod {
  constructor(config = {}) {
    this.name = config.name;
    this.parameters = config.parameters;
    this.bodyLines = config.bodyLines;
    this.isAsync = config.isAsync;
  }

}

module.exports = ComponentMethod;
