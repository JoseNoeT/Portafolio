(() => {
  const dialog = document.getElementById('image-modal');
  if (!dialog) return;
  const preview = dialog.querySelector('img');
  document.querySelectorAll('[data-case-image]').forEach(button => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img');
      preview.src = image.currentSrc || image.src;
      preview.alt = image.alt;
      dialog.showModal();
      document.body.classList.add('case-image-open');
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => document.body.classList.remove('case-image-open'));
})();
