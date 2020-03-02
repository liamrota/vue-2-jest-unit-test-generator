const ClickHandlerActionTypes = require('./ClickHandlerActionTypes');

class ClickHandlerTest {
  constructor(config) {
    this.componentName = config.componentName;
    this.clickHandlerAction = config.clickHandlerAction;
  }

  generateTest() {
    if (this.clickHandlerAction.actionType === ClickHandlerActionTypes.Unknown) {
      return '';
    }
    const testLines = [
      `\r\n\t test('${this.testName}', () => {`,
      ...this.testBodyLines,
      `\t});`
    ];
    return testLines.join("\r\n");
  }

  get testName() {
    let testName = `${this.clickHandlerAction.ref} button`;
    const statement = this.clickHandlerAction.statement;

    if (this.clickHandlerAction.actionType === ClickHandlerActionTypes.Emission) {
      const eventName = statement
        .substring(statement.lastIndexOf('(') + 1, statement.lastIndexOf(')'))
        .replace(/'/g, '');
      testName += ` emits ${eventName} event`;

    } else if (this.clickHandlerAction.actionType === ClickHandlerActionTypes.PropSet) {
      const propName = statement.split('=')[0].trim();
      const val = statement.split('=')[1].trim();
      testName += ` sets ${propName} to ${val}`;

    } else if (this.clickHandlerAction.actionType === ClickHandlerActionTypes.BooleanInversion) {
      const propName = statement.split('=')[0].trim();
      testName += ` inverts ${propName} boolean value`;

    } else if (this.clickHandlerAction.actionType === ClickHandlerActionTypes.MethodCall) {
      const methodName = statement.replace(/()/g, '');
      testName += ` calls ${methodName}`;
    } 
    return testName += " on click";
  }

  get testBodyLines() {
    const statement = this.clickHandlerAction.statement;
    const testBodyLines = [
      `\t\twrapper = mount(${this.componentName});`,
      `\t\tconst btn = wrapper.find({ref: '${this.clickHandlerAction.ref}'});`,
    ];
    if (this.clickHandlerAction.actionType === ClickHandlerActionTypes.Emission) {
      testBodyLines.push( `\t\tbtn.trigger('click');`);
      const eventName = statement
        .substring(statement.lastIndexOf('(') + 1, statement.lastIndexOf(')'))
        .replace(/'/g, '');
      testBodyLines.push(`\t\texpect(wrapper.emitted('${eventName}')).toBeTruthy();`);

    } else if (this.clickHandlerAction.actionType === ClickHandlerActionTypes.PropSet) {
      const varName = statement.split('=')[0].trim();
      const newVal = statement.split('=')[1].trim();
      testBodyLines.push(`\t\texpect(wrapper.vm.${varName}).not.toBe(${newVal});`);
      testBodyLines.push(`\t\tbtn.trigger('click');`);
      testBodyLines.push(`\t\texpect(wrapper.vm.${varName}).toBe(${newVal});`);

    } else if (this.clickHandlerAction.actionType === ClickHandlerActionTypes.BooleanInversion) {
      const varName = statement.split('=')[0].trim();
      testBodyLines.push(`\t\tlet initialValue = wrapper.vm.${varName};`);
      testBodyLines.push(`\t\tbtn.trigger('click');`);
      testBodyLines.push(`\t\texpect(wrapper.vm.${varName}).toBe(!initialValue);`);

    }
    return testBodyLines;

  }
}

module.exports = ClickHandlerTest;

