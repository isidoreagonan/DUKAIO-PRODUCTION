const fs = require('fs');
const ts = require('typescript');

const content = fs.readFileSync('c:/Users/DELL/Desktop/DUKAIO/DUKAIO-PRODUCTION/src/pages/dashboard/CreateProduct.tsx', 'utf8');
const sourceFile = ts.createSourceFile('CreateProduct.tsx', content, ts.ScriptTarget.Latest, true);

function visit(node) {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    const tagName = node.openingElement ? node.openingElement.tagName.getText() : node.tagName.getText();
    if (/^[A-Z]/.test(tagName)) {
      console.log('Component:', tagName);
    }
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);
