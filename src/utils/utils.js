export function random(min, max) {
  return Math.round(min - 0.5 + Math.random() * (max - min + 1));
}

// color functions: generate color linear gradient with transparency
export function randomGradient(randomColors = null, opacity = 1){
  const gradientType = 'linear-gradient';  
  const gradientDirection = Math.floor(Math.random()*361);
  const gradColorsArray =randomColors || randomSchemeHSLColors();
  const gradColorsArrayOpacity  = gradColorsArray.map((elem)=>{
    return elem.replace(')', `, ${opacity})`).replace('hsl(', 'hsla(');
  });
  const gradientColors = gradColorsArrayOpacity.join(', ');
  const gradient = `${gradientType}(${gradientDirection}deg, ${gradientColors})`;
  console.log(gradient);
  return gradient;
}

// color functions: generate random HSL color
function randomHSLColor(){
  const randomHue = Math.floor(Math.random()*361);
  const randomSat = Math.floor(Math.random()*101);
  const randomValue = Math.floor(Math.random()*101);
  console.log(randomHue, randomSat, randomValue);
  return `hsl(${randomHue},${randomSat}%,${randomValue}%)`
}

// color functions: generate array from hsl colors from main color schemes. Color schemes can be added inside the array "colorScehemes"

function randomSchemeHSLColors(){
  const index = Math.floor(Math.random()*colorScehemes.length);
  return colorScehemes[index]();
}

const colorScehemes = [
  analogSchemeHue,
  complementarySchemeHue,
  triadSchemeHue,
  tetradSchemeHue
]

function analogSchemeHue(offset=15){
  const randomHue = Math.floor(Math.random()*361);
  const randomSat = Math.floor(Math.random()*101);
  const randomValue = Math.floor(Math.random()*101);

  const analogHue1 = (randomHue-offset+360)%360;
  const analogHue2 = (randomHue+offset+360)%360;
  
  const HSLColor1 =  `hsl(${analogHue1},${randomSat}%,${randomValue}%)`;
  const HSLColor2 =  `hsl(${randomHue},${randomSat}%,${randomValue}%)`;
  const HSLColor3 =  `hsl(${analogHue2},${randomSat}%,${randomValue}%)`;

  return [HSLColor1, HSLColor2, HSLColor3];
}

function complementarySchemeHue(){
  const randomHue = Math.floor(Math.random()*361);
  const randomSat = Math.floor(Math.random()*101);
  const randomValue = Math.floor(Math.random()*101);

  const complementaryHue = (randomHue+180)%360;
  
  const HSLColor1 =  `hsl(${randomHue},${randomSat}%,${randomValue}%)`;
  const HSLColor2 =  `hsl(${complementaryHue},${randomSat}%,${randomValue}%)`;

  return [HSLColor1, HSLColor2];
}

function triadSchemeHue(){
  const randomHue = Math.floor(Math.random()*361);
  const randomSat = Math.floor(Math.random()*101);
  const randomValue = Math.floor(Math.random()*101);

  const triadHue1 = (randomHue-120+360)%360;
  const triadHue2 = (randomHue+120)%360;


  const HSLColor1 =  `hsl(${triadHue1},${randomSat}%,${randomValue}%)`;
  const HSLColor2 =  `hsl(${randomHue},${randomSat}%,${randomValue}%)`;
  const HSLColor3 =  `hsl(${triadHue2},${randomSat}%,${randomValue}%)`;

  return [HSLColor1, HSLColor2, HSLColor3];
}

function tetradSchemeHue(){
  const randomHue = Math.floor(Math.random()*361);
  const randomSat = Math.floor(Math.random()*101);
  const randomValue = Math.floor(Math.random()*101);

  const tetradHue1 = (randomHue+60)%360;
  const tetradHue2 = (randomHue+180)%360;
  const tetradHue3 = (randomHue+240)%360;


  const HSLColor1 =  `hsl(${randomHue},${randomSat}%,${randomValue}%)`;
  const HSLColor2 =  `hsl(${tetradHue1},${randomSat}%,${randomValue}%)`;
  const HSLColor3 =  `hsl(${tetradHue2},${randomSat}%,${randomValue}%)`;
  const HSLColor4 =  `hsl(${tetradHue3},${randomSat}%,${randomValue}%)`;

  return [HSLColor1, HSLColor2, HSLColor3, HSLColor4];
}
