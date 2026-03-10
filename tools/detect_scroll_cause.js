// Script para detectar qué elemento causa el scroll vertical
(function(){
  // Obtiene todos los elementos del DOM
  const elements = document.querySelectorAll('*');
  let culprit = [];

  elements.forEach(el => {
    // Calcula el tamaño y posición
    const rect = el.getBoundingClientRect();
    // Si el elemento se sale del viewport vertical
    if (rect.bottom > window.innerHeight || rect.top < 0) {
      culprit.push({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        rect: rect,
        overflowY: getComputedStyle(el).overflowY,
        height: getComputedStyle(el).height
      });
    }
  });

  if (culprit.length === 0) {
    console.log('Ningún elemento se sale del viewport.');
  } else {
    console.log('Elementos que causan scroll vertical:', culprit);
  }
})();
