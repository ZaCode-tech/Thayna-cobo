(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('ano').textContent = new Date().getFullYear();

  // cabeçalho muda ao rolar + parallax do hero
  var top = document.getElementById('top');
  var hero = document.querySelector('[data-parallax]');
  function onScroll() {
    var y = window.scrollY;
    top.classList.toggle('solid', y > 60);
    if (hero && !reduce && y < window.innerHeight) hero.style.transform = 'translateY(' + y * 0.08 + 'px)';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // revelar elementos + contador
  var io = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (!it.isIntersecting) return;
      it.target.classList.add('in');
      it.target.querySelectorAll('[data-count]').forEach(count);
      io.unobserve(it.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  function count(el) {
    var end = +el.dataset.count, pre = el.dataset.prefix || '', t0 = null;
    if (reduce) { el.textContent = pre + end.toLocaleString('pt-BR'); return; }
    (function step(t) {
      t0 = t0 || t;
      var p = Math.min((t - t0) / 1600, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  // lightbox da galeria
  var lb = document.getElementById('lb'), img = lb.querySelector('img');
  document.querySelectorAll('[data-full]').forEach(function (f) {
    f.addEventListener('click', function () { img.src = f.dataset.full; lb.hidden = false; });
  });
  lb.addEventListener('click', function () { lb.hidden = true; });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });
})();
