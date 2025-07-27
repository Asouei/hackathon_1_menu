import './styles.css';
import ContextMenu from './menu';
import CountdownTimer from './modules/countdownTimer.js';
import BackgroundModule from './modules/background.module';
import { RandomFigure } from './modules/random-figure.js';
import RandomSoundPlayer from './modules/random.sound.player.js';

function application() {
  return () => {
    const menu = new ContextMenu('.menu');
    const timer = new CountdownTimer();
    const soundPlayer = new RandomSoundPlayer();

    menu.add({
      type: 'Таймер',
      trigger() {
        timer.trigger();
      },
    });

    menu.add({
      type: 'Random Sound',
      trigger() {
        soundPlayer.trigger();
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
