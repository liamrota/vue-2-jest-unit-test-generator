const ClickHandlerTest = require('../ClickHandlerTest.js');
const ClickHandlerAction = require('../ClickHandlerAction.js');
const ClickHandlerActionTypes = require('../ClickHandlerActionTypes.js');

describe('ClickHandlerTest', () => {
  it('Generates correct boolean inversion click test from ClickHandlerAction instance', () => {
    const clickHandlerAction = new ClickHandlerAction({
      actionType: ClickHandlerActionTypes.BooleanInversion,
      ref: 'bool-invert-ref',
      statement: 'myVar = !myVar'
    });
    const clickHandlerTest = new ClickHandlerTest({componentName: 'notImportant', clickHandlerAction});
    const testContent = clickHandlerTest.generateTest();
    const expectedTestContent = [
    `\r\n\t test('${clickHandlerAction.ref} button inverts myVar boolean value on click', () => {`,
    `\t\twrapper = mount(${clickHandlerTest.componentName});`,
    `\t\tconst btn = wrapper.find({ref: '${clickHandlerAction.ref}'});`,
    `\t\tlet initialValue = wrapper.vm.myVar;`,
    `\t\tbtn.trigger('click');`,
    `\t\texpect(wrapper.vm.myVar).toBe(!initialValue);`,
    `\t});`
    ].join("\r\n");
    expect(testContent).toBe(expectedTestContent);

  });
});