(function () {
  var $ = function (s) { return document.querySelectorAll(s); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  document.getElementById('ano').textContent = new Date().getFullYear();

  // títulos: palavra por palavra
  $('.split').forEach(function (h) {
    h.innerHTML = h.textContent.trim().split(/\s+/).map(function (w, i) {
      return '<span class="w"><span style="--i:' + i + '">' + w + '</span></span>';
    }).join(' ');
  });

  // rolagem: barra de progresso, cabeçalho, parallax, botão do WhatsApp
  var bar = document.getElementById('bar'), top = document.getElementById('top'), wa = document.getElementById('wa');
  function onScroll() {
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    top.classList.toggle('solid', y > 60);
    wa.classList.toggle('show', y > 500);
    if (!reduce) $('[data-parallax]').forEach(function (el) {
      if (y < innerHeight * 1.2) el.style.transform = 'translateY(' + y * el.dataset.parallax + 'px)';
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // revelar ao rolar + contador
  var io = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (!it.isIntersecting) return;
      it.target.classList.add('in');
      it.target.querySelectorAll('[data-count]').forEach(count);
      io.unobserve(it.target);
    });
  }, { threshold: 0.15 });
  $('.reveal,.split,.grid figure').forEach(function (el) { io.observe(el); });

  function count(el) {
    var end = +el.dataset.count, pre = el.dataset.prefix || '', t0 = null;
    if (reduce) { el.textContent = pre + end.toLocaleString('pt-BR'); return; }
    requestAnimationFrame(function step(t) {
      t0 = t0 || t;
      var p = Math.min((t - t0) / 1600, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    });
  }

  // efeitos de mouse (só em computador): brilho, inclinação da foto, botões magnéticos
  if (fine && !reduce) {
    var glow = document.getElementById('glow');
    addEventListener('mousemove', function (e) {
      glow.style.opacity = 1;
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      glow.style.left = glow.style.top = 0;
    });
    var tilt = document.getElementById('tilt');
    tilt.addEventListener('mousemove', function (e) {
      var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = 'perspective(800px) rotateY(' + x * 10 + 'deg) rotateX(' + -y * 10 + 'deg)';
    });
    tilt.addEventListener('mouseleave', function () { tilt.style.transform = ''; });
    $('[data-mag]').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .2 + 'px,' + (e.clientY - r.top - r.height / 2) * .3 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  // contagem regressiva para o próximo campeonato da agenda
  var next = null, now = Date.now();
  $('[data-date]').forEach(function (li) {
    var t = Date.parse(li.dataset.date);
    if (t < now) li.hidden = true;
    else if (!next || t < next.t) next = { t: t, n: li.querySelector('h3').textContent };
  });
  var cd = document.getElementById('cd');
  if (next) (function tick() {
    var d = next.t - Date.now();
    if (d < 0) { cd.textContent = ''; return; }
    var p = function (n) { return String(n).padStart(2, '0'); };
    cd.textContent = next.n + ' começa em ' + Math.floor(d / 864e5) + ' dias ' + p(Math.floor(d / 36e5) % 24) + ':' + p(Math.floor(d / 6e4) % 60) + ':' + p(Math.floor(d / 1e3) % 60);
    setTimeout(tick, 1000);
  })();

  // depoimentos em rotação
  var qs = $('.quotes blockquote'), qi = 0;
  if (qs.length > 1 && !reduce) setInterval(function () {
    qs[qi].classList.remove('on'); qi = (qi + 1) % qs.length; qs[qi].classList.add('on');
  }, 7000);

  // galeria em tela cheia
  var lb = document.getElementById('lb'), img = lb.querySelector('img');
  $('[data-full]').forEach(function (f) {
    f.addEventListener('click', function () { img.src = f.dataset.full; lb.hidden = false; });
  });
  lb.addEventListener('click', function () { lb.hidden = true; });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });
})();
