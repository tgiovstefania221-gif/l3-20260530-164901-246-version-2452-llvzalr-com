(function () {
  var body = document.body;
  var menuToggle = document.querySelector('.menu-toggle');

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-prev]');
    var next = hero.querySelector('[data-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.local-search, #movie-search'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var activeFilter = '全部';

  searchInputs.forEach(function (input) {
    if (query && !input.value) {
      input.value = query;
    }
    input.addEventListener('input', applyFilters);
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter') || '全部';
      applyFilters();
    });
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    var term = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var category = normalize(card.getAttribute('data-category'));
      var filter = normalize(activeFilter);
      var textMatch = !term || haystack.indexOf(term) !== -1;
      var filterMatch = !filter || filter === '全部' || haystack.indexOf(filter) !== -1 || category.indexOf(filter) !== -1;
      card.classList.toggle('is-hidden', !(textMatch && filterMatch));
    });
  }

  if (query || chips.length || searchInputs.length) {
    applyFilters();
  }
})();
