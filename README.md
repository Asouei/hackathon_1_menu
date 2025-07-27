# Interactive Context Menu Playground

A modular JavaScript application showcasing advanced user interaction, animation, and Web API features through a custom context menu. The project includes interactive games, UI utilities, visual effects, notifications, and adaptive design for desktop and mobile platforms.

---

## ✅ Features

- Custom animated context menu with module system
- Mobile-adaptive layout and touch support
- Plugin-based architecture with isolated modules
- Game (AIM 400kg) with scoring and accuracy tracking
- Draggable countdown timer with animated circular progress
- Random background gradient generator with copyable color codes
- Canvas-based figure generator with smooth Bézier curves
- Random sound player with cover preview and controls
- Rich toast notifications with gradient support
- Clipboard integration and keyboard handling

---

## 🔧 Technologies and APIs Used

| Technology        | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| JavaScript (ES6+) | Core logic and modular structure                                        |
| HTML5 & CSS3      | Layout, animations, and responsive UI                                   |
| Canvas API        | Figure rendering and game stats chart                                   |
| Web Audio API     | Playback for sound player and timer alert                               |
| Clipboard API     | One-click copy for color and text values                                |
| requestAnimationFrame | Smooth countdown and UI updates                                    |
| LocalStorage (opt.) | Game result caching and potential future extension                    |
| CSS Keyframes     | Animations for menu items and transitions                               |
| Three.js (optional) | Visual background effects (if enabled in timer module)                |

---

## 📁 Project Structure

```
src/
├── app.js
├── menu.js
├── core/menu.js
├── modules/
│   ├── aim400kg.module.js
│   ├── countdownTimer.js
│   ├── background.module.js
│   ├── customMessage.js
│   ├── random-figure.js
│   └── random.sound.player.js
├── utils.js
├── toast-notification.js
├── styles.css
```

---

## 🧩 Modules Overview

### 🎯 AIM 400kg Game

A reaction-based game where players click on targets appearing on screen.

**Features:**

- Random target spawn and combo tracker
- Score and accuracy calculation
- Rank system: S, A, B, C
- End screen with performance graph (Canvas)
- ESC key support for exiting

**Code Example:**

```js
calculateRank() {
  const acc = this.getAccuracy();
  if (acc >= 95) return 'S';
  if (acc >= 85) return 'A';
  if (acc >= 70) return 'B';
  return 'C';
}
```

---

### ⏱ Countdown Timer

Animated and draggable countdown with custom input formats.

**Features:**

- Input formats: `mm:ss`, `3m`, `90`
- CSS + JS based circular animation
- Auto-removal and restart capability
- Optional sound and gradient pulse

**Code Example:**

```js
startCountdown(seconds) {
  const start = performance.now();
  const tick = (now) => {
    const elapsed = (now - start) / 1000;
    this.updateUI(seconds - elapsed);
    if (elapsed < seconds) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
```

---

### 🎨 Background Generator

Random HSL-based linear gradients using structured schemes.

**Color Schemes:**

- Analogous
- Complementary
- Triadic
- Tetradic

**Code Example:**

```js
const { gradient, colors } = randomGradient();
document.body.style.background = gradient;
```

Users can preview, copy, and apply colors as HEX, RGB, or HSL values.

---

### 🧬 Random Figure Generator

Generates smooth, abstract figures using Bézier and arc paths.

**Highlights:**

- Safe canvas region constraints
- Polar-angle sorting for smooth shape flow
- Commands: `M`, `Q`, `L`, `A`, `Z`

**Code Example:**

```js
points.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
```

---

### 💬 Custom Message

Displays modal windows with anime quotes or user input.

**Features:**

- Gradient-styled modal background
- Copy-to-clipboard button
- ESC support and fade-out animation

---

### 🔊 Random Sound Player

Plays random audio samples with controls and visual feedback.

**Features:**

- Randomized local sound files
- Cover preview animation
- Simple playback controls

**Code Example:**

```js
const sound = new Audio('/sounds/sample.mp3');
sound.play();
```

---

## 🔔 Toast Notification System

Reusable system for toast-style alerts and feedback.

**Features:**

- Types: `info`, `success`, `error`, `warning`
- Gradient previews in icon zone
- Auto-close with hover pause
- Progress bar and close button

**Code Example:**

```js
toast.show("Copied HEX value", "Color Palette", "success", 2000, gradient);
```

---

## 🖱 Custom Context Menu

Right-click menu dynamically renders modules with animated items.

**Highlights:**

- Auto-positioning near cursor
- Mobile-adaptive: centered full-screen menu
- Glow and gradient-change effects
- Hover-based mini-previews (for background items)

**Mobile Detection:**

```js
isMobileDevice() {
  return window.innerWidth <= 768;
}
```

---

## 🚀 Running the Project

1. Clone the repository:

```bash
git clone https://github.com/your/repo-name.git
```

2. Start a local server (e.g. http-server or Live Server):

```bash
npx http-server .
```

3. Open in browser and right-click to open the interactive menu.

---

## 👨‍💻 Authors

- **Aleksandr Milkhailishin**
- **Aliya Shtikova**
- **Ravshan Izzatulloev**

---

## 📄 License

MIT License – free to use, modify, and distribute.
