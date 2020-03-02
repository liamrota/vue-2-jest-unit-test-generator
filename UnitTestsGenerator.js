const ClickHandlerActionTypes = require('./ClickHandlerActionTypes.js');
const ClickHandlerTest = require('./ClickHandlerTest.js');

const BoilerplateTestLines = [
`import { mount } from '@vue/test-utils';`,
`import #ComponentName# from '../#ComponentName#';`,
`let wrapper;`,
`describe('#ComponentName#', () => {`,
  `\tbeforeEach(() => {`,
    `\t\twrapper = mount(#ComponentName#);`,
  `\t});`,
  `\tit('Is a Vue instance', () => {`,
    `\t\texpect(wrapper.isVueInstance()).toBeTruthy();`,
  `\t});`,
  `\tit('Matches snapshot', () => {`,
    `\t\texpect(wrapper.element).toMatchSnapshot();`,
  `\t});`,
`\t #FurtherTests#`,
`});`
];

const UnitTestFileBoilerplateKeys = {
  ComponentName: '#ComponentName#',
  FurtherTests: '#FurtherTests#'
};

class UnitTestsGenerator {
  constructor(config)  {
    // Takes a ComponentFile class instance:
    this.componentFile = config.componentFile;
    this.componentName = config.componentName;
    this.unitTestFileLines = BoilerplateTestLines;
  }

  generate() {
    // replace #ComponentName# placeholder with actual component name
    this.unitTestFileLines = this.unitTestFileLines
      .map(line => {
        const regex = new RegExp(UnitTestFileBoilerplateKeys.ComponentName, "g");
        return line.replace(regex, this.componentName);
      });

      let testFileContent = this.unitTestFileLines.join("\r\n");
      let furtherTests = this.clickHandlerTests;
      testFileContent = testFileContent
        .replace(UnitTestFileBoilerplateKeys.FurtherTests, furtherTests);
      return testFileContent;
  }
  
  get clickHandlerTests() {
    // componentFile instance should have a clickHandlerActions prop with ClickHandlerAction instances
    return this.componentFile.clickHandlerActions
      .map(clickHandlerAction => {
        const clickHandlerTest = new ClickHandlerTest({
          componentName: this.componentName,
          clickHandlerAction
        });
        return clickHandlerTest.generateTest();
       })
      .join("\r\n");
  }

  get changeHandlerTests() {
    // look for @change events
    return '';
  }
  get onMountedTests() {
    // e.g. does the component do something after it mounts
  }
}

module.exports = UnitTestsGenerator;

