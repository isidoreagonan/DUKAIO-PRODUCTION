const fs = require('fs');

let html = fs.readFileSync('C:\\\\Users\\\\DELL\\\\Downloads\\\\dukaio-landing_1.html', 'utf8');

// Extract CSS
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
let css = styleMatch ? styleMatch[1] : '';

// Scope CSS
css = css.replace(/body\s*\{/g, '.dukaio-landing {');
css = css.replace(/^(\s*)([a-zA-Z0-9_\-\.\:\*\s\,]+)(\s*\{)/gm, (match, p1, p2, p3) => {
  if (p2.includes('@media') || p2.includes('@keyframes') || p2.trim().startsWith(':root')) return match;
  const selectors = p2.split(',').map(s => {
    let sel = s.trim();
    if (sel.startsWith('.dukaio-landing')) return sel;
    if (sel === 'from' || sel === 'to' || sel.endsWith('%')) return sel;
    return '.dukaio-landing ' + sel;
  }).join(', ');
  return p1 + selectors + p3;
});
css = css.replace(/:root\s*\{/g, '.dukaio-landing {');
fs.writeFileSync('src/pages/Landing.css', css);

// Extract Body
const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
let jsx = bodyMatch ? bodyMatch[1] : '';

// Convert HTML to JSX
jsx = jsx.replace(/class=/g, 'className=');
jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');
jsx = jsx.replace(/<br>/g, '<br />');
jsx = jsx.replace(/<hr>/g, '<hr />');
jsx = jsx.replace(/<img(.*?)>/g, (m, p1) => {
  if (p1.endsWith('/')) return m;
  return '<img' + p1 + ' />';
});

// Style parser
jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
  const styles = p1.split(';').filter(s => s.trim());
  const styleObj = styles.map(s => {
    let [key, val] = s.split(':');
    if (!key || !val) return '';
    key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    val = val.trim();
    return `${key}: '${val}'`;
  }).filter(Boolean).join(', ');
  return `style={{ ${styleObj} }}`;
});

// Replace "Connexion" href with react router Link to /login
jsx = jsx.replace(/<a className="login" href="#">Connexion<\/a>/g, '<Link className="login" to="/login">Connexion</Link>');

// Use link component globally where appropriate if you want, but sticking to <a> for anchors is fine.

const comp = `import React from 'react';\nimport { Link } from 'react-router-dom';\nimport './Landing.css';\n\nexport default function Index() {\n  return (\n    <div className="dukaio-landing">\n      ${jsx}\n    </div>\n  );\n}\n`;

fs.writeFileSync('src/pages/Index.tsx', comp);
console.log('Done!');
