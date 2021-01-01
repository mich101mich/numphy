// @ts-check

/** @type {{ [name:string]: Variable }} */
const vars = {
    "min_t": { min: -10, max: 10, step: 0.1, value: -2 },
    "range": { min: 0.1, max: 20, step: 0.1, value: 4 },
    "N": { min: 1, max: 100, step: 1, value: 10 },
}

setup_vars(vars, reset);

window.addEventListener("resize", () => {
    resize();
});

const canvas = document.createElement("canvas");
canvas.style.width = "95vw";
canvas.style.height = "calc(95vh - " + document.getElementById("sliders").clientHeight + "px)";
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

// const A = Math.sqrt(Math.sqrt(8 / Math.PI));

/**
 * @param {number} x
 * @returns {number}
 */
function f(x) {
    return Math.sin(x + 1);
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
/** @type {{omega: number, value: number}[]} */
let frequencies;

function reset() {
    const t_0 = vars.min_t.value;
    const L = vars.range.value;
    const N = vars.N.value;
    const delta_t = L / N;

    interval = increment_per_iter;
    current = 0;
    points = [];
    bounds = {
        x_min: t_0,
        x_max: t_0 + L,
        y_min: Infinity,
        y_max: -Infinity,
    };
    x = bounds.x_min;
    frequencies = [];

    const factor = 1 / Math.sqrt(L);
    for (let q = 0; q < N; q++) {
        let omega = 2 * Math.PI * q / N;// / delta_t;
        let sum = 0;
        for (let k = 0; k < N; k++) {
            let t_k = t_0 + k * delta_t;
            let f_k = f(t_k);
            sum += f_k * Math.cos(-2 * Math.PI * q * k / N);
        }
        sum *= factor;
        frequencies.push({ omega, value: sum });
    }
    console.log(frequencies);
}

function update() {
    requestAnimationFrame(update);
    if (interval > max_interval) {
        return;
    }
    const step = (bounds.x_max - bounds.x_min) / interval;

    const first = points.length == 0;

    for (let i = 0; i < increment_per_iter + (first ? 1 : 0); i++) {
        const y1 = f(x);
        let y2 = 0;
        for (const {omega, value} of frequencies) {
            y2 += value * Math.cos(omega * x);
        }
        points.splice(current, 0, { x, y: [y1, y2] });
        current += (first ? 1 : 2);
        x += step * (first ? 1 : 2);
        if (Math.abs(y2) < 100000) {
            bounds.y_min = Math.min(bounds.y_min, y1, y2);
            bounds.y_max = Math.max(bounds.y_max, y1, y2);
        }
    }

    draw_points(c, points, ["#11bb11", "#bb1111"], bounds);

    if (current >= interval) {
        interval *= 2;
        current = 1;
        x = bounds.x_min + step / 2;
        if (interval > max_interval) {
            console.log("done");
        }
    }
}

resize();
update();
