(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupBackToTop() {
    var button = document.querySelector('.back-to-top');
    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      if (window.scrollY > 520) {
        button.classList.add('is-visible');
      } else {
        button.classList.remove('is-visible');
      }
    });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previousButton = carousel.querySelector('[data-hero-prev]');
    var nextButton = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-slide-to')) || 0;
        setActive(nextIndex);
        startTimer();
      });
    });

    if (previousButton) {
      previousButton.addEventListener('click', function () {
        setActive(index - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        setActive(index + 1);
        startTimer();
      });
    }

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('.site-search');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var root = form.getAttribute('data-root') || '';
        var url = root + 'search.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function uniqueSorted(values) {
    var seen = Object.create(null);
    values.forEach(function (value) {
      if (value) {
        seen[value] = true;
      }
    });
    return Object.keys(seen).sort(function (a, b) {
      var numberA = Number(a);
      var numberB = Number(b);
      if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
        return numberB - numberA;
      }
      return a.localeCompare(b, 'zh-CN');
    });
  }

  function populateSelect(select, values) {
    if (!select) {
      return;
    }
    uniqueSorted(values).forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupCardFilters() {
    var panel = document.querySelector('[data-card-filter]');
    var list = document.querySelector('[data-filter-list]');
    if (!panel || !list) {
      return;
    }

    var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .ranking-row'));
    var queryInput = panel.querySelector('[data-filter-query]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var countNode = panel.querySelector('[data-filter-count]');

    populateSelect(yearSelect, items.map(function (item) { return item.getAttribute('data-year'); }));
    populateSelect(typeSelect, items.map(function (item) { return item.getAttribute('data-type'); }));

    var initialQuery = getQueryParam('q');
    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }

    function applyFilters() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visibleCount = 0;

      items.forEach(function (item) {
        var text = (item.getAttribute('data-text') || '').toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || item.getAttribute('data-year') === year;
        var matchType = !type || item.getAttribute('data-type') === type;
        var matchCategory = !category || item.getAttribute('data-category') === category;
        var isVisible = matchQuery && matchYear && matchType && matchCategory;
        item.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visibleCount);
      }
    }

    [queryInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (queryInput) {
          queryInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  function setupImageFallback() {
    var images = document.querySelectorAll('.poster-img, .hero-bg, .detail-bg, .detail-poster img, .tile-collage img');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function setupVideoPlayers() {
    var players = document.querySelectorAll('[data-video-player]');
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-play-trigger]');
      var source = player.getAttribute('data-src');
      var hlsInstance = null;
      var hasLoaded = false;

      function attachSource() {
        if (!video || !source || hasLoaded) {
          return;
        }

        hasLoaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        player.classList.add('is-playing');
        if (video) {
          video.play().catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (trigger) {
        trigger.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            return;
          }
          player.classList.remove('is-playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupBackToTop();
    setupHeroCarousel();
    setupSearchForms();
    setupCardFilters();
    setupImageFallback();
    setupVideoPlayers();
  });
}());
