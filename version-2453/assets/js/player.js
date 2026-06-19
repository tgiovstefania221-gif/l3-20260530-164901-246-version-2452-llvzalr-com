(function () {
    function setupPlayers() {
        document.querySelectorAll('[data-player-box]').forEach(function (box) {
            var video = box.querySelector('video');
            var cover = box.querySelector('.player-cover');
            var button = box.querySelector('.play-button');
            var message = document.querySelector('[data-player-message]');
            if (!video || !cover || !button) {
                return;
            }

            function writeMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function start() {
                var source = video.dataset.src;
                if (!source) {
                    writeMessage('当前影片暂未绑定播放源。');
                    return;
                }
                cover.style.display = 'none';

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            writeMessage('播放器已就绪，请再次点击播放。');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function () {
                        writeMessage('播放源加载异常，可刷新页面后重试。');
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {
                        writeMessage('播放器已就绪，请再次点击播放。');
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {
                        writeMessage('当前浏览器需要 HLS 支持才能播放该视频。');
                    });
                }
            }

            button.addEventListener('click', start);
            cover.addEventListener('click', start);
        });
    }

    document.addEventListener('DOMContentLoaded', setupPlayers);
})();
