const fs = require('fs');
const ComponentFile = require('./ComponentFile.js');
const UnitTestsGenerator = require('./UnitTestsGenerator.js');

const fileArg = process.argv[2];
if (!fileArg)  {
  console.info('No file argument given');
  return;
}
// new a ComponentFile
// new a UnitTestsGenerator, passing in the component file

const componentFileContent = fs.readFileSync(fileArg, 'utf8');
const componentName = fileArg.split(".")[0];

const componentFile = new ComponentFile({fileContent: componentFileContent, componentName});
// componentFile.methods.forEach(x => console.log(x));
const unitTestsGenerator = new UnitTestsGenerator({componentFile, componentName});
componentFile.clickHandlerActions.forEach(x => console.log(x));
// console.log(unitTestsGenerator.generate());
return;


function getFileLines(fileName) {
  try {
    const data = fs.readFileSync(fileName, 'utf8');
    return data.split("\r\n");
  } catch(err) {
    console.error(err);
  }
}

function writeContentToFile(content, filename) {
  try {
    fs.writeFileSync(filename, content);
  } catch (err) {
    console.error(err);
  }
}
