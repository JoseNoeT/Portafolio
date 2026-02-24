/**
 * Debug script para diagnosticar problemas de imágenes
 * Ejecuta en la consola del navegador
 */

(function() {
    console.log('🔍 DEBUGGING IMÁGENES - Iniciando...', new Date().toLocaleTimeString());
    
    // 1️⃣ VERIFICAR IMÁGENES EN EL DOM
    const images = document.querySelectorAll('img');
    console.log(`\n📸 Total de imágenes en el DOM: ${images.length}`);
    
    images.forEach((img, idx) => {
        const rect = img.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const computedStyle = window.getComputedStyle(img);
        
        console.group(`Imagen ${idx + 1}: ${img.alt || 'Sin alt'}`);
        console.log(`  ✓ src: ${img.src}`);
        console.log(`  ✓ Dimensiones: ${img.naturalWidth}x${img.naturalHeight} (natural)`);
        console.log(`  ✓ Visible en viewport: ${isVisible ? '✅ SÍ' : '❌ NO'}`);
        console.log(`  ✓ display: ${computedStyle.display}`);
        console.log(`  ✓ opacity: ${computedStyle.opacity}`);
        console.log(`  ✓ visibility: ${computedStyle.visibility}`);
        console.log(`  ✓ height: ${computedStyle.height}`);
        console.log(`  ✓ width: ${computedStyle.width}`);
        console.log(`  ✓ overflow parent: ${computedStyle.overflow}`);
        console.groupEnd();
    });
    
    // 2️⃣ VERIFICAR IMAGE-CARDS ESPECÍFICAMENTE
    console.log('\n🎨 IMAGE-CARDS:');
    const imageCards = document.querySelectorAll('.image-card');
    console.log(`Total: ${imageCards.length}`);
    
    imageCards.forEach((card, idx) => {
        const img = card.querySelector('img');
        const computedStyle = window.getComputedStyle(card);
        const rect = card.getBoundingClientRect();
        
        console.group(`Card ${idx + 1}`);
        console.log(`  ✓ Imagen: ${img?.src || 'NO TIENE IMAGEN'}`);
        console.log(`  ✓ Card width: ${card.offsetWidth}px / height: ${card.offsetHeight}px`);
        console.log(`  ✓ CSS display: ${computedStyle.display}`);
        console.log(`  ✓ CSS aspect-ratio: ${computedStyle.aspectRatio}`);
        console.log(`  ✓ En pantalla: ${rect.top}px from top, visible: ${rect.visible}`);
        console.groupEnd();
    });
    
    // 3️⃣ VERIFICAR SECCIONES PROBLEMÁTICAS
    console.log('\n📍 SECCIONES:');
    const sections = ['methodology', 'about', 'services', 'featured'];
    sections.forEach(section => {
        const elem = document.querySelector(`.${section}`);
        if (elem) {
            console.group(section.toUpperCase());
            console.log(`  ✓ Existe: SÍ`);
            console.log(`  ✓ Display: ${window.getComputedStyle(elem).display}`);
            console.log(`  ✓ Images dentro: ${elem.querySelectorAll('img').length}`);
            console.groupEnd();
        }
    });
    
    // 4️⃣ Test de carga de imagen directa
    console.log('\n🌐 TEST DE ACCESO A STATIC:');
    const testImg = new Image();
    testImg.onload = function() {
        console.log('✅ STATIC FUNCIONANDO - Imagen de test cargada exitosamente');
    };
    testImg.onerror = function() {
        console.error('❌ ERROR STATIC - No se puede acceder a static/img/');
    };
    testImg.src = '/static/img/arquitec.jpeg?' + Date.now(); // Cache buster
    
    console.log('\n✨ Debug completado. Revisa los logs superiores.');
})();
