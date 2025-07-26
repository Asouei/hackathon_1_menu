export default class ToastNotification {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.toastCounter = 0;
    this.initContainer();
  }

  initContainer() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, title = null, type = 'info', duration = 2000, gradient = null) {
    const toastId = `toast-${++this.toastCounter}`;
    const toastElement = this.createToastElement(toastId, message, title, type, gradient);
    this.container.appendChild(toastElement);

    const toastData = {
      id: toastId,
      element: toastElement,
      timer: null,
      gradient,
    };
    this.toasts.set(toastId, toastData);

    if (duration > 0) {
      toastData.timer = setTimeout(() => this.hide(toastId), duration);
    }

    const closeButton = toastElement.querySelector('.toast-close');
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide(toastId);
    });

    toastElement.addEventListener('mouseenter', () => {
      if (toastData.timer) {
        clearTimeout(toastData.timer);
        const progressBar = toastElement.querySelector('.toast-progress');
        if (progressBar) progressBar.style.animationPlayState = 'paused';
      }
    });

    toastElement.addEventListener('mouseleave', () => {
      if (duration > 0) {
        const progressBar = toastElement.querySelector('.toast-progress');
        if (progressBar) {
          progressBar.style.animationPlayState = 'running';
          toastData.timer = setTimeout(() => this.hide(toastId), duration * 0.3);
        }
      }
    });

    console.log(`Тост создан: ${toastId}, тип: ${type}, градиент: ${gradient ? 'да' : 'нет'}`);
    return toastId;
  }

  createToastElement(id, message, title, type, gradient = null) {
    const toast = document.createElement('div');
    let toastClasses = `toast ${type}`;
    if (gradient) toastClasses += ' gradient-notification';
    toast.className = toastClasses;
    toast.setAttribute('data-toast-id', id);

    // Создаем контейнер контента
    const toastContent = document.createElement('div');
    toastContent.className = 'toast-content';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'toast-icon';

    if (gradient) {
      iconContainer.appendChild(this.createGradientPreview(gradient));
    } else {
      iconContainer.innerText = this.getIconForType(type);
    }

    const textContainer = document.createElement('div');
    textContainer.className = 'toast-text';

    if (title) {
      const titleEl = document.createElement('h4');
      titleEl.className = 'toast-title';
      titleEl.innerHTML = this.escapeHtml(title);
      textContainer.appendChild(titleEl);
    }

    const messageEl = document.createElement('p');
    messageEl.className = 'toast-message';
    messageEl.innerHTML = this.escapeHtml(message);
    textContainer.appendChild(messageEl);

    toastContent.appendChild(iconContainer);
    toastContent.appendChild(textContainer);
    toast.appendChild(toastContent);

    // Кнопка закрытия
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.innerText = '×';
    toast.appendChild(closeBtn);

    // Прогресс-бар
    const progress = document.createElement('div');
    progress.className = 'toast-progress';
    toast.appendChild(progress);

    return toast;
  }

  createGradientPreview(gradient) {
    const div = document.createElement('div');
    div.classList.add('gradient-preview');
    div.style.background = gradient;
    return div;
  }

  getIconForType(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type] || icons.info;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  hide(toastId) {
    const toastData = this.toasts.get(toastId);
    if (!toastData) return;

    const { element, timer } = toastData;
    if (timer) clearTimeout(timer);

    element.classList.add('closing');

    setTimeout(() => {
      element.remove();
      this.toasts.delete(toastId);
      console.log(`Тост удален: ${toastId}`);
    }, 300);
  }

  hideAll() {
    this.toasts.forEach((_, toastId) => this.hide(toastId));
  }

  success(message, title = null, duration = 2000) {
    return this.show(message, title, 'success', duration);
  }

  error(message, title = null, duration = 3000) {
    return this.show(message, title, 'error', duration);
  }

  warning(message, title = null, duration = 2500) {
    return this.show(message, title, 'warning', duration);
  }

  info(message, title = null, duration = 2000) {
    return this.show(message, title, 'info', duration);
  }

  getActiveCount() {
    return this.toasts.size;
  }

  exists(toastId) {
    return this.toasts.has(toastId);
  }
}

// Глобальный экземпляр
const toast = new ToastNotification();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastNotification;
}
