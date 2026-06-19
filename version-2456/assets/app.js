(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      var isHidden = mobileMenu.hasAttribute('hidden');
      if (isHidden) {
        mobileMenu.removeAttribute('hidden');
        menuButton.textContent = '×';
      } else {
        mobileMenu.setAttribute('hidden', '');
        menuButton.textContent = '☰';
      }
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    var next = hero.querySelector('.hero-next');
    var prev = hero.querySelector('.hero-prev');
    if (next) next.addEventListener('click', function() { show(current + 1); });
    if (prev) prev.addEventListener('click', function() { show(current - 1); });
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    setInterval(function() { show(current + 1); }, 5000);
  }

  var filterArea = document.querySelector('[data-filter-area]');
  if (filterArea) {
    var query = filterArea.querySelector('.filter-input');
    var year = filterArea.querySelector('.filter-year');
    var type = filterArea.querySelector('.filter-type');
    var reset = filterArea.querySelector('.filter-reset');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var empty = document.querySelector('.no-results');
    function applyFilter() {
      var q = query && query.value ? query.value.trim().toLowerCase() : '';
      var y = year && year.value ? year.value : '';
      var t = type && type.value ? type.value : '';
      var visible = 0;
      cards.forEach(function(card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-region'), card.getAttribute('data-type'), card.getAttribute('data-tags'), card.getAttribute('data-year')].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (t && card.getAttribute('data-type') !== t) ok = false;
        card.classList.toggle('is-hidden', !ok);
        if (ok) visible += 1;
      });
      if (empty) {
        if (visible) empty.setAttribute('hidden', '');
        else empty.removeAttribute('hidden');
      }
    }
    [query, year, type].forEach(function(el) {
      if (el) el.addEventListener('input', applyFilter);
      if (el) el.addEventListener('change', applyFilter);
    });
    if (reset) {
      reset.addEventListener('click', function() {
        if (query) query.value = '';
        if (year) year.value = '';
        if (type) type.value = '';
        applyFilter();
      });
    }
  }

  var topButton = document.querySelector('.back-to-top');
  if (topButton) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) topButton.removeAttribute('hidden');
      else topButton.setAttribute('hidden', '');
    });
    topButton.addEventListener('click', function() {
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
  }

  if (window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var qParam = params.get('q') || '';
    var input = document.querySelector('.search-page-input');
    var summary = document.querySelector('.search-summary');
    var results = document.querySelector('.search-results');
    if (input) input.value = qParam;
    function renderSearch(value) {
      var q = String(value || '').trim().toLowerCase();
      var source = window.SEARCH_MOVIES;
      var matches = q ? source.filter(function(item) {
        return [item.title, item.region, item.type, item.year, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(q) !== -1;
      }) : source.slice(0, 36);
      if (summary) {
        summary.textContent = q ? '找到 ' + matches.length + ' 条与 “' + value + '” 相关的结果' : '展示最新入库内容';
      }
      if (!results) return;
      results.innerHTML = matches.slice(0, 120).map(function(item) {
        return '<article><a href="' + item.url + '" class="group cursor-pointer bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 card-link"><span class="relative aspect-[3/4] overflow-hidden block"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy"><span class="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">' + escapeHtml(item.year) + '</span></span><span class="p-4 block"><strong class="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">' + escapeHtml(item.title) + '</strong><span class="text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed card-desc">' + escapeHtml(item.oneLine) + '</span><span class="flex flex-wrap gap-2 text-xs text-slate-400 card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></span></span></a></article>';
      }).join('');
    }
    function escapeHtml(text) {
      return String(text).replace(/[&<>"]/g, function(ch) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch];
      });
    }
    renderSearch(qParam);
  }
}());
