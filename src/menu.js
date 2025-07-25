// @ts-nocheck

import Menu from './core/menu';

export default class ContextMenu extends Menu {
  constructor(selector) {
    super(selector);
    this.modules = [];
    this.visible = false;

    // Клик по элементу меню
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

    // Клик вне меню
    document.body.addEventListener('click', (event) => {
      if (!this.el.contains(event.target)) {
        this.close();
      }
    });
  }

  open(x, y) {
    if (this.modules.length === 0) return;

    // Очищаем меню
    this.el.innerHTML = '';

    // Создаём пункты меню
    this.modules.forEach((module, index) => {
      const $item = document.createElement('li');
      $item.textContent = module.type;
      $item.classList.add('menu-item');
      $item.dataset.index = index;
      this.el.appendChild($item);
    });

    // Ставим позицию и показываем меню
    this.el.style.top = `${y}px`;
    this.el.style.left = `${x}px`;
    this.el.classList.add('open');
    this.visible = true;
  }

  close() {
    this.el.classList.remove('open');
    this.visible = false;
  }

  add(module) {
    this.modules.push(module);
  }
}
