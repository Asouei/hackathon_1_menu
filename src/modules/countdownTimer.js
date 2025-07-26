// countdownTimer.js
import * as THREE from 'three';

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
    this.isRunning = false;

    // Three.js элементы
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.morphingShape = null;
    this.glowParticles = null;

    // Drag & drop
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.boundHandleDrag = this.handleDrag.bind(this);
    this.boundHandleDragEnd = this.handleDragEnd.bind(this);
  }

  trigger() {
    if (!this.modal) this.createModal();
    this.modal.style.display = 'flex';
    setTimeout(() => this.initThreeJS(), 100);
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'timer-modal';

    this.modal.innerHTML = `
        <div class="timer-header">
          <div class="drag-handle">⋮⋮</div>
          <button class="close-timer">×</button>
        </div>
        <div class="threejs-container"></div>
        <div class="circular-container">
          <div class="circle" id="hours">
            <svg>
              <circle class="bg" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="0"/>
              <circle class="progress" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="283"/>
            </svg>
            <div class="text">00<span>HOURS</span></div>
          </div>
          <div class="circle" id="minutes">
            <svg>
              <circle class="bg" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="0"/>
              <circle class="progress" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="283"/>
            </svg>
            <div class="text">00<span>MINUTES</span></div>
          </div>
          <div class="circle" id="seconds">
            <svg>
              <circle class="bg" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="0"/>
              <circle class="progress" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="283"/>
            </svg>
            <div class="text">00<span>SECONDS</span></div>
          </div>
        </div>
        <div class="timer-controls">
          <input type="text" placeholder="hh:mm:ss" value="00:05:00"/>
          <button class="start">▶ Start</button>
          <button class="stop">⏸ Pause</button>
        </div>
      `;

    document.body.appendChild(this.modal);

    this.input = this.modal.querySelector('input');
    this.startBtn = this.modal.querySelector('.start');
    this.stopBtn = this.modal.querySelector('.stop');
    const closeBtn = this.modal.querySelector('.close-timer');

    ['hours', 'minutes', 'seconds'].forEach((key) => {
      const el = this.modal.querySelector(`#${key}`);
      this.circles[key] = {
        progress: el.querySelector('.progress'),
        text: el.querySelector('.text'),
      };
    });

    this.startBtn.onclick = () => this.toggleTimer();
    this.stopBtn.onclick = () => this.pauseTimer();

    // Исправляем обработчик закрытия
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal();
    }

    this.initDragDrop();
    this.updateButtons();
  }

  parseTimeInput(input) {
    const parts = input.split(':');
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    const s = parseInt(parts[2]) || 0;
    return h * 3600 + m * 60 + s;
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    // Принудительно парсим текущее значение из поля ввода при каждом запуске
    const value = this.parseTimeInput(this.input.value);
    if (!value || value <= 0) return;

    // Если таймер уже был запущен и на паузе, проверяем нужно ли обновить время
    if (this.remaining === 0 || this.totalSeconds === 0) {
      this.totalSeconds = value;
      this.remaining = value;
    }

    this.isRunning = true;
    this.modal.classList.add('running');
    this.updateCircles();
    this.updateButtons();

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.remaining--;
      this.updateCircles();
      this.updateThreeJS();

      if (this.remaining <= 0) {
        this.completeTimer();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.interval);
    this.modal.classList.remove('running');
    this.updateButtons();
  }

  stopTimer() {
    this.isRunning = false;
    this.remaining = 0;
    clearInterval(this.interval);
    this.modal.classList.remove('running');
    this.updateCircles();
    this.updateButtons();
  }

  completeTimer() {
    this.isRunning = false;
    this.remaining = 0;
    clearInterval(this.interval);
    this.modal.classList.remove('running');
    this.updateCircles();
    this.updateButtons();
    this.onTimerComplete();
  }

  updateButtons() {
    if (this.isRunning) {
      this.startBtn.innerHTML = '⏸ Pause';
      this.stopBtn.innerHTML = '⏹ Stop';
    } else if (this.remaining > 0) {
      this.startBtn.innerHTML = '▶ Resume';
      this.stopBtn.innerHTML = '⏹ Stop';
    } else {
      this.startBtn.innerHTML = '▶ Start';
      this.stopBtn.innerHTML = '⏸ Pause';
    }

    this.startBtn.onclick = () => this.toggleTimer();
    this.stopBtn.onclick = () => (this.remaining > 0 ? this.stopTimer() : this.pauseTimer());
  }

  updateCircles() {
    const hours = Math.floor(this.remaining / 3600);
    const minutes = Math.floor((this.remaining % 3600) / 60);
    const seconds = this.remaining % 60;

    const format = (val) => val.toString().padStart(2, '0');

    const totalHours = Math.floor(this.totalSeconds / 3600);

    const calculations = {
      hours: {
        current: hours,
        progress: totalHours > 0 ? (totalHours - hours) / totalHours : 0,
      },
      minutes: {
        current: minutes,
        progress: (60 - minutes) / 60,
      },
      seconds: {
        current: seconds,
        progress: (60 - seconds) / 60,
      },
    };

    Object.entries(this.circles).forEach(([key, { progress, text }]) => {
      const calc = calculations[key];
      const offset = 283 * calc.progress;
      progress.style.strokeDashoffset = `${offset}`;
      text.childNodes[0].nodeValue = format(calc.current);
    });
  }

  // THREE.JS ИНИЦИАЛИЗАЦИЯ
  initThreeJS() {
    const container = this.modal.querySelector('.threejs-container');
    if (!container) {
      console.error('Three.js container not found!');
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x222222, 0.3);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight.position.set(0, 0, 20);
    this.scene.add(pointLight);

    // Создаем морфирующую фигуру
    this.createMorphingShape();

    // Создаем светящиеся частицы
    this.createGlowParticles();

    this.camera.position.set(0, 0, 15);
    this.camera.lookAt(0, 0, 0);

    this.animate();
  }

  createMorphingShape() {
    // Создаем каркасную ленту Мебиуса
    this.createMobiusRibbon();
  }

  createMobiusRibbon() {
    // Параметры ленты Мебиуса
    const points = [];
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;

      // Лента Мебиуса с возможностью деформации
      const radius = 4;
      const x = (radius + Math.cos(t / 2)) * Math.cos(t);
      const y = (radius + Math.cos(t / 2)) * Math.sin(t);
      const z = Math.sin(t / 2);

      points.push(new THREE.Vector3(x, y, z));
    }

    // Создаем сплайн кривую
    const curve = new THREE.CatmullRomCurve3(points, true);

    // Создаем геометрию трубки вокруг кривой
    const tubeGeometry = new THREE.TubeGeometry(curve, segments, 0.15, 16, true);

    // Неоновый материал для каркаса
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x004466,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9,
      wireframe: false,
      shininess: 100,
    });

    this.morphingShape = new THREE.Mesh(tubeGeometry, material);
    this.scene.add(this.morphingShape);

    // Сохраняем кривую для анимации
    this.baseCurve = curve;
    this.basePoints = points.slice();
  }

  createGlowParticles() {
    // Убираем частицы - больше не нужны
    this.glowParticles = null;
  }

  animate() {
    if (!this.renderer || !this.scene) return;

    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    if (this.isRunning) {
      // АКТИВНЫЙ РЕЖИМ - все движется и меняется

      // Камера динамично вращается вокруг фигуры
      const cameraRadius = 12;
      this.camera.position.x = Math.cos(time * 0.3) * cameraRadius;
      this.camera.position.y = Math.sin(time * 0.2) * cameraRadius * 0.5;
      this.camera.position.z = Math.sin(time * 0.25) * cameraRadius;
      this.camera.lookAt(0, 0, 0);

      // Фигура активно деформируется и вращается
      if (this.morphingShape) {
        this.updateActiveMorphing(time);

        // Активное вращение
        this.morphingShape.rotation.x += 0.008;
        this.morphingShape.rotation.y += 0.012;
        this.morphingShape.rotation.z += 0.005;

        // Динамические переливы цвета
        const hue = (time * 0.2) % 1;
        const color = new THREE.Color();
        color.setHSL(hue, 1, 0.6);
        this.morphingShape.material.color = color;
        this.morphingShape.material.emissive = color.clone().multiplyScalar(0.4);

        // Интенсивная пульсация свечения
        this.morphingShape.material.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.4;

        // Пульсация размера
        const scale = 1 + Math.sin(time * 1.5) * 0.15;
        this.morphingShape.scale.setScalar(scale);
      }
    } else {
      // СТАТИЧНЫЙ РЕЖИМ - простой круг, минимальное движение

      // Камера статична
      this.camera.position.set(0, 0, 15);
      this.camera.lookAt(0, 0, 0);

      if (this.morphingShape) {
        // Возвращаем к базовой форме (круг)
        this.updateStaticShape();

        // Очень медленное вращение
        this.morphingShape.rotation.x += 0.001;
        this.morphingShape.rotation.y += 0.002;
        this.morphingShape.rotation.z = 0;

        // Спокойные цвета
        this.morphingShape.material.color.setHex(0x0088ff);
        this.morphingShape.material.emissive.setHex(0x002244);
        this.morphingShape.material.emissiveIntensity = 0.3;

        // Статичный размер
        this.morphingShape.scale.setScalar(1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateActiveMorphing(time) {
    if (!this.morphingShape || !this.basePoints) return;

    // Создаем новые деформированные точки
    const newPoints = [];

    for (let i = 0; i < this.basePoints.length; i++) {
      const point = this.basePoints[i].clone();
      const t = (i / this.basePoints.length) * Math.PI * 2;

      // Множественные волны деформации
      const wave1 = Math.sin(time * 2 + t * 3) * 0.8;
      const wave2 = Math.cos(time * 1.5 + t * 2) * 0.6;
      const wave3 = Math.sin(time * 3 + t * 4) * 0.4;
      const turbulence = Math.sin(time * 5 + t * 8) * 0.3;

      const deformation = wave1 + wave2 + wave3 + turbulence;

      // Применяем деформацию
      const length = point.length();
      point.normalize();
      point.multiplyScalar(length + deformation);

      // Добавляем случайные искажения
      point.x += Math.sin(time * 4 + i * 0.1) * 0.2;
      point.y += Math.cos(time * 3.5 + i * 0.15) * 0.2;
      point.z += Math.sin(time * 2.5 + i * 0.2) * 0.2;

      newPoints.push(point);
    }

    // Создаем новую кривую
    const newCurve = new THREE.CatmullRomCurve3(newPoints, true);

    // Обновляем геометрию
    const newGeometry = new THREE.TubeGeometry(newCurve, 200, 0.15, 16, true);

    this.morphingShape.geometry.dispose();
    this.morphingShape.geometry = newGeometry;
  }

  updateStaticShape() {
    if (!this.morphingShape) return;

    // Создаем статичный круг
    const points = [];
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const radius = 4;

      const x = Math.cos(t) * radius;
      const y = Math.sin(t) * radius;
      const z = 0;

      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points, true);
    const geometry = new THREE.TubeGeometry(curve, segments, 0.15, 16, true);

    this.morphingShape.geometry.dispose();
    this.morphingShape.geometry = geometry;
  }

  updateGlowParticles(time) {
    // Убрали частицы, метод больше не нужен
  }

  updateThreeJS() {
    // Фигура реагирует на общее время
    if (this.morphingShape && this.isRunning) {
      const timeProgress = 1 - this.remaining / this.totalSeconds;

      // При приближении к концу - более интенсивная деформация и свечение
      if (this.remaining <= 30) {
        const intensity = (30 - this.remaining) / 30;
        this.morphingShape.material.emissiveIntensity = 0.6 + intensity * 0.6;
      }

      // Критическое состояние - красное мерцание
      if (this.remaining <= 10) {
        this.morphingShape.material.color.setRGB(1, 0.2, 0.2);
        this.morphingShape.material.emissive.setRGB(0.5, 0.1, 0.1);
        this.morphingShape.material.emissiveIntensity = 1 + Math.sin(Date.now() * 0.02) * 0.5;
      }
    }
  }

  onTimerComplete() {
    // Мощный взрыв неоновой ленты
    if (this.morphingShape) {
      // Ослепительная белая вспышка
      this.morphingShape.material.color.setRGB(3, 3, 3);
      this.morphingShape.material.emissive.setRGB(2, 2, 2);
      this.morphingShape.material.emissiveIntensity = 5;

      // Взрывное увеличение
      this.morphingShape.scale.setScalar(3);

      // Камера отлетает назад от взрыва
      this.camera.position.z = 25;

      setTimeout(() => {
        // Возвращаем к спокойному состоянию
        this.morphingShape.material.color.setHex(0x0088ff);
        this.morphingShape.material.emissive.setHex(0x002244);
        this.morphingShape.material.emissiveIntensity = 0.3;
        this.morphingShape.scale.setScalar(1);
        this.camera.position.z = 15;
      }, 2000);
    }
  }

  // DRAG & DROP
  initDragDrop() {
    const dragHandle = this.modal.querySelector('.drag-handle');
    if (!dragHandle) return;

    dragHandle.addEventListener('mousedown', this.startDrag.bind(this));
  }

  startDrag(e) {
    e.preventDefault();
    this.isDragging = true;

    const rect = this.modal.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;

    document.addEventListener('mousemove', this.boundHandleDrag);
    document.addEventListener('mouseup', this.boundHandleDragEnd);

    this.modal.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }

  handleDrag(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;

    const maxX = window.innerWidth - this.modal.offsetWidth;
    const maxY = window.innerHeight - this.modal.offsetHeight;

    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));

    this.modal.style.left = `${constrainedX}px`;
    this.modal.style.top = `${constrainedY}px`;
    this.modal.style.right = 'auto';
    this.modal.style.bottom = 'auto';
  }

  handleDragEnd(e) {
    this.isDragging = false;

    document.removeEventListener('mousemove', this.boundHandleDrag);
    document.removeEventListener('mouseup', this.boundHandleDragEnd);

    this.modal.style.cursor = '';
    document.body.style.userSelect = '';
  }

  closeModal() {
    // Останавливаем таймер
    this.pauseTimer();

    // Скрываем модальное окно
    if (this.modal) {
      this.modal.style.display = 'none';
    }

    // Очищаем Three.js ресурсы
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }

    // Очищаем ссылки на объекты
    this.morphingShape = null;
    this.glowParticles = null;

    // Удаляем модальное окно из DOM
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
      this.modal = null;
    }
  }
}
