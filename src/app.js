import './styles.css';
import ContextMenu from './menu';
import CountdownTimer from './modules/countdownTimer.js';

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

    menu.add({
      type: 'Alert',
      trigger() {
        alert('Alert from context menu!');
      },
    });

    menu.add({
      type: 'GGGGGG',
      trigger() {
        alert('Alert from context menu!');
      },
    });

    menu.add({
      type: 'Alert',
      trigger() {
        alert('Alert from context menu!');
      },
    });

    menu.add({
      type: 'Alert',
      trigger() {
        alert('Alert from context menu!');
      },
    });

    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.open(event.clientX, event.clientY);
    });
  };
}

application()();
