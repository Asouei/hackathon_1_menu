import * as THREE from 'three';
import { gsap } from 'gsap';
import { Howl, Howler } from 'howler';
import Chart from 'chart.js/auto';
import confetti from 'canvas-confetti';
import Module from '../core/module';
import ToastNotification from '../utils/notifications';

export default class Aim400kgModule extends Module {
  constructor() {
    super('AIM 400kg', 'AIM 400kg');
    this.toast = new ToastNotification();

    // Game state
    this.gameState = {
      isPlaying: false,
      difficulty: 'medium',
      targetCount: 20,
      targetsRemaining: 20,
      hits: 0,
      misses: 0,
      reactionTimes: [],
      currentTarget: null,
      targetSpawnTime: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      startTime: 0,
      endTime: 0,
    };

    // Difficulty settings
    this.difficultySettings = {
      easy: {
        targetSize: 80,
        targetDuration: 3000,
        spawnDelay: 1500,
        scoreMultiplier: 1,
        targetSpeed: 0.5,
      },
      medium: {
        targetSize: 60,
        targetDuration: 2000,
        spawnDelay: 1000,
        scoreMultiplier: 1.5,
        targetSpeed: 1,
      },
      hardcore: {
        targetSize: 40,
        targetDuration: 1200,
        spawnDelay: 600,
        scoreMultiplier: 3,
        targetSpeed: 2,
      },
    };

    // Three.js
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.stars = [];
    this.nebulas = [];
    this.animationId = null;

    // GSAP timelines
    this.timelines = {
      targetSpawn: null,
      targetHit: null,
      slowMo: null,
    };

    // Audio with Howler.js
    this.sounds = {
      hit: new Howl({
        src: ['sounds/hit.wav'],
        volume: 0.3,
        rate: 1.2,
      }),
      miss: new Howl({
        src: ['sounds/miss.ogg'],
        volume: 0.2,
        rate: 0.8,
      }),
      spawn: new Howl({
        src: ['sounds/spawn.wav'],
        volume: 0.15,
        rate: 1.5,
      }),
      combo: new Howl({
        src: ['sounds/combo.wav'],
        volume: 0.4,
        rate: 1.8,
      }),
      ambient: new Howl({
        src: ['sounds/ambient.wav'],
        volume: 0.8,
        loop: true,
        rate: 1.0,
      }),
    };

    // UI Elements
    this.modal = null;
    this.gameContainer = null;
    this.resultsModal = null;
    this.chart = null;
    this.targetTimeout = null;
  }

  trigger() {
    this.resetGameState();
    this.showStartModal();
  }

  resetGameState() {
    this.gameState = {
      isPlaying: false,
      difficulty: 'medium',
      targetCount: 20,
      targetsRemaining: 20,
      hits: 0,
      misses: 0,
      reactionTimes: [],
      currentTarget: null,
      targetSpawnTime: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      startTime: 0,
      endTime: 0,
    };
  }

