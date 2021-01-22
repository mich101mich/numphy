// @ts-check

/** @type {{ [name:string]: Variable }} */
const vars = {
    "k": { min: 0, max: 10, step: 0.1, value: 1 },
    "friction": { min: 0, max: 5, step: 0.1, value: 0 },
    "external": { min: -10, max: 10, step: 0.1, value: 0 },
    "mass": { min: 0, max: 10, step: 0.1, value: 1 },
    "x_0": { min: -100, max: 100, step: 1, value: 0 },
    "v_0": { min: -100, max: 100, step: 1, value: 10 },
    "objects": { min: 1, max: 5, step: 1, value: 1 },
}

setup_vars(vars, name => { if (name == "objects") reset() });

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

/** @type {number[]} */
let x;
/** @type {number[]} */
let base;
/** @type {number[]} */
let v;

function reset() {
    const n = vars.objects.value;
    const x_0 = vars.x_0.value;
    const v_0 = vars.v_0.value;
    if (n == 1) {
        base = [0];
        x = [x_0];
        v = [v_0];
    } else {
        base = [];
        x = [];
        v = [];
        let distance = 200 / n;
        for (let i = 0; i < n; i++) {
            let p = -100 + distance / 2 + distance * i;
            base.push(p);
            x.push(p);
            v.push(v_0 * Math.sign(Math.random() - 0.5));
        }
    }
}

const rectWidth = 80;
const rectHeight = 40;
const stepSize = 5;
const dt = stepSize / 1000;

let maxIterations = 10;
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

    const n = vars.objects.value;
    const m = vars.mass.value;
    const k = vars.k.value;
    const Fex = vars.external.value;
    const friction = vars.friction.value;
    const delta = 200 / n;

    let iterations = 0;
    while (time - lastTime > stepSize) {
        lastTime += stepSize;
        if (++iterations >= maxIterations) {
            break;
        }

        let old_x = x.slice();

        for (let i = 0; i < n; i++) {
            let d_left = i > 0 ? (old_x[i] - old_x[i - 1] - delta) : (old_x[i] + 100 - delta / 2);
            let d_right = i < n - 1 ? (old_x[i + 1] - old_x[i] - delta) : (100 - old_x[i] - delta / 2);
            let a = -friction * v[i] - k / m * (d_left - d_right) + Fex / m;
            v[i] += a * dt;
            x[i] += v[i] * dt;
            if (x[i] < -100) {
                x[i] = -100;
                v[i] = 0;
            }
            if (x[i] > 100) {
                x[i] = 100;
                v[i] = 0;
            }
        }
    }
    if (iterations >= maxIterations) {
        if ((time - lastTime) / stepSize < maxIterations * 90) {
            maxIterations *= 0.95;
        } else {
            maxIterations *= 1.05;
        }
        maxIterations = Math.min(maxIterations, 200);
        maxIterations = Math.max(maxIterations, 10);
    } else {
        maxIterations *= 0.9;
        maxIterations = Math.max(maxIterations, 10);
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

    for (let i = 0; i < n; i++) {

        c.fillStyle = "green";
        c.fillRect(x[i] * scale - rectWidth / 2 + center, h / 2 - rectHeight / 2, rectWidth, rectHeight);

        c.strokeStyle = "red";
        c.lineWidth = 5;
        c.beginPath();
        c.moveTo(x[i] * scale + center, h / 2);
        c.lineTo((x[i] + v[i]) * scale + center, h / 2);
        c.stroke();
    }

    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(center, h / 2 + rectHeight / 2);
    c.lineTo(center, h / 2 + rectHeight);
    c.stroke();

    c.textBaseline = "top";
    c.fillStyle = "black";
    let hours = Math.floor(lastTime / 1000);
    let seconds = left_pad(hours % 60, 2, '0');
    seconds = seconds.substr(seconds.length - 2, 2);
    hours = Math.floor(hours / 60);
    let minutes = left_pad(hours % 60, 2, '0');
    minutes = minutes.substr(minutes.length - 2, 2);
    hours = Math.floor(hours / 60);
    c.font = "monospace";
    c.fillText(`Time: ${hours}:${minutes}:${seconds}`, margin, 0);
}

resize();
requestAnimationFrame(update);
