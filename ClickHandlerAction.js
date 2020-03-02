class ClickHandlerAction {
  constructor(config) {
    this.actionType = config.actionType;
    this.ref = config.ref;
    this.statement = config.statement;
    this.componentMethod = config.componentMethod;
  }
}

module.exports = ClickHandlerAction;
