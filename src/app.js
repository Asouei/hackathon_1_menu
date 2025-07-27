// Обновленный app.js с добавлением модуля сообщений

import './styles.css';
import ContextMenu from './menu';
import CountdownTimer from './modules/countdownTimer';
import BackgroundModule from './modules/background.module';
import { RandomFigure } from './modules/random-figure';
import CustomMessage from './modules/customMessage'; // НОВЫЙ ИМПОРТ
import Aim400kgModule from './modules/aim400kg.module';

function application() {
  return () => {
    const menu = new ContextMenu('.menu');
    const timer = new CountdownTimer();
    const aim400kg = new Aim400kgModule();

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

    menu.add(aim400kg);

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
