import Module from '../core/module';
import { SVG } from '@svgdotjs/svg.js';
import { setRandomPathPosition,randomPathGenerator,randomHSLColor } from '../utils/utils.js';




export class RandomFigure extends Module{
    constructor(){
        super('Random Figure', 'Random Figure');
    }


    trigger(){
        const existingCanvas = document.querySelector('.canvasDiv');
        if (existingCanvas) existingCanvas.remove();

        const body = document.querySelector('body');
        const canvasDiv = document.createElement('div');
        canvasDiv.className = "canvasDiv";
        body.append(canvasDiv);

        let draw = SVG().addTo('.canvasDiv').size('100%', '100%');

        var path = draw.path(randomPathGenerator(canvasDiv));
        path.fill('none');
        path.stroke({ color: `${randomHSLColor()}`, width: 4, linecap: 'round', linejoin: 'round' })
        setRandomPathPosition(canvasDiv, path);

        canvasDiv.addEventListener('click', (event)=>{
            const canvas = event.target.closest('.canvasDiv');
            if(canvas){
                canvasDiv.remove();
            }
        },  { once: true })
    }
}