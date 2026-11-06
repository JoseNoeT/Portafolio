/* Keep page routes intact while reflecting the visible section on Home. */
(() => {
  const navbar = document.querySelector('.navbar');
  const links = [...document.querySelectorAll('#primary-navigation ul a')];
  if (!navbar || !links.length) return;
  const normalize = path => path.replace(/\/+$/, '') || '/';
  const path = normalize(location.pathname);
  const setActive = (active, kind) => links.forEach(link => {
    if (link === active) link.setAttribute('aria-current', kind);
    else link.removeAttribute('aria-current');
  });
  const pageLink = links.find(link => {
    const route = normalize(new URL(link.href).pathname);
    return route === path || (route !== '/' && path.startsWith(route + '/'));
  });
  setActive(pageLink, 'page');
  if (path !== '/') return;
  const targets = [
    ['.hero--home', '/'], ['#projects', '/projects/'],
    ['#services', '/servicios/'], ['#methodology', '/metodologia/'],
    ['#about', '/about/'], ['.closing-cta', '/contact/']
  ].map(([selector, route]) => ({
    section: document.querySelector(selector),
    link: links.find(link => normalize(new URL(link.href).pathname) === normalize(route))
  })).filter(target => target.section && target.link);
  targets.sort((a, b) => a.section.compareDocumentPosition(b.section) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const threshold = navbar.getBoundingClientRect().bottom + Math.min(160, innerHeight * .2);
    let active = targets[0];
    targets.forEach(target => {
      if (target.section.getBoundingClientRect().top <= threshold) active = target;
    });
    if (active) setActive(active.link, 'location');
  };
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('load', schedule, { once: true });
  update();
})();
