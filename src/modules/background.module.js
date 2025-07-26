import Module from '../core/module';
import { randomGradient } from '../utils/utils';
import ToastNotification from '../utils/notifications';

export default class BackgroundModule extends Module {
  constructor() {
    super('Random Background Color', 'Random Background Color');
    this.currentGradient = null;
    this.currentColors = [];
    this.toast = new ToastNotification();
    this.activePalettes = new Map(); // Используем Map для отслеживания палитр
    this.paletteIdCounter = 0;
  }

  trigger() {
    const appBody = document.querySelector('body');
    const { gradient: newGradient, colors } = this.generateGradientWithColors();

    if (!newGradient || !Array.isArray(colors) || colors.length === 0) {
      console.error('[ERROR] Invalid gradient or colors:', newGradient, colors);
      return;
    }

    // Очистка всех старых палитр
    this.clearAllPalettes();

    this.applyGradientWithTransition(appBody, newGradient);
    this.showGradientToast(newGradient, colors);

    // Сохраняем текущие данные
    this.currentGradient = newGradient;
    this.currentColors = colors;

    // Задержка для применения градиента перед показом палитр
    setTimeout(() => {
      this.displayGradientPalettes(colors, newGradient);
    }, 200);
  }

  generateGradientWithColors() {
    const result = randomGradient();

    if (
      !result ||
      typeof result !== 'object' ||
      typeof result.gradient !== 'string' ||
      !Array.isArray(result.colors)
    ) {
      return {
        gradient: 'linear-gradient(45deg, #000, #111)',
        colors: [],
      };
    }

    return result;
  }

  applyGradientWithTransition(element, gradient) {
    element.style.transition = 'background 0.8s ease';
    element.style.background = gradient;
    element.classList.add('gradient-applied');
  }

  showGradientToast(gradient, colors) {
    const count = colors.length;
    const message = `Применена схема с ${count} цветами`;
    this.toast.show('Градиент изменен', message, 'success', 3000, gradient);
  }

  clearAllPalettes() {
    // Удаляем все существующие палитры
    document.querySelectorAll('.color-palette-item').forEach((el) => {
      el.remove();
    });
    this.activePalettes.clear();
    console.log('Cleared all existing palettes');
  }

  displayGradientPalettes(colors, gradientString) {
    if (!Array.isArray(colors) || colors.length === 0) return;

    console.log(`Creating palettes for ${colors.length} colors`);
    console.log(`Gradient string: ${gradientString}`);

    // Парсим градиент для получения направления
    const gradientInfo = this.parseGradient(gradientString);
    console.log(`Parsed gradient info:`, gradientInfo);

    // Используем метод сэмплирования цветов с canvas
    this.createGradientCanvas(gradientString, colors);
  }

