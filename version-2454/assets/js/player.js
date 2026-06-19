function initMoviePlayer(videoUrl) {
  var shell = document.getElementById('player-shell');
  var video = document.getElementById('movie-player');
  var cover = document.getElementById('player-cover');
  var hls = null;
  var ready = false;
  var pendingPlay = false;

  if (!shell || !video || !cover || !videoUrl) {
    return;
  }

  function hideCover() {
    cover.classList.add('is-hidden');
    shell.classList.add('is-playing');
  }

  function showCover() {
    cover.classList.remove('is-hidden');
    shell.classList.remove('is-playing');
  }

  function playVideo() {
    hideCover();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showCover();
      });
    }
  }

  function attachSource() {
    if (ready) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      if (pendingPlay) {
        playVideo();
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (pendingPlay) {
          playVideo();
        }
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showCover();
        }
      });
      return;
    }

    video.src = videoUrl;
    if (pendingPlay) {
      playVideo();
    }
  }

  function start() {
    pendingPlay = true;
    attachSource();
    if (video.readyState > 0 || video.canPlayType('application/vnd.apple.mpegurl') || !(window.Hls && window.Hls.isSupported())) {
      playVideo();
    } else {
      hideCover();
    }
  }

  cover.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!ready) {
      start();
    }
  });
  video.addEventListener('ended', showCover);

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
