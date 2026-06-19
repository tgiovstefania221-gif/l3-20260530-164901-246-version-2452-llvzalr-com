
const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const button = qs('[data-menu-toggle]');
  const nav = qs('[data-mobile-nav]');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
  });
}

function initHero() {
  const hero = qs('[data-hero]');
  if (!hero) return;

  const slides = qsa('[data-hero-slide]', hero);
  const dots = qsa('[data-hero-dot]', hero);
  const thumbs = qsa('[data-hero-thumb]');
  const prev = qs('[data-hero-prev]', hero);
  const next = qs('[data-hero-next]', hero);
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener('mouseenter', () => {
      show(Number(thumb.dataset.heroThumb || 0));
      stop();
    });
    thumb.addEventListener('mouseleave', start);
  });

  if (prev) prev.addEventListener('click', () => { show(index - 1); start(); });
  if (next) next.addEventListener('click', () => { show(index + 1); start(); });
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initHeaderSearch() {
  qsa('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) return;
      event.preventDefault();
      const url = new URL(form.getAttribute('action') || 'search.html', window.location.href);
      url.searchParams.set('q', input.value.trim());
      window.location.href = url.toString();
    });
  });
}

function initArchiveFilter() {
  const cards = qsa('[data-card]');
  if (!cards.length) return;

  const search = qs('#movieFilter');
  const year = qs('#yearFilter');
  const type = qs('#typeFilter');
  const category = qs('#categoryFilter');
  const count = qs('#filterCount');

  const apply = () => {
    const keyword = (search?.value || '').trim().toLowerCase();
    const yearValue = year?.value || '';
    const typeValue = type?.value || '';
    const categoryValue = category?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const text = (card.dataset.search || '').toLowerCase();
      const cardYear = card.dataset.year || '';
      const cardType = card.dataset.type || '';
      const cardCategory = card.dataset.category || '';
      const yearMatch = !yearValue || (yearValue === '2020' ? Number(cardYear) <= 2020 : cardYear === yearValue);
      const typeMatch = !typeValue || cardType.includes(typeValue);
      const categoryMatch = !categoryValue || cardCategory === categoryValue;
      const keywordMatch = !keyword || text.includes(keyword);
      const show = yearMatch && typeMatch && categoryMatch && keywordMatch;
      card.classList.toggle('hidden-by-filter', !show);
      if (show) visible += 1;
    });

    if (count) count.textContent = String(visible);
  };

  [search, year, type, category].forEach((control) => {
    if (control) control.addEventListener('input', apply);
    if (control) control.addEventListener('change', apply);
  });

  const params = new URLSearchParams(window.location.search);
  if (search && params.get('q')) search.value = params.get('q');
  apply();
}

function createSearchCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('');
  return `
<article class="movie-card">
  <a class="poster-frame" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
    <img src="${escapeHtml(movie.image)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-gradient"></span>
    <span class="play-float">▶</span>
  </a>
  <div class="movie-card-body">
    <div class="movie-card-meta">
      <span>${escapeHtml(movie.year)}</span>
      <span>${escapeHtml(movie.region)}</span>
      <span>${escapeHtml(movie.type)}</span>
    </div>
    <h3 class="movie-card-title"><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
    <p class="movie-card-desc">${escapeHtml(movie.oneLine || '')}</p>
    <div class="hero-tags">${tags}</div>
    <div class="movie-card-foot">
      <span class="score">★ ${escapeHtml(movie.score)}</span>
      <a class="detail-link" href="${escapeHtml(movie.url)}">立即观看</a>
    </div>
  </div>
</article>`;
}

function initSearchPage() {
  const input = qs('#searchInput');
  const button = qs('#searchButton');
  const results = qs('#searchResults');
  const count = qs('#searchCount');
  if (!input || !results || !window.MOVIE_DATA) return;

  const params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';

  const run = () => {
    const keyword = input.value.trim().toLowerCase();
    const movies = window.MOVIE_DATA.filter((movie) => {
      if (!keyword) return true;
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        ...(movie.tags || []),
        movie.oneLine,
      ].join(' ').toLowerCase();
      return haystack.includes(keyword);
    }).slice(0, 240);

    results.innerHTML = movies.map(createSearchCard).join('');
    if (count) count.textContent = String(movies.length);
    initImageFallback(results);
  };

  input.addEventListener('input', run);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') run();
  });
  if (button) button.addEventListener('click', run);
  run();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function initPlayer() {
  const players = qsa('[data-player]');
  if (!players.length) return;

  let HlsClass = null;
  const loadHls = async () => {
    if (HlsClass !== null) return HlsClass;
    try {
      const module = await import('./hls.js');
      HlsClass = module.H || module.default || null;
    } catch (error) {
      HlsClass = null;
    }
    return HlsClass;
  };

  players.forEach((shell) => {
    const video = shell.querySelector('video');
    const start = shell.querySelector('.player-start');
    const status = shell.querySelector('[data-player-status]');
    if (!video) return;

    const setStatus = (message) => {
      if (status) status.textContent = message;
    };

    const play = async () => {
      const src = video.dataset.src;
      if (!src) {
        setStatus('未找到播放源');
        return;
      }

      if (shell.dataset.ready !== 'true') {
        setStatus('正在加载播放源...');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          shell.dataset.ready = 'true';
          shell.classList.add('is-ready');
          setStatus('正在播放');
        } else {
          const Hls = await loadHls();
          if (Hls && typeof Hls.isSupported === 'function' && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            window.__movieHlsInstances = window.__movieHlsInstances || [];
            window.__movieHlsInstances.push(hls);
            shell.dataset.ready = 'true';
            shell.classList.add('is-ready');
            setStatus('播放源已绑定');
          } else {
            video.src = src;
            shell.dataset.ready = 'true';
            shell.classList.add('is-ready');
            setStatus('正在尝试原生播放');
          }
        }
      }

      try {
        await video.play();
        shell.classList.add('is-ready');
        setStatus('正在播放');
      } catch (error) {
        setStatus('点击视频控件继续播放');
      }
    };

    if (start) start.addEventListener('click', play);
  });
}

function initImageFallback(root = document) {
  qsa('img', root).forEach((img) => {
    img.addEventListener('error', () => {
      img.classList.add('is-missing');
      img.removeAttribute('src');
    }, { once: true });
  });
}

initMobileMenu();
initHero();
initHeaderSearch();
initArchiveFilter();
initSearchPage();
initPlayer();
initImageFallback();
