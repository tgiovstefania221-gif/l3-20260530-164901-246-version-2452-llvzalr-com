function initMoviePlayer(source, id) {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var stage = document.getElementById(id);

    if (!stage) {
      return;
    }

    var video = stage.querySelector("video");
    var button = stage.querySelector(".play-layer");
    var loaded = false;
    var hlsInstance = null;

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function playVideo() {
      hideButton();

      if (!video) {
        return;
      }

      if (!loaded) {
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", hideButton);
      video.addEventListener("ended", function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
}
