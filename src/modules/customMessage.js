import ToastNotification from '../utils/notifications';

export default class CustomMessage {
    constructor() {
        this.type = 'Сообщение';
        this.messageElement = null;
        this.modalElement = null;
        this.isVisible = false;
        this.isHovered = false;
        this.hideTimeout = null;
        this.toast = new ToastNotification();
    }

    trigger() {
        this.showModal();
    }

    showModal() {
        if (this.modalElement) this.hideModal();

        this.modalElement = document.createElement('div');
        this.modalElement.className = 'message-input-modal';

        this.modalElement.innerHTML = `
      <div class="message-input-container">
        <div class="message-input-header">
          <button class="close-message-input" aria-label="Закрыть">×</button>
        </div>
        <div class="message-input-content">
          <h3>Введите ваше сообщение</h3>
          <div class="textarea-container">
            <textarea 
              placeholder="Напишите что-нибудь красивое..." 
              maxlength="150" 
              rows="4"
              class="message-textarea"
            ></textarea>
            <div class="character-counter">
              <span class="current-count">0</span>/<span class="max-count">150</span>
            </div>
          </div>
          <div class="message-style-options">
            <label><input type="radio" name="messageStyle" value="h1" checked><span>Большой заголовок</span></label>
            <label><input type="radio" name="messageStyle" value="h2"><span>Средний заголовок</span></label>
            <label><input type="radio" name="messageStyle" value="anime"><span>Случайная аниме цитата</span></label>
          </div>
          <div class="message-input-controls">
            <button class="cancel-message">Отмена</button>
            <button class="show-message">Показать</button>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(this.modalElement);
        setTimeout(() => this.modalElement.classList.add('visible'), 10);

        this.setupModalEvents();
        this.modalElement.querySelector('.message-textarea').focus();
    }

    setupModalEvents() {
        const closeBtn = this.modalElement.querySelector('.close-message-input');
        const cancelBtn = this.modalElement.querySelector('.cancel-message');
        const showBtn = this.modalElement.querySelector('.show-message');
        const textarea = this.modalElement.querySelector('.message-textarea');
        const radioButtons = this.modalElement.querySelectorAll('input[name="messageStyle"]');

        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => this.updateUIForSelectedStyle(radio.value));
        });

        textarea.addEventListener('input', () => {
            this.updateCharacterCounter();
            this.validateInput();
        });

        this.updateUIForSelectedStyle('h1');

        closeBtn.addEventListener('click', () => this.hideModal());
        cancelBtn.addEventListener('click', () => this.hideModal());
        showBtn.addEventListener('click', () => this.displayMessage());

        textarea.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.displayMessage();
            }
        });

        this.modalElement.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.hideModal();
        });

        this.modalElement.addEventListener('click', e => {
            if (e.target === this.modalElement) this.hideModal();
        });
    }

    updateCharacterCounter() {
        const textarea = this.modalElement.querySelector('.message-textarea');
        const currentCount = this.modalElement.querySelector('.current-count');
        const counter = this.modalElement.querySelector('.character-counter');
        const length = textarea.value.length;

        currentCount.textContent = length;

        const maxLength = parseInt(textarea.maxLength);
        const percentage = (length / maxLength) * 100;

        if (percentage >= 90) counter.style.color = '#ff4757';
        else if (percentage >= 75) counter.style.color = '#ffa502';
        else counter.style.color = 'var(--text-color)';
    }

    validateInput() {
        const textarea = this.modalElement.querySelector('.message-textarea');
        const showBtn = this.modalElement.querySelector('.show-message');
        const selectedStyle = this.modalElement.querySelector('input[name="messageStyle"]:checked').value;

        if (selectedStyle === 'anime') return;

        const length = textarea.value.trim().length;
        const isValid = length > 0 && length <= parseInt(textarea.maxLength);

        showBtn.disabled = !isValid;
        showBtn.style.opacity = isValid ? '1' : '0.6';
        showBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }

    updateUIForSelectedStyle(style) {
        const textarea = this.modalElement.querySelector('.message-textarea');
        const showBtn = this.modalElement.querySelector('.show-message');
        const counter = this.modalElement.querySelector('.character-counter');

        if (style === 'anime') {
            textarea.disabled = true;
            textarea.placeholder = 'Аниме цитата будет получена автоматически...';
            textarea.style.opacity = '0.6';
            showBtn.textContent = 'Получить аниме цитату';
            showBtn.classList.add('anime-mode');
            counter.style.display = 'none';
        } else {
            textarea.disabled = false;
            textarea.placeholder = 'Напишите что-нибудь красивое...';
            textarea.style.opacity = '1';
            showBtn.textContent = 'Показать';
            showBtn.classList.remove('anime-mode');
            counter.style.display = 'block';

            if (style === 'h1') {
                textarea.maxLength = 150;
                this.modalElement.querySelector('.max-count').textContent = '150';
            } else if (style === 'h2') {
                textarea.maxLength = 200;
                this.modalElement.querySelector('.max-count').textContent = '200';
            }

            this.updateCharacterCounter();
        }
    }

    async displayMessage() {
        const textarea = this.modalElement.querySelector('.message-textarea');
        const selectedStyle = this.modalElement.querySelector('input[name="messageStyle"]:checked').value;

        if (selectedStyle === 'anime') {
            this.showLoadingState();

            let quoteData = null;

            try {
                quoteData = await this.fetchAnimeQuote();
            } catch (error) {
                console.error('Ошибка получения аниме цитаты:', error);
                quoteData = {
                    quote: 'Не удалось получить цитату из аниме. Попробуйте еще раз.',
                    author: 'Система',
                    characterImage: null
                };
            }

            this.hideModal();

            this.showMessageDisplay(
                quoteData.quote,
                selectedStyle,
                quoteData.author,
                quoteData.characterImage
            );
            return;
        }

        const messageText = textarea.value.trim();
        if (!messageText) {
            textarea.focus();
            return;
        }

        this.hideModal();
        this.showMessageDisplay(messageText, selectedStyle);
    }

    showLoadingState() {
        const showBtn = this.modalElement.querySelector('.show-message');
        showBtn.disabled = true;
        showBtn.classList.add('loading');

        let dots = 0;
        this.loadingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            showBtn.textContent = 'Получаем цитату' + '.'.repeat(dots);
        }, 500);
    }

    async fetchAnimeQuote() {
        const resp = await fetch('https://yurippe.vercel.app/api/quotes?random=1');
        if (!resp.ok) throw new Error(`API failed: ${resp.status}`);
        const arr = await resp.json();
        const data = Array.isArray(arr) ? arr[0] : arr;

        if (!data.quote) throw new Error('Invalid API response');

        const translatedQuote = await this.translateText(data.quote);

        if (translatedQuote.length > 500) {
            console.warn('Цитата слишком длинная, пробуем другую...');
            return this.fetchAnimeQuote();
        }

        const rawAnime = data.show || data.anime || 'Аниме';
        const rawChar = data.character || 'Персонаж';
        const translatedAnime = await this.translateText(rawAnime);
        const authorText = `${rawChar} • ${translatedAnime}`;
        const characterImage = await this.fetchCharacterImage(rawChar, rawAnime);

        return {
            quote: translatedQuote,
            author: authorText,
            characterImage
        };
    }

    async fetchCharacterImage(characterName, animeName) {
        try {
            const searchQuery = encodeURIComponent(`${characterName} ${animeName}`);
            const response = await fetch(`https://api.jikan.moe/v4/characters?q=${searchQuery}&limit=1`);
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const char = data.data[0];
                return char.images?.jpg?.image_url || char.images?.webp?.image_url || null;
            }
        } catch (e) {
            console.error('Ошибка получения изображения персонажа:', e);
        }

        return null;
    }

    async translateText(text) {
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`);
            const data = await res.json();
            return data.responseData?.translatedText || text;
        } catch (e) {
            console.error('Ошибка перевода:', e);
            return text;
        }
    }

    showMessageDisplay(text, style, author = null, characterImage = null) {
        // Мгновенно удаляем предыдущее сообщение если есть
        if (this.messageElement) {
            this.clearHideTimeout();
            this.messageElement.remove();
            this.messageElement = null;
            this.isVisible = false;
            this.isHovered = false;
        }

        this.messageElement = document.createElement('div');
        this.messageElement.className = `custom-message-display ${style}`;

        let content = '';
        if (style === 'anime') {
            content = `
        <div class="anime-quote-container">
          ${characterImage ? `<div class="character-background" style="background-image: url('${characterImage}')"></div>` : ''}
          <div class="anime-quote-content">
            <div class="anime-quote-mark">❝</div>
            <div class="message-text">${this.escapeHtml(text)}</div>
            <div class="anime-quote-mark closing">❞</div>
            ${author ? `<div class="anime-author">— ${this.escapeHtml(author)}</div>` : ''}
          </div>
        </div>`;
        } else {
            content = `<div class="message-text">${this.escapeHtml(text)}</div>`;
        }

        this.messageElement.innerHTML = `
      ${content}
      <button class="close-message-display" aria-label="Закрыть">×</button>
    `;

        document.body.appendChild(this.messageElement);
        this.isVisible = true;

        setTimeout(() => {
            this.messageElement.classList.add('visible');
        }, 10);

        // Кнопка закрытия
        this.messageElement.querySelector('.close-message-display')
            .addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideMessage();
            });

        // Обработчик ESC
        const handleEscape = e => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideMessage();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Обработчик клика для копирования
        this.messageElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-message-display')) return;
            this.copyMessage(text);
        });

        // Обработчики hover для предотвращения автоскрытия
        this.messageElement.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.clearHideTimeout();
        });

        this.messageElement.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.startAutoHide();
        });

        // Автоскрытие
        this.startAutoHide();
    }

    copyMessage(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Показываем тост уведомление
            this.toast.show(
                'Скопировано!',
                text.length > 50 ? text.substring(0, 50) + '...' : text,
                'success',
                2000
            );

            // Анимация копирования
            const textElement = this.messageElement.querySelector('.message-text');
            if (textElement) {
                textElement.classList.add('copied-animation');
                setTimeout(() => {
                    textElement.classList.remove('copied-animation');
                }, 400);
            }
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            this.toast.show('Ошибка', 'Не удалось скопировать текст', 'error', 2000);
        });
    }

    startAutoHide() {
        this.clearHideTimeout();

        // Для аниме цитат - динамическое время на основе длины текста
        let hideDelay = 8000; // базовое время

        if (this.messageElement && this.messageElement.classList.contains('anime')) {
            const textElement = this.messageElement.querySelector('.message-text');
            if (textElement) {
                const textLength = textElement.textContent.length;
                // 20ms на символ + базовое время, но не больше 20 секунд
                hideDelay = Math.min(8000 + textLength * 20, 20000);
            }
        }

        this.hideTimeout = setTimeout(() => {
            if (!this.isHovered && this.isVisible) {
                this.hideMessage();
            }
        }, hideDelay);
    }

    clearHideTimeout() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    hideModal() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }

        if (this.modalElement) {
            this.modalElement.classList.add('hiding');
            setTimeout(() => {
                this.modalElement?.remove();
                this.modalElement = null;
            }, 300);
        }
    }

    hideMessage() {
        if (this.messageElement && this.isVisible) {
            this.clearHideTimeout();
            this.messageElement.classList.add('hiding');
            this.isVisible = false;
            this.isHovered = false;

            setTimeout(() => {
                this.messageElement?.remove();
                this.messageElement = null;
            }, 400);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}