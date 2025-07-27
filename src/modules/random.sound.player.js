import groove1 from '../assets/sounds/groove-machine-1.mp3';
import groove2 from '../assets/sounds/groove-machine-2.mp3';
import midnight from '../assets/sounds/midnight-reverie.mp3';
import neon from '../assets/sounds/under-the-neon-lights.mp3';
import storm from '../assets/sounds/awaiting-the-storm.mp3';

import groove1Img from '../assets/images/groove-machine-1.png';
import groove2Img from '../assets/images/groove-machine-2.png';
import midnightImg from '../assets/images/midnight-reverie.png';
import neonImg from '../assets/images/under-the-neon-lights.png';
import stormImg from '../assets/images/awaiting-the-storm.png';

export default class RandomSoundPlayer {
  constructor() {
    this.tracks = [
      { title: 'Groove Machine 1', artist: 'DJ Sonic', src: groove1, cover: groove1Img },
      { title: 'Groove Machine 2', artist: 'DJ Sonic', src: groove2, cover: groove2Img },
      { title: 'Midnight Reverie', artist: 'Lunar Beats', src: midnight, cover: midnightImg },
      { title: 'Under the Neon Lights', artist: 'Synth Vibe', src: neon, cover: neonImg },
      { title: 'Awaiting the Storm', artist: 'Ambient Flow', src: storm, cover: stormImg },
    ];

    this.audio = new Audio();
    this.isPlaying = false;
    this.currentTrack = null;

    this.createModal();
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'sound-modal';
    this.modal.innerHTML = `
      <div class="modal-header">
        <img class="cover" src="" />
        <div class="track-info">
          <div class="track-title">Title</div>
          <div class="track-artist">Artist</div>
        </div>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <input type="range" class="progress" value="0" />
        <div class="time">
          <span class="current">0:00</span>
          <span class="duration">0:00</span>
        </div>
        <div class="controls">
          <button class="random-btn">🔀</button>
          <button class="play-btn">▶️</button>
          <button class="stop-btn">⏹</button>
        </div>
        <input type="range" class="volume" min="0" max="1" step="0.01" value="0.8" />
      </div>
    `;
    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('.close-btn').onclick = () => this.hide();
    this.modal.querySelector('.play-btn').onclick = () => this.toggle();
    this.modal.querySelector('.stop-btn').onclick = () => this.stop();

    const randomBtn = this.modal.querySelector('.random-btn');
    randomBtn.onclick = () => {
      randomBtn.classList.add('animate');
      this.playRandomTrack();
      setTimeout(() => randomBtn.classList.remove('animate'), 400);
    };

    this.modal.querySelector('.volume').oninput = (e) => {
      this.audio.volume = parseFloat(e.target.value);
    };
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
  }

  trigger() {
    this.playRandomTrack();
    this.show();
  }

  show() {
    this.modal.classList.add('visible');
  }

  hide() {
    this.modal.classList.remove('visible');
    this.audio.pause();
    this.isPlaying = false;
  }

  playRandomTrack() {
    const track = this.tracks[Math.floor(Math.random() * this.tracks.length)];
    this.currentTrack = track;
    this.audio.src = track.src;
    this.audio.currentTime = 0;
    this.audio.play();
    this.isPlaying = true;

    this.modal.querySelector('.cover').src = track.cover;
    this.modal.querySelector('.track-title').textContent = track.title;
    this.modal.querySelector('.track-artist').textContent = track.artist;
    this.modal.querySelector('.play-btn').textContent = '⏸';
  }

  toggle() {
    if (this.isPlaying) {
      this.audio.pause();
      this.modal.querySelector('.play-btn').textContent = '▶️';
    } else {
      this.audio.play();
      this.modal.querySelector('.play-btn').textContent = '⏸';
    }
    this.isPlaying = !this.isPlaying;
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.modal.querySelector('.play-btn').textContent = '▶️';
    this.isPlaying = false;
  }

  updateProgress() {
    const progress = this.modal.querySelector('.progress');
    const current = this.modal.querySelector('.current');
    const duration = this.modal.querySelector('.duration');

    if (this.audio.duration) {
      progress.max = this.audio.duration;
      progress.value = this.audio.currentTime;
      current.textContent = this.formatTime(this.audio.currentTime);
      duration.textContent = this.formatTime(this.audio.duration);
    }
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  }
}
