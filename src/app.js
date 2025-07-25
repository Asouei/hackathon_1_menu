import './styles.css';
import ContextMenu from './menu';
import BackgroundModule from './modules/background.module';

function application() {
  return () => {
    const menu = new ContextMenu('.menu');

    menu.add({
      type: 'Log Hello',
      trigger() {
        console.log('Hello from menu!');
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

    menu.add({
      type: 'Alert',
      trigger() {
        alert('Alert from context menu!');
      },
    });

    menu.add(new BackgroundModule());

    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.open(event.clientX, event.clientY);
    });
  };
}

application()();
