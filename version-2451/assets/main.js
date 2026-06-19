(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav-links");
  var search = document.querySelector(".nav-search");

  if (toggle && nav && search) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      search.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    var showSlide = function (nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
  var categoryFilters = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  filterInputs.forEach(function (input) {
    if (query && !input.value) {
      input.value = query;
    }
  });

  var normalize = function (value) {
    return String(value || "").trim().toLowerCase();
  };

  var applyFilters = function () {
    var keyword = normalize(filterInputs.map(function (input) {
      return input.value;
    }).join(" "));
    var year = normalize(yearFilters.map(function (select) {
      return select.value;
    }).filter(Boolean)[0] || "");
    var category = normalize(categoryFilters.map(function (select) {
      return select.value;
    }).filter(Boolean)[0] || "");

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute("data-search"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardCategory = normalize(card.getAttribute("data-category"));
      var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
      var matchYear = !year || cardYear === year;
      var matchCategory = !category || cardCategory === category;
      card.classList.toggle("is-hidden-card", !(matchKeyword && matchYear && matchCategory));
    });
  };

  filterInputs.concat(yearFilters).concat(categoryFilters).forEach(function (control) {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });

  if (cards.length) {
    applyFilters();
  }
})();
