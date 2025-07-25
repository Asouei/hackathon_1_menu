import Module from '../core/module';
import {  randomGradient } from '../utils/utils';

export default class BackgroundModule extends Module {
    constructor(type, text){
        super('Random Background Color', 'Random Background Color');
    }

    trigger(){
        const appBody = document.querySelector('body');
        const linearGradient = randomGradient();
        appBody.style.background = `linear-gradient(90deg, #181818ff, #606060ff), ${linearGradient}`;
        appBody.style.backgroundBlendMode = 'multiply';
        // console.log('Body: ', appBody);
    }

    // defined in parent's class
    // toHTML(){

    // }
}