  createGradientCanvas(gradientString, colors) {
    // Создаем невидимый canvas для анализа градиента
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.visibility = 'hidden';
    canvas.style.zIndex = '-1';

    document.body.appendChild(canvas);

    // Создаем градиент на canvas
    const gradient = this.createCanvasGradient(ctx, gradientString, canvas.width, canvas.height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Анализируем где находятся цвета и размещаем палитры
    this.findColorPositionsOnCanvas(ctx, colors, canvas.width, canvas.height);

    // Удаляем canvas через небольшую задержку
    setTimeout(() => {
      if (canvas.parentNode) {
        canvas.remove();
      }
    }, 100);
  }

  createCanvasGradient(ctx, gradientString, width, height) {
    // Парсим параметры градиента
    const angleMatch = gradientString.match(/(\d+)deg/);
    const angle = angleMatch ? parseInt(angleMatch[1]) : 45;

    console.log(`Creating canvas gradient with angle: ${angle}deg`);

    // Конвертируем угол в координаты для canvas градиента
    const radians = (angle - 90) * (Math.PI / 180); // CSS 0deg = вверх, canvas 0rad = право

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.sqrt(width * width + height * height) / 2;

    const x1 = centerX - Math.cos(radians) * radius;
    const y1 = centerY - Math.sin(radians) * radius;
    const x2 = centerX + Math.cos(radians) * radius;
    const y2 = centerY + Math.sin(radians) * radius;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

    // Используем цвета напрямую из массива вместо парсинга строки
    this.currentColors.forEach((color, index) => {
      const stop = this.currentColors.length > 1 ? index / (this.currentColors.length - 1) : 0;
      // Конвертируем HSL в RGB для canvas
      const rgbColor = this.hslToRgb(color.hsl);
      console.log(`Adding color stop ${stop}: ${rgbColor} (from ${color.hsl})`);
      gradient.addColorStop(stop, rgbColor);
    });

    return gradient;
  }

  hslToRgb(hslString) {
    // Парсим HSL строку
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '#000000';

    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r;
    let g;
    let b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  findColorPositionsOnCanvas(ctx, colors, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    colors.forEach((color, colorIndex) => {
      const targetRgb = this.hexToRgb(color.hex);
      if (!targetRgb) return;

      const positions = [];
      const tolerance = 30;

      // Определяем безопасную зону для палитр (с отступами от краев)
      const safeZone = {
        left: 60,
        top: 60,
        right: width - 160,
        bottom: height - 80,
      };

      // Сэмплируем точки на canvas для поиска цвета
      const step = 15; // Уменьшил шаг для более точного поиска

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];

          // Вычисляем расстояние между цветами
          const colorDistance = Math.sqrt(
            (r - targetRgb.r) ** 2 + (g - targetRgb.g) ** 2 + (b - targetRgb.b) ** 2
          );

          // Сохраняем позицию с информацией о расстоянии и находится ли в безопасной зоне
          const isInSafeZone =
            x >= safeZone.left && x <= safeZone.right && y >= safeZone.top && y <= safeZone.bottom;

          positions.push({
            x,
            y,
            distance: colorDistance,
            inSafeZone: isInSafeZone,
            exactMatch: colorDistance <= tolerance,
          });
        }
      }

      console.log(`Analyzed ${positions.length} positions for color ${color.hex}`);

      // Находим лучшую позицию
      const bestPosition = this.findBestPosition(positions, color.hex);

      if (bestPosition) {
        // Создаем палитру в найденной позиции
        const paletteId = `gradient-palette-${this.paletteIdCounter++}`;
        const palette = this.createColorPalette({
          hex: color.hex,
          position: bestPosition,
          index: colorIndex,
          id: paletteId,
          title: `Цвет ${colorIndex + 1}`,
        });

        if (palette) {
          this.activePalettes.set(paletteId, palette);

          setTimeout(() => {
            if (palette.parentNode) {
              palette.style.opacity = '1';
              palette.style.transform = 'scale(1) translateY(0)';
            }
          }, colorIndex * 150);
        }
      } else {
        // Если не нашли подходящую позицию, используем fallback
        console.log(`No suitable position found for color ${color.hex}, using fallback`);
        this.createFallbackPalette(color, colorIndex);
      }
    });
  }

  findBestPosition(positions, colorHex) {
    if (positions.length === 0) return null;

    // Приоритет 1: Точные совпадения в безопасной зоне
    const exactInSafe = positions.filter((p) => p.exactMatch && p.inSafeZone);
    if (exactInSafe.length > 0) {
      console.log(`Found ${exactInSafe.length} exact matches in safe zone for ${colorHex}`);
      return this.selectRandomPosition(exactInSafe);
    }

    // Приоритет 2: Близкие совпадения в безопасной зоне
    const closeInSafe = positions.filter((p) => p.distance <= 50 && p.inSafeZone);
    if (closeInSafe.length > 0) {
      console.log(`Found ${closeInSafe.length} close matches in safe zone for ${colorHex}`);
      // Сортируем по расстоянию и берем лучшие
      closeInSafe.sort((a, b) => a.distance - b.distance);
      return this.selectRandomPosition(closeInSafe.slice(0, Math.min(10, closeInSafe.length)));
    }

    // Приоритет 3: Любые позиции в безопасной зоне, сортированные по близости цвета
    const anyInSafe = positions.filter((p) => p.inSafeZone);
    if (anyInSafe.length > 0) {
      console.log(`Found ${anyInSafe.length} any positions in safe zone for ${colorHex}`);
      anyInSafe.sort((a, b) => a.distance - b.distance);
      // Берем лучшие 20% позиций
      const topPositions = anyInSafe.slice(0, Math.max(1, Math.floor(anyInSafe.length * 0.2)));
      return this.selectRandomPosition(topPositions);
    }

    // Приоритет 4: Точные совпадения за пределами безопасной зоны, но приводим к границам
    const exactOutside = positions.filter((p) => p.exactMatch && !p.inSafeZone);
    if (exactOutside.length > 0) {
      console.log(`Found exact matches outside safe zone for ${colorHex}, adjusting position`);
      const pos = this.selectRandomPosition(exactOutside);
      return this.adjustPositionToSafeZone(pos);
    }

    // Приоритет 5: Лучшее что есть, приведенное к безопасной зоне
    console.log(`Using best available position for ${colorHex}`);
    positions.sort((a, b) => a.distance - b.distance);
    return this.adjustPositionToSafeZone(positions[0]);
  }

  selectRandomPosition(positions) {
    return positions[Math.floor(Math.random() * positions.length)];
  }

  adjustPositionToSafeZone(position) {
    const safeZone = {
      left: 60,
      top: 60,
      right: window.innerWidth - 160,
      bottom: window.innerHeight - 80,
    };

    return {
      x: Math.max(safeZone.left, Math.min(position.x, safeZone.right)),
      y: Math.max(safeZone.top, Math.min(position.y, safeZone.bottom)),
      adjusted: true,
    };
  }

  createFallbackPalette(color, colorIndex) {
    const viewport = { width: window.innerWidth, height: window.innerHeight };

    // Безопасная зона для палитр
    const safeZone = {
      left: 60,
      top: 60,
      right: viewport.width - 160,
      bottom: viewport.height - 80,
    };

    // Интеллигентное распределение в безопасной зоне
    let x;
    let y;

    if (this.currentColors.length <= 4) {
      // Для малого количества цветов - по углам безопасной зоны
      const positions = [
        { x: safeZone.left + 20, y: safeZone.top + 20 },
        { x: safeZone.right - 20, y: safeZone.top + 20 },
        { x: safeZone.left + 20, y: safeZone.bottom - 20 },
        { x: safeZone.right - 20, y: safeZone.bottom - 20 },
      ];
      const pos = positions[colorIndex % positions.length];
      x = pos.x;
      y = pos.y;
    } else {
      // Для большого количества - по диагонали в безопасной зоне
      const progress = colorIndex / Math.max(this.currentColors.length - 1, 1);
      x = safeZone.left + (safeZone.right - safeZone.left) * progress;
      y = safeZone.top + (safeZone.bottom - safeZone.top) * progress;

      // Добавляем небольшое смещение чтобы избежать наложения
      const offsetAngle = colorIndex * 45 * (Math.PI / 180);
      const offsetRadius = 40;
      x += Math.cos(offsetAngle) * offsetRadius;
      y += Math.sin(offsetAngle) * offsetRadius;

      // Убеждаемся что остаемся в безопасной зоне
      x = Math.max(safeZone.left, Math.min(x, safeZone.right));
      y = Math.max(safeZone.top, Math.min(y, safeZone.bottom));
    }

    const paletteId = `gradient-palette-${this.paletteIdCounter++}`;
    const palette = this.createColorPalette({
      hex: color.hex,
      position: { x, y },
      index: colorIndex,
      id: paletteId,
      title: `Цвет ${colorIndex + 1} (безопасная зона)`,
    });

    if (palette) {
      this.activePalettes.set(paletteId, palette);

      setTimeout(() => {
        if (palette.parentNode) {
          palette.style.opacity = '1';
          palette.style.transform = 'scale(1) translateY(0)';
        }
      }, colorIndex * 150);
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  showDebugGradientLine(gradientInfo) {
    // Удаляем предыдущую отладочную линию
    const existingLine = document.getElementById('debug-gradient-line');
    if (existingLine) existingLine.remove();

    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const line = this.getGradientLine(gradientInfo.angle, viewport);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'debug-gradient-line';
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '10000';

    const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineElement.setAttribute('x1', line.start.x);
    lineElement.setAttribute('y1', line.start.y);
    lineElement.setAttribute('x2', line.end.x);
    lineElement.setAttribute('y2', line.end.y);
    lineElement.setAttribute('stroke', 'red');
    lineElement.setAttribute('stroke-width', '3');
    lineElement.setAttribute('stroke-dasharray', '10,5');

    svg.appendChild(lineElement);
    document.body.appendChild(svg);

    // Удаляем через 5 секунд
    setTimeout(() => {
      if (svg.parentNode) svg.remove();
    }, 5000);
  }

  parseGradient(gradientString) {
    const angleMatch = gradientString.match(/(\d+)deg/);
    const angle = angleMatch ? parseInt(angleMatch[1]) : 45;

    // Нормализуем угол к диапазону 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;

    return {
      angle: normalizedAngle,
      radians: (normalizedAngle * Math.PI) / 180,
      type: 'linear',
    };
  }

  calculateColorPosition(gradientInfo, colorIndex, totalColors) {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    console.log(
      `Calculating position for color ${colorIndex} of ${totalColors}, angle: ${gradientInfo.angle}deg`
    );

    // Прогресс цвета в градиенте (от 0 до 1)
    const progress = totalColors > 1 ? colorIndex / (totalColors - 1) : 0.5;

    // Вычисляем начальную и конечную точки градиента
    const gradientLine = this.getGradientLine(gradientInfo.angle, viewport);

    console.log(
      `Gradient line: start(${gradientLine.start.x}, ${gradientLine.start.y}) -> end(${gradientLine.end.x}, ${gradientLine.end.y})`
    );

    // Интерполируем позицию вдоль линии градиента
    const baseX = gradientLine.start.x + (gradientLine.end.x - gradientLine.start.x) * progress;
    const baseY = gradientLine.start.y + (gradientLine.end.y - gradientLine.start.y) * progress;

    // Добавляем небольшое смещение чтобы палитры не перекрывались
    // Смещение перпендикулярно направлению градиента
    const perpAngle = (gradientInfo.angle + 90) * (Math.PI / 180);
    const offsetDistance = (colorIndex % 2 === 0 ? 1 : -1) * 30; // Чередуем стороны

    const finalX = Math.max(
      60,
      Math.min(baseX + Math.cos(perpAngle) * offsetDistance, viewport.width - 160)
    );
    const finalY = Math.max(
      60,
      Math.min(baseY + Math.sin(perpAngle) * offsetDistance, viewport.height - 80)
    );

    console.log(`Color ${colorIndex} positioned at (${finalX}, ${finalY})`);

    return { x: finalX, y: finalY };
  }

  getGradientLine(angle, viewport) {
    // CSS градиент направления:
    // 0deg = снизу вверх (к верху)
    // 90deg = слева направо (к правому краю)
    // 180deg = сверху вниз (к низу)
    // 270deg = справа налево (к левому краю)

    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;

    // Определяем начальную и конечную точки на основе угла
    let start;
    let end;

    if (angle >= 0 && angle < 90) {
      // Направление от нижнего левого к верхнему правому
      const ratio = angle / 90;
      start = {
        x: centerX - viewport.width * 0.4 * (1 - ratio),
        y: centerY + viewport.height * 0.4,
      };
      end = {
        x: centerX + viewport.width * 0.4 * (1 - ratio),
        y: centerY - viewport.height * 0.4,
      };
    } else if (angle >= 90 && angle < 180) {
      // Направление от нижнего правого к верхнему левому
      const ratio = (angle - 90) / 90;
      start = {
        x: centerX + viewport.width * 0.4,
        y: centerY + viewport.height * 0.4 * (1 - ratio),
      };
      end = {
        x: centerX - viewport.width * 0.4,
        y: centerY - viewport.height * 0.4 * (1 - ratio),
      };
    } else if (angle >= 180 && angle < 270) {
      // Направление от верхнего правого к нижнему левому
      const ratio = (angle - 180) / 90;
      start = {
        x: centerX + viewport.width * 0.4 * (1 - ratio),
        y: centerY - viewport.height * 0.4,
      };
      end = {
        x: centerX - viewport.width * 0.4 * (1 - ratio),
        y: centerY + viewport.height * 0.4,
      };
    } else {
      // Направление от верхнего левого к нижнему правому
      const ratio = (angle - 270) / 90;
      start = {
        x: centerX - viewport.width * 0.4,
        y: centerY - viewport.height * 0.4 * (1 - ratio),
      };
      end = {
        x: centerX + viewport.width * 0.4,
        y: centerY + viewport.height * 0.4 * (1 - ratio),
      };
    }

    return { start, end };
  }

  createColorPalette({ hex, position, index, id, title }) {
    // Проверяем, не существует ли уже палитра с таким ID
    if (this.activePalettes.has(id)) {
      console.warn(`Palette with ID ${id} already exists`);
      return null;
    }

    const palette = document.createElement('div');
    palette.className = 'color-palette-item color-palette';
    palette.id = id;
    palette.dataset.colorIndex = index;

    const content = document.createElement('div');
    content.className = 'palette-content';

    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.background = hex;

    const code = document.createElement('span');
    code.className = 'color-code';
    code.textContent = hex.toUpperCase();

    content.appendChild(swatch);
    content.appendChild(code);
    palette.appendChild(content);

    // Добавляем тултип
    const tooltip = document.createElement('div');
    tooltip.className = 'copy-indicator';
    tooltip.textContent = title;
    palette.appendChild(tooltip);

    // Обработчик клика для копирования
    palette.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      this.copyColorToClipboard(hex, palette);
    });

    // Позиционирование
    palette.style.position = 'fixed';
    palette.style.left = `${position.x}px`;
    palette.style.top = `${position.y}px`;
    palette.style.zIndex = '9999';
    palette.style.opacity = '0';
    palette.style.transform = 'scale(0.8) translateY(20px)';
    palette.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    palette.style.cursor = 'pointer';

    // Добавляем в DOM
    document.body.appendChild(palette);

    // Автоудаление через 8 секунд
    setTimeout(() => {
      this.removePalette(id);
    }, 8000);

    console.log(`Created palette ${id} at position (${position.x}, ${position.y})`);
    return palette;
  }

  copyColorToClipboard(hex, paletteElement) {
    navigator.clipboard
      .writeText(hex)
      .then(() => {
        this.toast.show('Цвет скопирован', hex, 'success', 1500);

        // Анимация успешного копирования
        paletteElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
          if (paletteElement.parentNode) {
            paletteElement.style.transform = 'scale(1)';
          }
        }, 200);
      })
      .catch((err) => {
        console.error('Failed to copy color:', err);
        this.toast.show('Ошибка копирования', 'Не удалось скопировать цвет', 'error', 2000);
      });
  }

  removePalette(paletteId) {
    const palette = this.activePalettes.get(paletteId);
    if (palette && palette.parentNode) {
      palette.style.opacity = '0';
      palette.style.transform = 'scale(0.8) translateY(-20px)';

      setTimeout(() => {
        if (palette.parentNode) {
          palette.remove();
        }
        this.activePalettes.delete(paletteId);
      }, 300);

      console.log(`Removed palette ${paletteId}`);
    }
  }
}
