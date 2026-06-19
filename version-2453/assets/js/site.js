(function () {
    function encodeSvgFallback(title) {
        var safeTitle = String(title || '精彩影片').slice(0, 18);
        var svg = '' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">' +
            '<defs>' +
            '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0%" stop-color="#064e3b" />' +
            '<stop offset="55%" stop-color="#111827" />' +
            '<stop offset="100%" stop-color="#020617" />' +
            '</linearGradient>' +
            '</defs>' +
            '<rect width="600" height="900" fill="url(#g)" />' +
            '<circle cx="475" cy="120" r="130" fill="#10b981" opacity="0.18" />' +
            '<circle cx="90" cy="760" r="190" fill="#34d399" opacity="0.12" />' +
            '<text x="50%" y="48%" text-anchor="middle" fill="#d1fae5" font-size="42" font-family="Microsoft YaHei, Arial" font-weight="700">' + safeTitle + '</text>' +
            '<text x="50%" y="55%" text-anchor="middle" fill="#6ee7b7" font-size="24" font-family="Arial">HD ONLINE</text>' +
            '</svg>';
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    function applyImageFallbacks() {
        document.querySelectorAll('img[data-fallback-title]').forEach(function (img) {
            img.addEventListener('error', function () {
                if (img.dataset.fallbackApplied === 'true') {
                    return;
                }
                img.dataset.fallbackApplied = 'true';
                img.src = encodeSvgFallback(img.dataset.fallbackTitle);
            });
        });
    }

    function setupNav() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.main-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        show(0);
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        var filterRoot = document.querySelector('[data-filter-root]');
        if (!filterRoot) {
            return;
        }
        var keyword = document.querySelector('[data-filter-keyword]');
        var year = document.querySelector('[data-filter-year]');
        var region = document.querySelector('[data-filter-region]');
        var genre = document.querySelector('[data-filter-genre]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var q = normalize(keyword && keyword.value);
            var y = normalize(year && year.value);
            var r = normalize(region && region.value);
            var g = normalize(genre && genre.value);
            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.category
                ].join(' '));
                var matched = true;
                if (q && text.indexOf(q) === -1) {
                    matched = false;
                }
                if (y && normalize(card.dataset.year) !== y) {
                    matched = false;
                }
                if (r && normalize(card.dataset.region).indexOf(r) === -1) {
                    matched = false;
                }
                if (g && normalize(card.dataset.genre).indexOf(g) === -1) {
                    matched = false;
                }
                card.classList.toggle('hidden-by-filter', !matched);
            });
        }

        [keyword, year, region, genre].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupQuickSearch() {
        var form = document.querySelector('[data-quick-search]');
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var keyword = form.querySelector('[name="q"]');
            var target = form.getAttribute('action') || './search.html';
            var q = keyword ? keyword.value.trim() : '';
            window.location.href = target + (q ? '?q=' + encodeURIComponent(q) : '');
        });
    }

    function setupSearchQuery() {
        var input = document.querySelector('[data-filter-keyword]');
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
            input.dispatchEvent(new Event('input'));
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        applyImageFallbacks();
        setupNav();
        setupHero();
        setupFilters();
        setupQuickSearch();
        setupSearchQuery();
    });
})();