  showStartModal() {
    // Создаем модальное окно выбора сложности
    this.modal = document.createElement('div');
    this.modal.className = 'aim400kg-modal';
    this.modal.innerHTML = `
      <div class="aim400kg-modal-container">
        <div class="aim400kg-header">
          <h2 class="aim400kg-title">
            <span class="title-main">AIM 400kg</span>
            <span class="title-sub">Cyberpunk Aim Trainer</span>
          </h2>
          <button class="close-aim400kg">×</button>
        </div>
        
        <div class="aim400kg-content">
          <div class="difficulty-section">
            <h3>Выберите сложность</h3>
            <div class="difficulty-options">
              <label class="difficulty-option">
                <input type="radio" name="difficulty" value="easy">
                <div class="option-card easy-card">
                  <span class="option-title">Лёгкий</span>
                  <span class="option-desc">Большие цели, медленная скорость</span>
                  <div class="option-stats">
                    <span>Размер: 80px</span>
                    <span>Время: 3s</span>
                    <span>Очки: x1</span>
                  </div>
                </div>
              </label>
              <label class="difficulty-option">
                <input type="radio" name="difficulty" value="medium" checked>
                <div class="option-card medium-card">
                  <span class="option-title">Средний</span>
                  <span class="option-desc">Обычные цели, средняя скорость</span>
                  <div class="option-stats">
                    <span>Размер: 60px</span>
                    <span>Время: 2s</span>
                    <span>Очки: x1.5</span>
                  </div>
                </div>
              </label>
              <label class="difficulty-option">
                <input type="radio" name="difficulty" value="hardcore">
                <div class="option-card hardcore-card">
                  <span class="option-title">Хардкор</span>
                  <span class="option-desc">Маленькие цели, высокая скорость</span>
                  <div class="option-stats">
                    <span>Размер: 40px</span>
                    <span>Время: 1.2s</span>
                    <span>Очки: x3</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          <div class="targets-section">
            <h3>Количество целей</h3>
            <div class="targets-slider">
              <input type="range" id="targetsRange" min="10" max="50" value="20" step="5">
              <div class="slider-value">
                <span id="targetsValue">20</span>
                <span class="slider-label">целей</span>
              </div>
            </div>
          </div>
          
          <div class="start-section">
            <button class="start-game-btn">
              <span class="btn-text">НАЧАТЬ ТРЕНИРОВКУ</span>
              <span class="btn-glow"></span>
            </button>
            <p class="hint-text">Кликайте по целям как можно быстрее!</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Анимация появления
    gsap.fromTo(this.modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });

    gsap.fromTo(
      '.aim400kg-modal-container',
      { scale: 0.8, y: 50 },
      { scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    );

    // Event listeners
    const closeBtn = this.modal.querySelector('.close-aim400kg');
    closeBtn.addEventListener('click', () => this.closeModal());

    const startBtn = this.modal.querySelector('.start-game-btn');
    startBtn.addEventListener('click', () => this.startGame());

    const targetsRange = this.modal.querySelector('#targetsRange');
    const targetsValue = this.modal.querySelector('#targetsValue');
    targetsRange.addEventListener('input', (e) => {
      targetsValue.textContent = e.target.value;
      this.gameState.targetCount = parseInt(e.target.value);
      this.gameState.targetsRemaining = parseInt(e.target.value);
    });

    // Difficulty selection
    const difficultyInputs = this.modal.querySelectorAll('input[name="difficulty"]');
    difficultyInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        this.gameState.difficulty = e.target.value;
      });
    });
  }

  closeModal() {
    gsap.to(this.modal, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        if (this.modal && this.modal.parentNode) {
          this.modal.remove();
        }
      },
    });
  }

  startGame() {
    this.closeModal();
    this.initGame();
  }

  initGame() {
    // Создаем игровой контейнер
    this.gameContainer = document.createElement('div');
    this.gameContainer.className = 'aim400kg-game';
    this.gameContainer.innerHTML = `
      <div class="game-ui">
        <div class="game-stats">
          <div class="stat-item">
            <span class="stat-label">Счёт</span>
            <span class="stat-value" id="score">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Комбо</span>
            <span class="stat-value" id="combo">0x</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Цели</span>
            <span class="stat-value" id="targets">${this.gameState.targetsRemaining}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Точность</span>
            <span class="stat-value" id="accuracy">100%</span>
          </div>
        </div>
        <div class="game-crosshair"></div>
      </div>
      <canvas id="gameCanvas"></canvas>
    `;

    document.body.appendChild(this.gameContainer);

    // Инициализация Three.js
    this.initThreeJS();

    // Запуск игры
    this.gameState.isPlaying = true;
    this.gameState.startTime = Date.now();
    this.sounds.ambient.play();

    // Анимация появления UI
    gsap.fromTo(
      '.game-stats',
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.2 }
    );

    // Обработчик кликов
    this.gameContainer.addEventListener('click', (e) => this.handleClick(e));

    // Запуск спавна целей
    this.spawnTarget();
  }

  initThreeJS() {
    const canvas = document.getElementById('gameCanvas');

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.pointerEvents = 'none';
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Stars
    this.createStarField();

    // Nebula effect
    this.createNebula();

    // Start animation
    this.animate();

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  createStarField() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for (let i = 0; i < 10000; i++) {
      vertices.push(
        (Math.random() - 0.5) * 600,
        (Math.random() - 0.5) * 600,
        (Math.random() - 0.5) * 600
      );

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.8);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  createNebula() {
    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;
        
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float d = length(p);
          
          vec3 color1 = vec3(0.1, 0.3, 0.8);
          vec3 color2 = vec3(0.8, 0.1, 0.6);
          vec3 color = mix(color1, color2, sin(time + d * 3.0) * 0.5 + 0.5);
          
          float alpha = exp(-d * 2.0) * 0.3;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const nebula = new THREE.Mesh(geometry, material);
    nebula.position.z = -20;
    this.nebulas.push(nebula);
    this.scene.add(nebula);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Rotate stars
    if (this.stars) {
      this.stars.rotation.x += 0.0001;
      this.stars.rotation.y += 0.0002;
    }

    // Update nebula
    this.nebulas.forEach((nebula) => {
      nebula.material.uniforms.time.value += 0.01;
    });

    // Camera movement
    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 0.5;
    this.camera.position.y = Math.cos(Date.now() * 0.0001) * 0.5;

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  spawnTarget() {
    if (!this.gameState.isPlaying || this.gameState.targetsRemaining <= 0) {
      this.endGame();
      return;
    }

    const settings = this.difficultySettings[this.gameState.difficulty];

    // Create target element
    const target = document.createElement('div');
    target.className = 'aim-target';
    target.style.width = `${settings.targetSize}px`;
    target.style.height = `${settings.targetSize}px`;

    // Random position
    const margin = settings.targetSize;
    const x = margin + Math.random() * (window.innerWidth - margin * 2);
    const y = margin + Math.random() * (window.innerHeight - margin * 2);

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    // Add to container
    this.gameContainer.appendChild(target);
    this.currentTarget = target;
    this.gameState.targetSpawnTime = Date.now();

    // Spawn animation
    gsap.fromTo(
      target,
      {
        scale: 0,
        rotation: -180,
        opacity: 0,
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'back.out(2)',
      }
    );

    // Play spawn sound
    this.sounds.spawn.play();

    // Auto-remove after duration
    this.targetTimeout = setTimeout(() => {
      if (target.parentNode) {
        this.missTarget(target);
      }
    }, settings.targetDuration);

    // Add click handler
    target.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hitTarget(target);
    });
  }

  hitTarget(target) {
    if (!target || !target.parentNode) return;

    clearTimeout(this.targetTimeout);

    // Calculate reaction time
    const reactionTime = Date.now() - this.gameState.targetSpawnTime;
    this.gameState.reactionTimes.push(reactionTime);

    // Update stats
    this.gameState.hits++;
    this.gameState.combo++;
    this.gameState.targetsRemaining--;

    if (this.gameState.combo > this.gameState.maxCombo) {
      this.gameState.maxCombo = this.gameState.combo;
    }

    // Calculate score
    const settings = this.difficultySettings[this.gameState.difficulty];
    const baseScore = Math.max(100 - Math.floor(reactionTime / 10), 10);
    const comboBonus = this.gameState.combo > 1 ? this.gameState.combo * 10 : 0;
    const scoreGain = Math.floor(baseScore * settings.scoreMultiplier + comboBonus);

    this.gameState.score += scoreGain;

    // Update UI
    this.updateUI();

    // Show score popup
    this.showScorePopup(target, scoreGain, reactionTime);

    // Hit animation
    gsap.to(target, {
      scale: 1.5,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        if (target.parentNode) {
          target.remove();
        }
      },
    });

    // Create explosion effect
    this.createExplosion(target);

    // Play hit sound
    this.sounds.hit.play();

    // Combo sound
    if (this.gameState.combo > 0 && this.gameState.combo % 5 === 0) {
      this.sounds.combo.play();
      this.showComboMessage();
    }

    // Slow-mo effect on good hits
    if (reactionTime < 300) {
      this.triggerSlowMo();
    }

    // Spawn next target
    const spawnDelay = settings.spawnDelay * (1 - this.gameState.combo * 0.02);
    setTimeout(() => this.spawnTarget(), Math.max(spawnDelay, 300));
  }

  missTarget(target) {
    if (!target || !target.parentNode) return;

    // Update stats
    this.gameState.misses++;
    this.gameState.combo = 0;
    this.gameState.targetsRemaining--;

    // Update UI
    this.updateUI();

    // Miss animation
    gsap.to(target, {
      scale: 0.5,
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        if (target.parentNode) {
          target.remove();
        }
      },
    });

    // Play miss sound
    this.sounds.miss.play();

    // Screen shake
    this.shakeScreen();

    // Spawn next target
    const settings = this.difficultySettings[this.gameState.difficulty];
    setTimeout(() => this.spawnTarget(), settings.spawnDelay);
  }

  handleClick(e) {
    // Miss click (clicked on background)
    if (e.target.classList.contains('aim400kg-game') || e.target.id === 'gameCanvas') {
      this.gameState.misses++;
      this.gameState.combo = 0;
      this.sounds.miss.play();
      this.updateUI();
      this.shakeScreen();
    }
  }

  createExplosion(target) {
    const rect = target.getBoundingClientRect();
    const explosion = document.createElement('div');
    explosion.className = 'target-explosion';
    explosion.style.left = `${rect.left + rect.width / 2}px`;
    explosion.style.top = `${rect.top + rect.height / 2}px`;

    this.gameContainer.appendChild(explosion);

    // Particle effect
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'explosion-particle';
      explosion.appendChild(particle);

      const angle = (i / 8) * Math.PI * 2;
      const distance = 50 + Math.random() * 50;

      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    }

    setTimeout(() => explosion.remove(), 1000);
  }

  showScorePopup(target, score, reactionTime) {
    const rect = target.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'score-popup';

    let message = `+${score}`;
    if (reactionTime < 200) {
      message += ' PERFECT!';
      popup.classList.add('perfect');
    } else if (reactionTime < 400) {
      message += ' GREAT!';
      popup.classList.add('great');
    }

    popup.textContent = message;
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;

    this.gameContainer.appendChild(popup);

    gsap.fromTo(
      popup,
      { y: 0, opacity: 1, scale: 0.5 },
      {
        y: -50,
        opacity: 0,
        scale: 1.2,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => popup.remove(),
      }
    );
  }

  showComboMessage() {
    const message = document.createElement('div');
    message.className = 'combo-message';
    message.textContent = `${this.gameState.combo}x COMBO!`;

    this.gameContainer.appendChild(message);

    gsap.fromTo(
      message,
      { scale: 0, rotation: -10 },
      {
        scale: 1.2,
        rotation: 0,
        duration: 0.3,
        ease: 'back.out(2)',
        onComplete: () => {
          gsap.to(message, {
            scale: 0,
            opacity: 0,
            duration: 0.2,
            delay: 0.5,
            onComplete: () => message.remove(),
          });
        },
      }
    );

    // Confetti effect
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
    });
  }

  triggerSlowMo() {
    // Slow down time for dramatic effect
    gsap.to(this.renderer.domElement, {
      filter: 'saturate(1.5) contrast(1.2)',
      duration: 0.1,
    });

    gsap.to(this.renderer.domElement, {
      filter: 'saturate(1) contrast(1)',
      duration: 0.3,
      delay: 0.1,
    });

    // Time scale effect
    gsap.globalTimeline.timeScale(0.3);
    setTimeout(() => {
      gsap.globalTimeline.timeScale(1);
    }, 200);
  }

  shakeScreen() {
    const intensity = 10;
    gsap.to(this.gameContainer, {
      x: `+=${intensity}`,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(this.gameContainer, { x: 0 });
      },
    });
  }

  updateUI() {
    const accuracy =
      this.gameState.hits + this.gameState.misses > 0
        ? Math.round((this.gameState.hits / (this.gameState.hits + this.gameState.misses)) * 100)
        : 100;

    document.getElementById('score').textContent = this.gameState.score;
    document.getElementById('combo').textContent = `${this.gameState.combo}x`;
    document.getElementById('targets').textContent = this.gameState.targetsRemaining;
    document.getElementById('accuracy').textContent = `${accuracy}%`;

    // Animate combo counter
    if (this.gameState.combo > 0) {
      gsap.to('#combo', {
        scale: 1.2,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  }

  endGame() {
    this.gameState.isPlaying = false;
    this.gameState.endTime = Date.now();

    // Stop sounds
    this.sounds.ambient.stop();

    // Calculate final stats
    const totalTime = (this.gameState.endTime - this.gameState.startTime) / 1000;
    const avgReactionTime =
      this.gameState.reactionTimes.length > 0
        ? Math.round(
            this.gameState.reactionTimes.reduce((a, b) => a + b, 0) /
              this.gameState.reactionTimes.length
          )
        : 0;
    const accuracy =
      this.gameState.hits + this.gameState.misses > 0
        ? Math.round((this.gameState.hits / (this.gameState.hits + this.gameState.misses)) * 100)
        : 0;

    // Fade out game
    gsap.to(this.gameContainer, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        this.cleanupGame();
        this.showResults({
          totalTime,
          avgReactionTime,
          accuracy,
        });
      },
    });
  }

  cleanupGame() {
    // Stop Three.js animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Clean up Three.js
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Remove game container
    if (this.gameContainer && this.gameContainer.parentNode) {
      this.gameContainer.remove();
    }

    // Clear timeouts
    if (this.targetTimeout) {
      clearTimeout(this.targetTimeout);
    }
  }

  showResults(stats) {
    // Calculate player rank
    const rank = this.calculateRank(stats.accuracy, stats.avgReactionTime);

    // Create results modal
    this.resultsModal = document.createElement('div');
    this.resultsModal.className = 'aim400kg-results-modal';
    this.resultsModal.innerHTML = `
      <div class="results-container">
        <div class="results-header">
          <h2 class="results-title">РЕЗУЛЬТАТЫ ТРЕНИРОВКИ</h2>
          <div class="rank-display ${rank.class}">
            <span class="rank-icon">${rank.icon}</span>
            <span class="rank-text">${rank.title}</span>
          </div>
        </div>

        <div class="results-stats">
          <div class="stat-row">
            <div class="stat-box">
              <span class="stat-label">Точность</span>
              <span class="stat-value highlight">${stats.accuracy}%</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Ср. реакция</span>
              <span class="stat-value">${stats.avgReactionTime}ms</span>
            </div>
          </div>
          
          <div class="stat-row">
            <div class="stat-box">
              <span class="stat-label">Попадания</span>
              <span class="stat-value success">${this.gameState.hits}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Промахи</span>
              <span class="stat-value error">${this.gameState.misses}</span>
            </div>
          </div>
          
          <div class="stat-row">
            <div class="stat-box">
              <span class="stat-label">Макс. комбо</span>
              <span class="stat-value">${this.gameState.maxCombo}x</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Общий счёт</span>
              <span class="stat-value highlight">${this.gameState.score}</span>
            </div>
          </div>
          
          <div class="stat-row">
            <div class="stat-box full-width">
              <span class="stat-label">Время игры</span>
              <span class="stat-value">${stats.totalTime.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <canvas id="accuracyChart"></canvas>
        </div>

        <div class="results-message">
          <p class="message-text">${rank.message}</p>
        </div>

        <div class="results-actions">
          <button class="action-btn play-again">
            <span>Играть снова</span>
          </button>
          <button class="action-btn share-results">
            <span>Поделиться</span>
          </button>
          <button class="action-btn close-results">
            <span>Закрыть</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.resultsModal);

    // Animate entrance
    gsap.fromTo(this.resultsModal, { opacity: 0 }, { opacity: 1, duration: 0.3 });

    gsap.fromTo(
      '.results-container',
      { scale: 0.8, y: 50 },
      {
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        onComplete: () => {
          this.createChart(stats.accuracy);
          this.animateStats();
        },
      }
    );

    // Celebration effects for good results
    if (stats.accuracy >= 80 || rank.class === 'god' || rank.class === 'legend') {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 500);
    }

