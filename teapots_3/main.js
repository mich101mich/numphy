// @ts-check

/** @type {{ [name:string]: Variable }} */
const vars = {
    "gamma": { min: 0.001, max: 1, step: 0.001, value: 1 },
    "t_max": { min: 1, max: 10, step: 1, value: 5 },
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

/**
 * @param {number} pot
 * @param {number} t
 */
function control(pot, t) {
    return 1 / 3 + (pot == 1 ? 2 / 3 : -1 / 3) * Math.exp(-3 * vars.gamma.value * t);
}

const max_interval = 10000;
const increment_per_iter = 100;

/** @type {number} */
let interval;
/** @type {number} */
let current;
/** @type {number} */
let x;
/** @type {number[]} */
let pots;
/** @type {{x: number, y: number[]}[]} */
let points;
/** @type {Bounds} */
let bounds;

function reset() {
    interval = increment_per_iter;
    current = 0;
    points = [];
    bounds = {
        x_min: 0,
        x_max: vars.t_max.value,
        y_min: 0,
        y_max: 1,
    };
    x = bounds.x_min;
    pots = [0, 1, 0];
}
let skip_iter = 0;
function update() {
    requestAnimationFrame(update);
    if (interval > max_interval) {
        return;
    }
    const step = (bounds.x_max - bounds.x_min) / interval;
    const gamma = vars.gamma.value;

    let new_points = [];
    for (let i = 0; i < increment_per_iter; i++) {
        let y = [];
        for (let pot = 0; pot < 3; pot++) {
            y.push(control(pot, x));
        }

        y.push(...pots);

        pots = [
            pots[0] + step * (gamma * (pots[1] - pots[0])),
            pots[1] + step * (-gamma * (pots[1] - pots[0]) + gamma * (pots[2] - pots[1])),
            pots[2] + step * (/*                        */ - gamma * (pots[2] - pots[1])),
        ];

        new_points.push({ x, y });
        x += step;
    }

    if (points.length > 0) {
        points.splice(current, increment_per_iter / 2, ...new_points);
    } else {
        points = new_points;
    }
    current += increment_per_iter;

    if (current >= interval) {
        interval *= 2;
        current = 0;
        x = 0;
        pots = [0, 1, 0];
        if (interval > max_interval) {
            console.log("done");
        }
    }

    draw_points(c, points, ["#880000", "#008800", "#000088", "#ff0000", "#00ff00", "#0000ff"], bounds);
}

resize();
update();
