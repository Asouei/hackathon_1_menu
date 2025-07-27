import { SVG } from '@svgdotjs/svg.js';
import Module from '../core/module';
import { safeRandomPathGenerator, randomHSLColor } from '../utils/utils.js';

export class RandomFigure extends Module {
  constructor() {
    super('Random Figure', 'Random Figure');
  }

  trigger() {
    const existingCanvas = document.querySelector('.canvasDiv');
    if (existingCanvas) existingCanvas.remove();

    const body = document.querySelector('body');
    const canvasDiv = document.createElement('div');
    canvasDiv.className = 'canvasDiv';
    body.append(canvasDiv);

    const draw = SVG().addTo('.canvasDiv').size('100%', '100%');

    const path = draw.path(safeRandomPathGenerator(canvasDiv));
    path.fill('none');
    path.stroke({
      color: randomHSLColor(),
      width: 4,
      linecap: 'round',
      linejoin: 'round',
    });

    // Выбираем тип анимации (теперь все плавные)
    const animationTypes = ['', 'smooth', 'chaotic', 'gentle'];
    const weights = [30, 25, 25, 20]; // Веса для выбора (gentle реже)

    let randomType = '';
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (let i = 0; i < animationTypes.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        randomType = animationTypes[i];
        break;
      }
    }

    if (randomType) {
      path.addClass(randomType);
    }

    canvasDiv.addEventListener(
      'click',
      (event) => {
        const canvas = event.target.closest('.canvasDiv');
        if (canvas) {
          canvasDiv.remove();
        }
      },
      { once: true }
    );
  }
}
