// @ts-check

/** @type {{ [name:string]: Variable }} */
const vars = {
    "h": { min: 0.001, max: 1, step: 0.001, value: 0.5 }
}

setup_vars(vars, reset);

window.addEventListener("resize", () => {
    resize();
});

const canvas = document.createElement("canvas");
canvas.style.width = "95vw";
canvas.style.height = "95vh";
document.body.appendChild(canvas);

/** @type {CanvasRenderingContext2D} */
let c;

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    c = canvas.getContext("2d");
    c.fillStyle = "white";
    reset();
}

/**
 * @param {number} x
 * @returns {number}
 */
function f(x) {
    return Math.pow(Math.E, -x / 2.0) * Math.cos(2.0 * x);
}
/**
 * @param {number} x
 * @returns {number}
 */
function f_der(x) {
    return -1.0 / 2.0 * Math.pow(Math.E, -x / 2.0) * Math.cos(2.0 * x) - 2.0 * Math.pow(Math.E, -x / 2.0) * Math.sin(2.0 * x);
}

const max_interval = 1000;
const increment_per_iter = 100;

/** @type {number} */
let interval;
/** @type {number} */
let current;
/** @type {number} */
let x;
/** @type {{x: number, y: number[]}[]} */
let points;
/** @type {Bounds} */
let bounds;

function reset() {
    interval = increment_per_iter;
    current = 0;
    points = [];
    bounds = {
        x_min: -10,
        x_max: 2,
        y_min: Infinity,
        y_max: -Infinity,
    };
    x = bounds.x_min;
}

function update() {
    requestAnimationFrame(update);
    if (interval > max_interval) {
        return;
    }
    const step = (bounds.x_max - bounds.x_min) / interval;
    const h = vars.h.value;

    const first = points.length == 0;

    for (let i = 0; i < increment_per_iter + (first ? 1 : 0); i++) {
        const y1 = f_der(x);
        const y2 = (f(x + h) - f(x - h)) / 2 / h;
        points.splice(current, 0, { x, y: [y1, y2] });
        current += (first ? 1 : 2);
        x += step * (first ? 1 : 2);
        bounds.y_min = Math.min(bounds.y_min, y1, y2);
        bounds.y_max = Math.max(bounds.y_max, y1, y2);
    }

    if (current >= interval) {
        interval *= 2;
        current = 1;
        x = bounds.x_min + step / 2;
        if (interval > max_interval) {
            console.log("done");
        }
    }

    draw_points(c, points, ["#11bb11", "#bb1111"], bounds);
}

resize();
update();
