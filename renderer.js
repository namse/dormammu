const { ipcRenderer } = require("electron")

window.onload = () => {
  let volume = 0;
  const video = document.createElement('video');
  let isPaused = true;
  video.src = "dormammu.mp4";
  video.onpause = () => {
    isPaused = true;
  }

  const tick = () => {
    if (isPaused) {
      if (!video.paused) {
        video.pause();
      }
      if (video.parentElement) {
        video.parentElement.removeChild(video);
      }
    }
    requestAnimationFrame(tick)
  };
  tick();

  ipcRenderer.on('play', () => {
    console.log('play');
    console.log('volume', volume);
    isPaused = false;
    if (!video.parentElement) {
      document.body.appendChild(video);
    }
    video.volume = volume;
    video.currentTime = 0;
    video.play();
  });

  ipcRenderer.on('stop', () => {
    isPaused = true;
  });

  ipcRenderer.on('setVolume', (event, nextVolume) => {
    volume = nextVolume;
    console.log(volume);
  });
}
