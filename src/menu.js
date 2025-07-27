// @ts-nocheck

import Menu from './core/menu';

export default class ContextMenu extends Menu {
  constructor(selector) {
    super(selector);
    this.el = document.querySelector(selector);
    if (!this.el) {
      this.el = document.createElement('ul');
      this.el.classList.add('menu');
      document.body.appendChild(this.el);
    }

    this.modules = [];
    this.visible = false;

    // Обработка клика по пункту меню
    this.el.addEventListener('click', (event) => {
      const item = event.target.closest('.menu-item');
      console.log('[DEBUG] Clicked item:', item);
      if (!item) return;

      const { index } = item.dataset;
      console.log('[DEBUG] Index:', index);
      const module = this.modules[index];
      console.log('[DEBUG] Module:', module);
      if (module) {
        module.trigger();
        this.close();
      }
    });

    // Создаем обработчики, но не добавляем их сразу
    this.handleOutsideClick = (event) => {
      if (!this.el.contains(event.target) && this.visible) {
        this.close();
      }
    };

    this.handleEscapeKey = (event) => {
      if (event.key === 'Escape' && this.visible) {
        this.close();
      }
    };
  }

  // ДОБАВИЛИ: Проверка мобильного устройства
  isMobileDevice() {
    return window.innerWidth <= 768;
  }

  addGradientChangeEffect() {
    // Добавляем класс для анимации смены градиента
    this.el.classList.add('gradient-changing');

    // Убираем класс после анимации
    setTimeout(() => {
      this.el.classList.remove('gradient-changing');
    }, 1000);
  }

  open(x, y) {
    if (this.modules.length === 0) return;

    // Добавляем в DOM до отрисовки
    if (!document.body.contains(this.el)) {
      document.body.appendChild(this.el);
    }

    // ДОБАВИЛИ: Сброс классов принудительного позиционирования
    this.el.classList.remove('force-center', 'force-bottom', 'force-top');
    this.el.innerHTML = '';

    // Создаем элементы меню
    this.modules.forEach((module, index) => {
      const $item = document.createElement('li');
      $item.textContent = module.type;
      $item.classList.add('menu-item');
      $item.dataset.index = index;
      $item.style.animationDelay = `${index * 80}ms`;

      // Специальная обработка для Background модуля
      if (module.type && module.type.includes('Background')) {
        $item.classList.add('background-item');
        this.enhanceBackgroundMenuItem($item);
      } else {
        this.enhanceMenuItem($item);
      }

      this.el.appendChild($item);
    });

    // Позиционирование меню
    this.positionMenu(x, y);

    // Показываем меню с анимацией
    this.el.classList.add('open');
    this.visible = true;

    // Добавляем обработчики событий только после открытия меню
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
      document.addEventListener('keydown', this.handleEscapeKey);
    }, 100);

    // ИЗМЕНИЛИ: Запуск glow эффекта только на десктопе
    if (!this.isMobileDevice()) {
      const glowDelay = this.modules.length * 80 + 200;
      setTimeout(() => {
        if (this.visible) {
          this.el.classList.add('glow');
        }
      }, glowDelay);
    }
  }

  enhanceBackgroundMenuItem(item) {
    // ИЗМЕНИЛИ: Hover эффекты только на десктопе
    if (this.isMobileDevice()) return;

    // Специальные hover эффекты для Background пункта
    item.addEventListener('mouseenter', () => {
      // Показываем мини превью
      this.showGradientPreview(item);
    });

    item.addEventListener('mouseleave', () => {
      // Убираем превью
      this.hideGradientPreview(item);
    });
  }

  enhanceMenuItem(item) {
    // ИЗМЕНИЛИ: Hover эффекты только на десктопе
    if (this.isMobileDevice()) return;

    // Обычные эффекты для остальных пунктов
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateX(6px) scale(1.02)';
      item.style.textShadow = '0 0 12px rgba(255, 255, 255, 0.4)';
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateX(0) scale(1)';
      item.style.textShadow = 'none';
    });
  }

  showGradientPreview(item) {
    // Создаем маленькое превью градиента
    const preview = document.createElement('div');
    preview.className = 'gradient-mini-preview';

    item.appendChild(preview);

    // Показываем превью с небольшой задержкой
    setTimeout(() => {
      preview.style.opacity = '1';
    }, 100);
  }

  hideGradientPreview(item) {
    const preview = item.querySelector('.gradient-mini-preview');
    if (preview) {
      preview.style.opacity = '0';
      setTimeout(() => {
        if (preview.parentNode) {
          preview.remove();
        }
      }, 300);
    }
  }

  positionMenu(x, y) {
    // ДОБАВИЛИ: Центрирование на мобильных устройствах
    if (this.isMobileDevice()) {
      this.el.classList.add('force-center');
      this.el.style.left = '';
      this.el.style.top = '';
      return;
    }

    // ОРИГИНАЛЬНАЯ логика для десктопа
    const { offsetWidth, offsetHeight } = this.el;
    const padding = 20;
    const maxX = window.innerWidth - offsetWidth - padding;
    const maxY = window.innerHeight - offsetHeight - padding;

    let finalX = Math.min(x, maxX);
    let finalY = Math.min(y, maxY);

    if (x + offsetWidth > window.innerWidth - padding) {
      finalX = Math.max(x - offsetWidth, padding);
    }

    if (y + offsetHeight > window.innerHeight - padding) {
      finalY = Math.max(y - offsetHeight, padding);
    }

    this.el.style.left = `${finalX}px`;
    this.el.style.top = `${finalY}px`;
  }

  close() {
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscapeKey);

    // ДОБАВИЛИ: Убираем классы принудительного позиционирования
    this.el.classList.remove(
      'open',
      'glow',
      'gradient-changing',
      'force-center',
      'force-bottom',
      'force-top'
    );
    this.visible = false;
  }

  add(module) {
    this.modules.push(module);
  }
}
