// Script Node.js para detectar elementos que pueden causar scroll vertical en un archivo HTML
const fs = require('fs');
const { JSDOM } = require('jsdom');

const filePath = 'c:/Users/Alumno/Desktop/Practica/Portafolio/templates/home.html';

fs.readFile(filePath, 'utf8', (err, html) => {
  if (err) {
    console.error('Error leyendo el archivo:', err);
    return;
  }

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const elements = document.querySelectorAll('*');
  let culprit = [];

  elements.forEach(el => {
    const style = dom.window.getComputedStyle(el);
    const height = parseFloat(style.height);
    const overflowY = style.overflowY;
    // Detecta elementos con overflowY visible y altura mayor a 100vh
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'visible') && height > 600) {
      culprit.push({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        height: style.height,
        overflowY: style.overflowY
      });
    }
  });

  if (culprit.length === 0) {
    console.log('Ningún elemento sospechoso encontrado.');
  } else {
    console.log('Elementos que pueden causar scroll vertical:', culprit);
  }
});
