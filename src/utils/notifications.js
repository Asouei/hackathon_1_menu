// @ts-nocheck

export default class ToastNotification {
  constructor() {
    this.container = null;
    this.toasts = new Map(); // Хранилище активных тостов
    this.toastCounter = 0; // Счетчик для уникальных ID

    // Создаем контейнер при первом использовании
    this.initContainer();
  }

  initContainer() {
    // Проверяем, есть ли уже контейнер
    this.container = document.querySelector('.toast-container');

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Создание нового тоста
   * @param {string} message - Текст сообщения
   * @param {string|null} title - Заголовок (опционально)
   * @param {string} type - Тип тоста (success, error, warning, info)
   * @param {number} duration - Время показа в миллисекундах (0 = не закрывать автоматически)
   */

  show(message, title = null, type = 'info', duration = 2000) {
    // Создаем уникальный ID для тоста
    const toastId = `toast-${++this.toastCounter}`;

    // Создаем элемент тоста
    const toastElement = this.createToastElement(toastId, message, title, type);

    // Добавляем в контейнер
    this.container.appendChild(toastElement);

    // Сохраняем в коллекцию
    const toastData = {
      id: toastId,
      element: toastElement,
      timer: null,
    };
    this.toasts.set(toastId, toastData);

    // Настраиваем автозакрытие если указана длительность
    if (duration > 0) {
      toastData.timer = setTimeout(() => {
        this.hide(toastId);
      }, duration);
    }

    // Обработчик клика на кнопку закрытия
    const closeButton = toastElement.querySelector('.toast-close');
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide(toastId);
    });

    // Паузим автозакрытие при наведении
    toastElement.addEventListener('mouseenter', () => {
      if (toastData.timer) {
        clearTimeout(toastData.timer);
        // Останавливаем анимацию прогресса
        const progressBar = toastElement.querySelector('.toast-progress');
        if (progressBar) {
          progressBar.style.animationPlayState = 'paused';
        }
      }
    });

    // Возобновляем автозакрытие при уходе курсора
    toastElement.addEventListener('mouseleave', () => {
      if (duration > 0) {
        const progressBar = toastElement.querySelector('.toast-progress');
        if (progressBar) {
          progressBar.style.animationPlayState = 'running';
          // Запускаем таймер на оставшее время
          const remainingTime = duration * 0.3; // Примерное оставшееся время
          toastData.timer = setTimeout(() => {
            this.hide(toastId);
          }, remainingTime);
        }
      }
    });

    console.log(`Тост создан: ${toastId}, тип: ${type}`);
    return toastId;
  }

  /**
   * Создание HTML элемента тоста
   */
  createToastElement(id, message, title, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('data-toast-id', id);

    // Получаем иконку для типа тоста
    const icon = this.getIconForType(type);

    // Формируем HTML содержимое
    const titleHtml = title ? `<h4 class="toast-title">${this.escapeHtml(title)}</h4>` : '';

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">${icon}</div>
        <div class="toast-text">
          ${titleHtml}
          <p class="toast-message">${this.escapeHtml(message)}</p>
        </div>
      </div>
      <button class="toast-close" aria-label="Закрыть">×</button>
      <div class="toast-progress"></div>
    `;

    return toast;
  }

  /**
   * Получение иконки для типа тоста
   */
  getIconForType(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type] || icons.info;
  }

  /**
   * Экранирование HTML символов для безопасности
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Скрытие конкретного тоста
   */
  hide(toastId) {
    const toastData = this.toasts.get(toastId);
    if (!toastData) {
      console.warn(`Тост с ID ${toastId} не найден`);
      return;
    }

    const { element, timer } = toastData;

    // Отменяем таймер если он есть
    if (timer) {
      clearTimeout(timer);
    }

    // Добавляем класс для анимации закрытия
    element.classList.add('closing');

    // Удаляем элемент после анимации
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toasts.delete(toastId);
      console.log(`Тост удален: ${toastId}`);
    }, 300); // Время анимации закрытия
  }

  /**
   * Закрытие всех активных тостов
   */
  hideAll() {
    this.toasts.forEach((_, toastId) => {
      this.hide(toastId);
    });
  }

  /**
   * Удобные методы для разных типов тостов
   */
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

  /**
   * Получение количества активных тостов
   */
  getActiveCount() {
    return this.toasts.size;
  }

  /**
   * Проверка существования тоста
   */
  exists(toastId) {
    return this.toasts.has(toastId);
  }
}

// Создаем глобальный экземпляр для удобства использования
const toast = new ToastNotification();

// Экспортируем для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastNotification;
}

// Пример использования:
/*
// Простые тосты
toast.success('Операция выполнена успешно!');
toast.error('Произошла ошибка при сохранении');
toast.warning('Внимание! Проверьте данные');
toast.info('Новая версия приложения доступна');

// С заголовками
toast.success('Файл загружен', 'Успех');
toast.error('Не удалось подключиться к серверу', 'Ошибка сети');

// С кастомным временем показа
toast.info('Это сообщение исчезнет через 5 секунд', null, 5000);

// Без автозакрытия (закрывается только по клику)
toast.error('Критическая ошибка! Обратитесь к администратору', 'Системная ошибка', 0);

*/
