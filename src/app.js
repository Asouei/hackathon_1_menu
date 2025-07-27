// Обновленный app.js с добавлением модуля сообщений

import './styles.css';
import ContextMenu from './menu';
import CountdownTimer from './modules/countdownTimer.js';
import BackgroundModule from './modules/background.module';
import { RandomFigure } from './modules/random-figure.js';
import CustomMessage from './modules/customMessage.js'; // НОВЫЙ ИМПОРТ

function application() {
  return () => {
    const menu = new ContextMenu('.menu');
    const timer = new CountdownTimer();

    menu.add({
      type: 'Таймер',
      trigger() {
        timer.trigger();
      },
    });

    menu.add(new RandomFigure());

    const bg = new BackgroundModule();

    menu.add({
      type: bg.type, // или 'Random Background'
      trigger() {
        console.log('[DEBUG] BackgroundModule trigger вызван вручную!');
        bg.trigger();
      },
    });

    // ДОБАВЛЯЕМ НОВЫЙ МОДУЛЬ СООБЩЕНИЙ
    const customMessage = new CustomMessage();
    menu.add({
      type: customMessage.type, // 'Сообщение'
      trigger() {
        console.log('[DEBUG] CustomMessage trigger вызван!');
        customMessage.trigger();
      },
    });

    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.open(event.clientX, event.clientY);
    });
  };
}

document.addEventListener('DOMContentLoaded', () => {
  application()();
});