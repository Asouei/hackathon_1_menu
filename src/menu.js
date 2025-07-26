// @ts-nocheck

import Menu from './core/menu';
import Notification from './utils/notifications';

export default class ContextMenu extends Menu {
  constructor(selector) {
    super(selector);
    this.modules = [];
    this.visible = false;
    this.notification = new Notification();

    // Обработка клика по пункту меню
    this.el.addEventListener('click', (event) => {
      const item = event.target.closest('.menu-item');
      if (!item) return;

      const { index } = item.dataset;
      const module = this.modules[index];
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

  open(x, y) {
    if (this.modules.length === 0) return;

    // Добавляем в DOM до отрисовки
    if (!document.body.contains(this.el)) {
      document.body.appendChild(this.el);
    }

    this.el.innerHTML = '';

    // Создаем элементы меню с улучшенной анимацией
    this.modules.forEach((module, index) => {
      const $item = document.createElement('li');
      $item.textContent = module.type;
      $item.classList.add('menu-item');
      $item.dataset.index = index;
      $item.style.animationDelay = `${index * 80}ms`;

      // Добавляем дополнительные эффекты для каждого элемента
      this.enhanceMenuItem($item, index);

      this.el.appendChild($item);
    });

    // Позиционирование меню
    this.positionMenu(x, y);

    // Показываем меню с анимацией
    this.el.classList.add('open');
    this.visible = true;

    // Добавляем обработчики событий только после открытия меню
    // Небольшая задержка чтобы избежать немедленного срабатывания
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
      document.addEventListener('keydown', this.handleEscapeKey);
    }, 100);

    // Запуск glow эффекта после появления всех элементов
    const glowDelay = this.modules.length * 80 + 200;
    setTimeout(() => {
      if (this.visible) {
        this.el.classList.add('glow');
      }
    }, glowDelay);
  }

  enhanceMenuItem(item, index) {
    // Добавляем случайную задержку для более естественной анимации
    const randomDelay = Math.random() * 50;
    item.style.animationDelay = `${index * 80 + randomDelay}ms`;

    // Добавляем hover эффекты
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateX(6px) scale(1.02)';
      item.style.textShadow = '0 0 12px rgba(255, 255, 255, 0.4)';
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateX(0) scale(1)';
      item.style.textShadow = 'none';
      // this.notification.warning('Не удалось подключиться к серверу', 'Ошибка сети');
    });

    // Эффект клика
    item.addEventListener('mousedown', () => {
      item.style.transform = 'translateX(3px) scale(0.98)';
    });

    item.addEventListener('mouseup', () => {
      item.style.transform = 'translateX(6px) scale(1.02)';
    });
  }

  positionMenu(x, y) {
    const { offsetWidth, offsetHeight } = this.el;
    const padding = 20;
    const maxX = window.innerWidth - offsetWidth - padding;
    const maxY = window.innerHeight - offsetHeight - padding;

    // Умное позиционирование
    let finalX = Math.min(x, maxX);
    let finalY = Math.min(y, maxY);

    // Если меню не помещается справа, показываем слева от курсора
    if (x + offsetWidth > window.innerWidth - padding) {
      finalX = Math.max(x - offsetWidth, padding);
    }

    // Если меню не помещается снизу, показываем сверху от курсора
    if (y + offsetHeight > window.innerHeight - padding) {
      finalY = Math.max(y - offsetHeight, padding);
    }

    this.el.style.left = `${finalX}px`;
    this.el.style.top = `${finalY}px`;
  }

  close() {
    // Удаляем обработчики событий
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscapeKey);

    this.el.classList.remove('open', 'glow');
    this.visible = false;
  }

  add(module) {
    this.modules.push(module);
  }

  // Дополнительный метод для программного управления свечением
  toggleGlow(force) {
    if (force !== undefined) {
      this.el.classList.toggle('glow', force);
    } else {
      this.el.classList.toggle('glow');
    }
  }

  // Метод для изменения цветовой схемы свечения
  setGlowColors(primary, secondary, tertiary) {
    if (primary) {
      document.documentElement.style.setProperty('--glow-primary', primary);
    }
    if (secondary) {
      document.documentElement.style.setProperty('--glow-secondary', secondary);
    }
    if (tertiary) {
      document.documentElement.style.setProperty('--glow-tertiary', tertiary);
    }
  }
}
