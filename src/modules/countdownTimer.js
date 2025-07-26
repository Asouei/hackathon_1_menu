// countdownTimer.js
export default class CountdownTimer {
  constructor() {
    this.modal = null;
    this.input = null;
    this.startBtn = null;
    this.stopBtn = null;
    this.circles = {};
    this.interval = null;
    this.totalSeconds = 0;
    this.remaining = 0;
  }

  trigger() {
    if (!this.modal) this.createModal();
    this.modal.style.display = 'flex';
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'timer-modal';

    this.modal.innerHTML = `
        <div class="circular-container">
          <div class="circle" id="hours">
            <svg><circle class="bg"/><circle class="progress"/></svg>
            <div class="text">0<span>HOURS</span></div>
          </div>
          <div class="circle" id="minutes">
            <svg><circle class="bg"/><circle class="progress"/></svg>
            <div class="text">0<span>MINUTES</span></div>
          </div>
          <div class="circle" id="seconds">
            <svg><circle class="bg"/><circle class="progress"/></svg>
            <div class="text">0<span>SECONDS</span></div>
          </div>
        </div>
        <div class="timer-controls">
          <input type="text" placeholder="hh:mm:ss"/>
          <button class="start">Start</button>
          <button class="stop">Stop</button>
        </div>
      `;

    document.body.appendChild(this.modal);

    this.input = this.modal.querySelector('input');
    this.startBtn = this.modal.querySelector('.start');
    this.stopBtn = this.modal.querySelector('.stop');

    ['hours', 'minutes', 'seconds'].forEach((key) => {
      const el = this.modal.querySelector(`#${key}`);
      this.circles[key] = {
        progress: el.querySelector('.progress'),
        text: el.querySelector('.text'),
      };
    });

    this.startBtn.onclick = () => this.start();
    this.stopBtn.onclick = () => this.stop();
  }

  parseTimeInput(input) {
    const [h, m, s] = input.split(':').map(Number);
    return (h * 3600 || 0) + (m * 60 || 0) + (s || 0);
  }

  start() {
    const value = this.parseTimeInput(this.input.value);
    if (!value || value <= 0) return;
    this.totalSeconds = value;
    this.remaining = value;
    this.updateCircles();

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.remaining--;
      this.updateCircles();
      if (this.remaining <= 0) this.stop();
    }, 1000);
  }

  stop() {
    clearInterval(this.interval);
    this.remaining = 0;
    this.updateCircles();
  }

  updateCircles() {
    const hours = Math.floor(this.remaining / 3600);
    const minutes = Math.floor((this.remaining % 3600) / 60);
    const seconds = this.remaining % 60;

    const format = (val) => val.toString().padStart(2, '0');

    const max = {
      hours: 12,
      minutes: 60,
      seconds: 60,
    };

    const values = { hours, minutes, seconds };

    Object.entries(this.circles).forEach(([key, { progress, text }]) => {
      const percent = (values[key] / max[key]) * 565;
      progress.style.strokeDashoffset = `${565 - percent}`;
      text.childNodes[0].nodeValue = format(values[key]);
    });
  }
}
