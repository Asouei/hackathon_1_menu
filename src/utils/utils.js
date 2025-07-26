export function random(min, max) {
  return Math.round(min - 0.5 + Math.random() * (max - min + 1));
}

// Генерация градиента и списка структурированных цветов
export function randomGradient(randomColors = null, opacity = 1) {
  const gradientType = 'linear-gradient';
  const gradientDirection = Math.floor(Math.random() * 361);
  const gradColorsArray = randomColors || randomSchemeHSLColors();

  // Массив с alpha для визуального градиента
  const gradColorsArrayOpacity = gradColorsArray.map((hsl) =>
    hsl.replace(')', `, ${opacity})`).replace('hsl(', 'hsla(')
  );
  const gradient = `${gradientType}(${gradientDirection}deg, ${gradColorsArrayOpacity.join(', ')})`;

  // Конвертация в hex и rgb
  const structuredColors = gradColorsArray
    .map((hslStr) => {
      const match = hslStr.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i);
      if (!match) return null;

      const [_, h, s, l] = match.map(Number);
      return {
        hsl: hslStr,
        rgb: hslToRgb(h, s, l),
        hex: hslToHex(h, s, l),
      };
    })
    .filter(Boolean);

  return {
    gradient,
    colors: structuredColors,
  };
}

// ==========================
// Преобразование HSL → RGB
// ==========================
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const val = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * val);
  };
  return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
}

// ==========================
// Преобразование HSL → HEX
// ==========================
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const val = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * val);
  };
  const r = f(0);
  const g = f(8);
  const b = f(4);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

// ==========================
// Генерация HSL строк
// ==========================
function randomHSLColor() {
  const h = random(0, 360);
  const s = random(60, 100); // более насыщенные
  const l = random(40, 85); // более светлые
  return `hsl(${h},${s}%,${l}%)`;
}

function randomSchemeHSLColors() {
  const index = Math.floor(Math.random() * colorSchemes.length);
  return colorSchemes[index]();
}

const colorSchemes = [analogSchemeHue, complementarySchemeHue, triadSchemeHue, tetradSchemeHue];

// ==========================
// Цветовые схемы
// ==========================
function analogSchemeHue(offset = 15) {
  const h = random(0, 360);
  const s = random(60, 100);
  const l = random(45, 85);
  return [
    `hsl(${(h - offset + 360) % 360},${s}%,${l}%)`,
    `hsl(${h},${s}%,${l}%)`,
    `hsl(${(h + offset) % 360},${s}%,${l}%)`,
  ];
}

function complementarySchemeHue() {
  const h = random(0, 360);
  const s = random(65, 100);
  const l = random(50, 85);
  return [`hsl(${h},${s}%,${l}%)`, `hsl(${(h + 180) % 360},${s}%,${l}%)`];
}

function triadSchemeHue() {
  const h = random(0, 360);
  const s = random(70, 100);
  const l = random(55, 85);
  return [
    `hsl(${(h - 120 + 360) % 360},${s}%,${l}%)`,
    `hsl(${h},${s}%,${l}%)`,
    `hsl(${(h + 120) % 360},${s}%,${l}%)`,
  ];
}

function tetradSchemeHue() {
  const h = random(0, 360);
  const s = random(60, 100);
  const l = random(50, 85);
  return [
    `hsl(${h},${s}%,${l}%)`,
    `hsl(${(h + 60) % 360},${s}%,${l}%)`,
    `hsl(${(h + 180) % 360},${s}%,${l}%)`,
    `hsl(${(h + 240) % 360},${s}%,${l}%)`,
  ];
}
