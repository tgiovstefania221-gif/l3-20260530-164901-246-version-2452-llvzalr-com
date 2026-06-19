(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    const reset = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        reset();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        reset();
      });
    });

    show(0);
    start();
  }

  const searchInput = document.querySelector("[data-search-input]");
  const yearFilter = document.querySelector("[data-filter-year]");
  const typeFilter = document.querySelector("[data-filter-type]");
  const regionFilter = document.querySelector("[data-filter-region]");
  const cards = Array.from(document.querySelectorAll(".movie-card, .rank-row"));

  const filterCards = function () {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const year = yearFilter ? yearFilter.value : "";
    const type = typeFilter ? typeFilter.value : "";
    const region = regionFilter ? regionFilter.value : "";

    cards.forEach(function (card) {
      const text = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.category,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year
      ].join(" ").toLowerCase();
      const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      const matchYear = !year || card.dataset.year === year;
      const matchType = !type || card.dataset.type === type;
      const matchRegion = !region || card.dataset.region === region;
      card.classList.toggle("hidden-card", !(matchKeyword && matchYear && matchType && matchRegion));
    });
  };

  [searchInput, yearFilter, typeFilter, regionFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });

  const player = document.querySelector(".player-card");

  if (player) {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    const stream = typeof videoStream === "string" ? videoStream : "";
    let mounted = false;
    let hls = null;

    const mountStream = function () {
      if (mounted || !video || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      mounted = true;
    };

    const startPlayback = function () {
      mountStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    };

    const startButtons = Array.from(document.querySelectorAll("[data-start-player]"));

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    startButtons.forEach(function (button) {
      button.addEventListener("click", startPlayback);
    });

    if (video) {
      video.addEventListener("click", function () {
        if (!mounted) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
