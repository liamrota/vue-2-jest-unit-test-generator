const fs = require('fs');
const ClickHandlerActionTypes = require('./ClickHandlerActionTypes.js');
const ClickHandlerAction = require('./ClickHandlerAction.js');
const ComponentMethod = require('./ComponentMethod');

class ComponentFile {
  constructor(config) {
    this.fileContent = config.fileContent;
    this.componentName = config.componentName;
    this._fileLines = [];
    this._clickHandlerActions = [];
  }

  get fileLines() {
    if (this._fileLines.length > 0) {
      return this._fileLines;
    }
    this._fileLines = this.fileContent.split("\r\n");
    return this._fileLines;
  }

  get clickHandlerActions() {
    const clickHandlerActions = [];
    this.fileLines.forEach((line, index) => {
      if (line.includes('@click')) {
         const ref = this.getElementRefValue(this.fileLines, index);
         if (!ref) {
          console.info('Could not deal with following line as it does not have a ref attribute: \n',
            'line ' + (index + 1) + ':', line.trim(), '\n');
          return;
        }
        const statement = this.getClickHandlerActionStatement(line);
        const actionType = this.getClickHandlerActionType(line);
        let componentMethod;
        if (actionType === ClickHandlerActionTypes.MethodCall) {
          // hm. how to match click handler statements with method objects?
          componentMethod = this.methods.find(method => method.name === statement);
        }
        clickHandlerActions.push(new ClickHandlerAction({
          actionType,
          ref,
          statement,
          componentMethod
        }));
      }
    });
    return clickHandlerActions;
  }

  getClickHandlerActionStatement(line = '') {
    // e.g. for '@click="asdf = true"', will return 'asdf = true'
    const clickStartingIndex = line.indexOf('@click');
    const firstQuoteIndex = line.substring(clickStartingIndex, line.length).indexOf("\"") + clickStartingIndex;
    const fromFirstQuoteToEndOfLine = line.substring(firstQuoteIndex, line.length);
    const secondQuoteIndex = fromFirstQuoteToEndOfLine.substring(1, fromFirstQuoteToEndOfLine.length)
      .indexOf("\"") +  firstQuoteIndex + 1; 
    const clickActionStatement = line.substring(firstQuoteIndex + 1, secondQuoteIndex);
    return clickActionStatement;
  }

  getClickHandlerActionType(line) {
    // i.e is a click handler inverting a bool, or calling a method or emitting an event?
    const clickAction = this.getClickHandlerActionStatement(line);
     if (clickAction.includes(";")) {
      console.info('Will not process following line as its inline handler contains a semicolon');
      console.log(line);
      console.info('If you are trying to do more than one thing inside an inline click handler, don\'t.');
      console.info('Extract statements to a function\n');
      return ClickHandlerActionTypes.Unknown;
    }
    if (clickAction.includes("$emit")) {
      return ClickHandlerActionTypes.Emission;
    } else if (clickAction.split(" ").length === 1) {
      return ClickHandlerActionTypes.MethodCall; 
    } else if (clickAction.includes("=")) {
      const firstCharOfSecondWord = clickAction.split("=")[1].trim()[0];
      if (firstCharOfSecondWord === '!') {
        return ClickHandlerActionTypes.BooleanInversion;
      } else {
        return ClickHandlerActionTypes.PropSet;
      }
    } else {
      return ClickHandlerActionTypes.Unknown;
    }

  }

  getElementRefValue(lines = [], startingIndex = 0) {
    // For a button element, which could be over several lines..
    // e.g. <button
    //        class="whatever"
    //        ref="myBtn"
    //      >
    //        Submit
    //      </button>
    // find the ref attribute value

    // === Implementation ===
    // ======================================================
    // March back up from startingIndex til you hit a '<',
    // then march back down til you hit a '>', 
    // creating new left side component lines array as you go.
    // Once whole left side of element is added to array,
    // find the ref attribute value
    // =======================================================
    const leftSideComponentLines = [];
    let openingAngleBracketFound = false;
    let currentLineIndex = startingIndex;
    while (!openingAngleBracketFound) {
      openingAngleBracketFound = lines[currentLineIndex].includes("<")
      if (!openingAngleBracketFound) {
        currentLineIndex -= 1;
      }
    }
    let closingAngleBracketFound = false;
    while (!closingAngleBracketFound) {
      leftSideComponentLines.push(lines[currentLineIndex]);
      closingAngleBracketFound = lines[currentLineIndex].includes(">");
      if (!closingAngleBracketFound) {
        currentLineIndex += 1;
      }
    }
    const refLine = leftSideComponentLines.find(line => line.includes('ref="'));
    if (refLine) {
      const refAttribute = refLine.split(" ").find(x => x.includes('ref'));
      const ref = refAttribute.split("\"")[1];
      return ref;
    } else {
      return '';
    }
  }

  get methods() {
    // this.fileLines
    const methods = [];
    const methodsStartingLineIndex = this.fileLines
      .findIndex(x => x.replace(/ /g, '')
      .includes('methods:'));

    if (methodsStartingLineIndex === -1) {
      return methods;
    }
    const getCharCountInString = (ch, str) => str.split('').filter(c => c === ch).length;
    const getOpeningBraceCountInLine = line => getCharCountInString('{', line);
    const getClosingBraceCountInLine = line => getCharCountInString('}', line);

    let unclosedOpeningBraceCount = 0;
    let endOfMethodsReached = false;
    let currentLineIndex = methodsStartingLineIndex;

    while (!endOfMethodsReached) { 
      unclosedOpeningBraceCount += getOpeningBraceCountInLine(this.fileLines[currentLineIndex]);
      unclosedOpeningBraceCount -= getClosingBraceCountInLine(this.fileLines[currentLineIndex]);
  
      if (unclosedOpeningBraceCount === 2) { 
        // you're at the start of a method
        const lineWords = this.fileLines[currentLineIndex].trim().split(' ');
        const isAsync = lineWords[0] === 'async';
        let methodName = isAsync ? lineWords[1] : lineWords[0];
        methodName = methodName.replace(/[{}()]/g, '');
        console.log(methodName);

        const openingParenthesisIndex = this.fileLines[currentLineIndex]
          .split('')
          .findIndex(c => c === '(');
        const closingParenthesisIndex = this.fileLines[currentLineIndex]
          .split('')
          .findIndex(c => c === ')');
        const insideParenthesis = this.fileLines[currentLineIndex]
          .substring(openingParenthesisIndex + 1, closingParenthesisIndex)
        let parameters = [];
        if (insideParenthesis.length) {
          parameters = insideParenthesis.split(',');
        }

        let endOfMethodReached = false;
        const bodyLines = [];
        while(!endOfMethodReached) {
          currentLineIndex += 1;
          unclosedOpeningBraceCount += getOpeningBraceCountInLine(this.fileLines[currentLineIndex]);
          unclosedOpeningBraceCount -= getClosingBraceCountInLine(this.fileLines[currentLineIndex]);
          endOfMethodReached = unclosedOpeningBraceCount === 1;
          if (!endOfMethodReached) {
            const line = this.fileLines[currentLineIndex].trim();
            if (line.length) {
              bodyLines.push(line);
            }
          }
        }
        methods.push(new ComponentMethod({
          name: methodName,
          bodyLines,
          isAsync,
          parameters
        }));
      }

      currentLineIndex += 1;
      endOfMethodsReached = unclosedOpeningBraceCount === 0;
    }
    return methods;
    
  }
}

module.exports = ComponentFile;
