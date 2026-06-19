(function () {
  function $(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) return;
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function normalizeText(s) {
    return String(s || '').toLowerCase();
  }

  function initSearch() {
    var input = document.querySelector('[data-search-input]');
    if (!input) return;

    var cards = $('[data-card]');
    var lists = $('[data-list-item]');
    var debounceTimer = null;

    function applyFilter() {
      var q = normalizeText(input.value).trim();
      var tokens = q.split(/\s+/).filter(Boolean);

      var totalVisible = 0;
      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute('data-search') || card.textContent);
        var ok = tokens.every(function (token) { return text.indexOf(token) !== -1; });
        card.classList.toggle('hidden', !!q && !ok);
        if (!card.classList.contains('hidden')) totalVisible++;
      });

      lists.forEach(function (item) {
        var text = normalizeText(item.getAttribute('data-search') || item.textContent);
        var ok = tokens.every(function (token) { return text.indexOf(token) !== -1; });
        item.classList.toggle('hidden', !!q && !ok);
      });

      var counter = document.querySelector('[data-search-count]');
      if (counter) counter.textContent = totalVisible + ' 条结果';
    }

    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilter, 80);
    });
    applyFilter();
  }

  function initPills() {
    var pills = $('[data-filter-pill]');
    if (!pills.length) return;
    var cards = $('[data-card]');

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var target = pill.getAttribute('data-filter-pill');
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');

        cards.forEach(function (card) {
          var bucket = card.getAttribute('data-bucket') || '';
          var search = normalizeText(card.getAttribute('data-search') || '');
          var ok = target === 'all' ? true : (bucket === target || search.indexOf(target.toLowerCase()) !== -1);
          card.classList.toggle('hidden', !ok);
        });
      });
    });
  }

  function initHeroSlider() {
    var track = document.querySelector('[data-hero-track]');
    if (!track) return;
    var slides = $('[data-hero-slide]', track);
    if (slides.length < 2) return;
    var index = 0;
    var dots = $('[data-hero-dot]');
    var interval = null;

    function update() {
      var width = track.parentElement.getBoundingClientRect().width;
      track.style.transform = 'translateX(' + (-index * width) + 'px)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function next() {
      index = (index + 1) % slides.length;
      update();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        index = i;
        update();
        restart();
      });
    });

    function restart() {
      if (interval) clearInterval(interval);
      interval = setInterval(next, 4800);
    }

    window.addEventListener('resize', update);
    update();
    restart();
  }

  function initHlsPlayers() {
    var players = $('[data-hls]');
    if (!players.length) return;

    players.forEach(function (video) {
      var hlsSrc = video.getAttribute('data-hls');
      var fallback = video.getAttribute('data-fallback');
      if (window.Hls && window.Hls.isSupported()) {
        try {
          var hls = new Hls();
          hls.loadSource(hlsSrc);
          hls.attachMedia(video);
          video.dataset.hlsReady = '1';
        } catch (err) {
          if (fallback) video.src = fallback;
        }
        return;
      }

      if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSrc;
      } else if (fallback) {
        video.src = fallback;
      }
    });
  }

  function initBackToTop() {
    var btn = document.querySelector('[data-backtop]');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initSearch();
    initPills();
    initHeroSlider();
    initHlsPlayers();
    initBackToTop();
  });
})();
