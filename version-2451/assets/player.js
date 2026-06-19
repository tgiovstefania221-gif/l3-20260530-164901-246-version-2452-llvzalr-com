import { H } from "./hls.js";

export function initPlayer(streamUrl) {
  var video = document.getElementById("moviePlayer");
  var cover = document.querySelector(".player-cover");

  if (!video || !streamUrl) {
    return;
  }

  var prepared = false;

  var prepare = function () {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (H && H.isSupported()) {
      var hls = new H({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };

  var start = function () {
    prepare();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  };

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
}
