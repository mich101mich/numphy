// @ts-check

/** @type {{ [name:string]: Variable }} */
const vars = {
    "k": { min: 0, max: 10, step: 0.1, value: 1 },
    "friction": { min: 0, max: 5, step: 0.1, value: 0 },
    "external": { min: -10, max: 10, step: 0.1, value: 0 },
    "mass": { min: 0, max: 10, step: 0.1, value: 1 },
    "x_0": { min: -100, max: 100, step: 1, value: 0 },
    "v_0": { min: -100, max: 100, step: 1, value: 10 },
}

setup_vars(vars, () => {});

const resetButton = document.createElement("button");
document.getElementById("sliders").appendChild(resetButton);
resetButton.innerText = "Reset";
resetButton.onclick = reset;

window.addEventListener("resize", () => {
    resize();
});

const canvas = document.createElement("canvas");
canvas.style.width = "95vw";
canvas.style.height = "calc(95vh - " + document.getElementById("sliders").clientHeight + "px)";
document.body.appendChild(canvas);

/** @type {CanvasRenderingContext2D} */
let c;
/** @type {number} */
let w;
/** @type {number} */
let h;

function resize() {
    canvas.width = w = canvas.clientWidth;
    canvas.height = h = canvas.clientHeight;
    c = canvas.getContext("2d");
    reset();
}

/** @type {number} */
let x;
/** @type {number} */
let v;

function reset() {
    x = vars.x_0.value;
    v = vars.v_0.value;
}

const rectWidth = 80;
const rectHeight = 40;
const stepSize = 5;
const dt = stepSize / 1000;

let lastTime = 0;
/**
 * @param {number} time
 */
function update(time) {
    requestAnimationFrame(update);
    if (lastTime == 0) {
        lastTime = time;
        return;
    }

    const m = vars.mass.value;
    const k = vars.k.value;
    const Fex = vars.external.value;
    const friction = vars.friction.value;

    let iterations = 0;
    while (time - lastTime > stepSize) {
        lastTime += stepSize;
        if (++iterations >= 10) {
            break;
        }

        let a = -friction * v - k / m * x + Fex / m;
        v += a * dt;
        x += v * dt;
        if (x < -100) {
            x = -100;
            v = 0;
        }
        if (x > 100) {
            x = 100;
            v = 0;
        }
    }

    c.resetTransform();

    c.fillStyle = "white";
    c.fillRect(0, 0, w, h);

    let margin = w / 10;
    let scale = (w - margin - rectWidth) / 200;
    let center = 100 * scale + margin + rectWidth / 2;

    c.fillStyle = "grey";
    c.fillRect(0, 0, margin, h);
    c.fillRect(0, h / 2 + rectHeight / 2, w, h / 2);

    c.fillStyle = "green";
    c.fillRect(x * scale - rectWidth / 2 + center, h / 2 - rectHeight / 2, rectWidth, rectHeight);

    c.strokeStyle = "red";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(x * scale + center, h / 2);
    c.lineTo((x + v) * scale + center, h / 2);
    c.stroke();

    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(center, h / 2 + rectHeight / 2);
    c.lineTo(center, h / 2 + rectHeight);
    c.stroke();
}

resize();
requestAnimationFrame(update);
