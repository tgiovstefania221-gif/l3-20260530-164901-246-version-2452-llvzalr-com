(function () {
  var hlsLoaderPromise = null;

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback(true);
      return;
    }
    if (!hlsLoaderPromise) {
      hlsLoaderPromise = new Promise(function (resolve) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.onload = function () {
          resolve(Boolean(window.Hls));
        };
        script.onerror = function () {
          resolve(false);
        };
        document.head.appendChild(script);
      });
    }
    hlsLoaderPromise.then(callback);
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textOf(element) {
    return [
      element.getAttribute("data-title") || "",
      element.getAttribute("data-genre") || "",
      element.getAttribute("data-tags") || "",
      element.getAttribute("data-region") || "",
      element.getAttribute("data-year") || "",
      element.textContent || ""
    ].join(" ").toLowerCase();
  }

  function setupLocalSearch() {
    var input = document.querySelector("[data-local-search]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card], .category-overview-card"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var matched = !keyword || textOf(card).indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden-by-filter", !matched);
      });
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var panel = document.querySelector("[data-search-panel]");
    if (!input || !panel || !window.MOVIE_INDEX) {
      return;
    }

    function render(items) {
      if (!items.length) {
        panel.innerHTML = "";
        panel.classList.remove("is-open");
        return;
      }
      panel.innerHTML = items.slice(0, 12).map(function (movie) {
        return [
          '<a class="search-result" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
          '<span>',
          '<b>' + movie.title + '</b>',
          '<small>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</small>',
          '</span>',
          '</a>'
        ].join("");
      }).join("");
      panel.classList.add("is-open");
    }

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        render([]);
        return;
      }
      var result = window.MOVIE_INDEX.filter(function (movie) {
        return movie.searchText.indexOf(keyword) !== -1;
      });
      render(result);
    });

    input.closest("form").addEventListener("submit", function (event) {
      var first = panel.querySelector("a");
      if (first) {
        event.preventDefault();
        window.location.href = first.getAttribute("href");
      }
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-open");
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-src");
      var initialized = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            setStatus("点击视频继续播放");
          });
        }
      }

      function nativePlay() {
        video.src = source;
        video.controls = true;
        video.load();
        player.classList.add("is-playing");
        setStatus("播放源加载中");
        playVideo();
      }

      function startPlayback() {
        if (!source || !video) {
          setStatus("播放源暂不可用");
          return;
        }
        if (initialized) {
          player.classList.add("is-playing");
          playVideo();
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          nativePlay();
          return;
        }
        loadHls(function (supported) {
          if (supported && window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.controls = true;
              player.classList.add("is-playing");
              setStatus("");
              playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus("播放源加载失败");
              }
            });
            return;
          }
          nativePlay();
        });
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }
      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        startPlayback();
      });
      video.addEventListener("playing", function () {
        setStatus("");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupLocalSearch();
    setupGlobalSearch();
    setupPlayers();
  });
})();