    // Event listeners
    const playAgainBtn = this.resultsModal.querySelector('.play-again');
    playAgainBtn.addEventListener('click', () => {
      this.closeResults();
      this.trigger();
    });

    const shareBtn = this.resultsModal.querySelector('.share-results');
    shareBtn.addEventListener('click', () => this.shareResults(stats, rank));

    const closeBtn = this.resultsModal.querySelector('.close-results');
    closeBtn.addEventListener('click', () => this.closeResults());
  }

  calculateRank(accuracy, avgReactionTime) {
    if (accuracy >= 90 && avgReactionTime < 300) {
      return {
        title: 'AIM GOD',
        icon: '👑',
        class: 'god',
        message:
          'Невероятно! Ты настоящий бог прицеливания! Твоя реакция и точность на высшем уровне!',
      };
    }
    if (accuracy >= 80 && avgReactionTime < 400) {
      return {
        title: 'ЛЕГЕНДА',
        icon: '🔥',
        class: 'legend',
        message: 'Отличный результат! Ты показал выдающиеся навыки стрельбы!',
      };
    }
    if (accuracy >= 70 && avgReactionTime < 500) {
      return {
        title: 'МАСТЕР',
        icon: '⭐',
        class: 'master',
        message: 'Хорошая работа! Твои навыки впечатляют, продолжай тренироваться!',
      };
    }
    if (accuracy >= 60 && avgReactionTime < 600) {
      return {
        title: 'Нормально, Джонни',
        icon: '👍',
        class: 'normal',
        message: 'Неплохо! У тебя есть потенциал, нужно больше практики!',
      };
    }
    if (accuracy >= 50) {
      return {
        title: 'НОВИЧОК',
        icon: '🎯',
        class: 'novice',
        message: 'Есть над чем работать! Не сдавайся, с практикой придёт мастерство!',
      };
    }
    return {
      title: 'Ну это совсем стыдно',
      icon: '😅',
      class: 'shame',
      message: 'Эм... Может, попробуешь ещё раз? Уверен, в следующий раз будет лучше!',
    };
  }

  createChart(accuracy) {
    const ctx = document.getElementById('accuracyChart').getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Попадания', 'Промахи'],
        datasets: [
          {
            data: [this.gameState.hits, this.gameState.misses],
            backgroundColor: ['rgba(0, 255, 136, 0.8)', 'rgba(255, 71, 87, 0.8)'],
            borderColor: ['rgba(0, 255, 136, 1)', 'rgba(255, 71, 87, 1)'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
                family: 'Roboto',
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
        },
      },
    });
  }

  animateStats() {
    // Animate stat values
    const statValues = this.resultsModal.querySelectorAll('.stat-value');
    statValues.forEach((stat, index) => {
      gsap.fromTo(
        stat,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          delay: index * 0.1,
          ease: 'back.out(1.7)',
        }
      );
    });

    // Animate rank display
    gsap.fromTo(
      '.rank-display',
      { scale: 0, rotation: -180 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'back.out(2)',
      }
    );
  }

  shareResults(stats, rank) {
    const text =
      `🎯 AIM 400kg - ${rank.title}\n` +
      `Точность: ${stats.accuracy}%\n` +
      `Средняя реакция: ${stats.avgReactionTime}ms\n` +
      `Счёт: ${this.gameState.score}\n` +
      `Сложность: ${this.gameState.difficulty}`;

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      this.toast.success('Результаты скопированы!', null, 2000);

      // Animate button
      const shareBtn = this.resultsModal.querySelector('.share-results');
      gsap.to(shareBtn, {
        scale: 1.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    });
  }

  closeResults() {
    if (this.chart) {
      this.chart.destroy();
    }

    gsap.to(this.resultsModal, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        if (this.resultsModal && this.resultsModal.parentNode) {
          this.resultsModal.remove();
        }
      },
    });
  }
}
