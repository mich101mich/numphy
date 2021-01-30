// @ts-check

/** @type {{ [name:string]: Variable }} */
const vars = {
    "gamma": { min: 0.001, max: 1, step: 0.001, value: 1 },
    "t_max": { min: 10, max: 100, step: 10, value: 50 },
    "N": { min: 10, max: 200, step: 10, value: 20 },
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
    // return 1 / 3 + (pot == 1 ? 2 / 3 : -1 / 3) * Math.exp(-3 * vars.gamma.value * t);
    throw new Error("TODO: Not Implemented");
}

const max_interval = 4000;
const increment_per_iter = 50;

/** @type {number} */
let interval;
/** @type {number} */
let current;
/** @type {number} */
let x;
/** @type {number[]} */
let pots;
/** @type {string[]} */
let colors;
/** @type {{x: number, y: number[]}[]} */
let points;
/** @type {Bounds} */
let bounds;

function reset() {
    interval = increment_per_iter * 8;
    current = 0;
    points = [];
    bounds = {
        x_min: 0,
        x_max: vars.t_max.value,
        y_min: 0,
        y_max: 1,
    };
    x = bounds.x_min;

    pots = [];
    for (let i = 0; i < vars.N.value; i++) {
        pots.push(0);
    }
    pots[Math.floor(vars.N.value / 2)] = 1;

    if (!colors || vars.N.value * 2 != colors.length) {

        colors = [];
        let colors2 = [];
        for (let i = 0; i < vars.N.value; i++) {
            const c = [0, 0, 0].map(() => Math.floor(Math.random() * 255));
            colors2.push("#" + c.map(x => Math.max(0, x - 30))
                .map(x => left_pad(x.toString(16), 2, "0"))
                .join(""));
            colors.push("#" + c
                .map(x => left_pad(x.toString(16), 2, "0"))
                .join(""));
        }
        colors.push(...colors2);
    }
}

function update() {
    requestAnimationFrame(update);
    doStep();
}

function doStep() {
    if (interval > max_interval) {
        return;
    }
    const step = (bounds.x_max - bounds.x_min) / interval;
    const gamma = vars.gamma.value;
    const N = vars.N.value;

    let new_points = [];
    for (let i = 0; i < increment_per_iter; i++) {
        let y = [];
        // for (let pot = 0; pot < N; pot++) {
        //     y.push(control(pot, x));
        // }

        let new_pots = [];
        for (let pot = 0; pot < N; pot++) {
            y.push(pots[pot]);
            new_pots.push(pots[pot] + step * (-gamma * (pots[pot] - pots[(pot + N - 1) % N]) + gamma * (pots[(pot + 1) % N] - pots[pot])))
        }
        pots = new_pots;

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
        pots = [];
        for (let i = 0; i < vars.N.value; i++) {
            pots.push(0);
        }
        pots[Math.floor(vars.N.value / 2)] = 1;

        if (interval > max_interval) {
            console.log("done");
        }
    }

    if (interval <= increment_per_iter * 8) {
        doStep();
        return;
    }

    draw_points(c, points, colors, bounds);
}

resize();
update();
