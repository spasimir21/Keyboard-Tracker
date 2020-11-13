const win = require('electron').remote.getCurrentWindow();
const iohook = require('iohook');
const path = require('path');
const fs = require('fs');

class Renderer {
    constructor(width, height) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
    }
    background(color) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.closePath();
    }
    image(img, x, y, width = img.width, height = img.height) {
        this.ctx.drawImage(img, x, y, width, height);
    }
}

function getFileName(filename) {
    return filename.split('.').slice(0, -1).join('.');
}

function loadOverlays() {
    try {
        const files = fs.readdirSync('./resources/app/assets/overlay');
        const overlays = {};

        for (const file of files) {
            if (path.extname(file) != '.png') continue;
            overlays[getFileName(file)] = loadImage(`./assets/overlay/${file}`);
        }

        return overlays;
    } catch (err) {
        alert(err.message);
        win.close();
    }
}

function loadOverlayMap(overlays) {
    try {
        const json = JSON.parse(
            fs.readFileSync('./resources/app/assets/overlay.json')
        );
        const overlayMap = {};

        for (const overlay in json) {
            if (overlays[overlay] == null) continue;

            for (const key of json[overlay]) {
                overlayMap[key[1]] = [overlay, key[2], key[3]];
            }
        }

        return overlayMap;
    } catch (err) {
        alert(err.message);
        win.close();
    }
}

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

const KEYBOARD = loadImage('./assets/keyboard.png');
const OVERLAYS = loadOverlays();

const OVERLAY_MAP = loadOverlayMap(OVERLAYS);

const renderer = new Renderer(window.innerWidth, window.innerHeight);
const buttons = new Set();

window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(renderer.canvas);

    iohook.on('keydown', event => {
        buttons.add(event.rawcode);
        //console.log(event.rawcode);
    });

    iohook.on('keyup', event => {
        buttons.delete(event.rawcode);
    });

    iohook.start();

    loop();
});

function loop() {
    renderer.background('black');
    renderer.image(KEYBOARD, 0, 0);

    buttons.forEach(button => {
        const overlay = OVERLAY_MAP[button];
        if (overlay == null) return;

        renderer.image(OVERLAYS[overlay[0]], overlay[1], overlay[2]);
    });

    requestAnimationFrame(loop);
}
