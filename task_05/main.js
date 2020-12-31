// @ts-check

/** @typedef {{ min: number, max: number, step: number, value: number, label?: HTMLLabelElement, slider?: HTMLInputElement }}  Variable */

/** @type {{ [name:string]: Variable }} */
const vars = {
    "h": { min: 0.001, max: 1, step: 0.001, value: 0.5 }
}

for (const key in vars) {
    const v = vars[key];

    let pre_digits = v.max.toString().split(".")[0].length;
    let post_digits = 0;
    for (const num of [v.min, v.max, v.step]) {
        const second = num.toString().split(".")[1];
        if (second && second.length > post_digits) {
            post_digits = second.length;
        }
    }

    v.label = document.createElement("label");
    v.label.htmlFor = "slider_" + key;
    v.label.textContent = `${key}: ${zero_pad_float(v.value, pre_digits, post_digits)}`
    v.slider = document.createElement("input");
    v.slider.type = "range";
    v.slider.id = "slider_" + key;
    v.slider.min = v.min.toString();
    v.slider.max = v.max.toString();
    v.slider.step = v.step.toString();
    v.slider.value = v.value.toString();

    document.body.appendChild(v.label);
    document.body.appendChild(v.slider);
    document.body.appendChild(document.createElement("br"))

    v.slider.addEventListener("input", e => {
        v.value = parseFloat(v.slider.value);
        v.label.textContent = `${key}: ${zero_pad_float(v.value, pre_digits, post_digits)}`;
        reset();
    });
}

let w = window.innerWidth, h = window.innerHeight;
window.addEventListener("resize", () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w;
    canvas.height = h;
    c = canvas.getContext("2d");
    c.fillStyle = "white";
    reset();
})

const canvas = document.createElement("canvas");
canvas.style.width = "95vw";
canvas.style.height = "95vh";
canvas.width = w;
canvas.height = h;
document.body.appendChild(canvas);
let c = canvas.getContext("2d");
c.fillStyle = "white";

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
let interval = increment_per_iter;
let current = 0;
let x = -10;
let points = [];
let y_min = Infinity, y_max = -Infinity;

function reset() {
    interval = increment_per_iter;
    current = 0;
    x = -10;
    points = [];
    y_min = Infinity, y_max = -Infinity;
}
reset();

function update() {
    requestAnimationFrame(update);
    if (interval > max_interval) {
        return;
    }
    const step = 12 / interval;
    const var_h = vars.h.value;

    const first = points.length == 0;

    for (let i = 0; i < increment_per_iter + (first ? 1 : 0); i++) {
        const y1 = f_der(x);
        const y2 = (f(x + var_h) - f(x - var_h)) / 2 / var_h;
        points.splice(current, 0, { x, y1, y2 });
        current += (first ? 1 : 2);
        x += step * (first ? 1 : 2);
        if (Math.abs(y2) < 100000) {
            y_min = Math.min(y_min, y1, y2);
            y_max = Math.max(y_max, y1, y2);
        }
    }

    if (current >= interval) {
        interval *= 2;
        current = 1;
        x = -10 + 12 / interval;
        if (interval > max_interval) {
            console.log("done");
        }
    }

    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#000000";
    c.beginPath();
    draw_point(-10, 0, false);
    draw_point(2, 0);
    c.stroke();

    c.strokeStyle = "#11bb11";
    c.beginPath();
    draw_point(points[0].x, points[0].y1, false);
    c.moveTo(points[0].x, points[0].y1);
    for (const v of points) {
        draw_point(v.x, v.y1);
    }
    c.stroke();
    c.strokeStyle = "#bb1111";
    c.beginPath();
    draw_point(points[0].x, points[0].y2, false);
    for (const v of points) {
        draw_point(v.x, v.y2);
    }
    c.stroke();
}

update();

function draw_point(x, y, line = true) {
    const real_x = (x + 10) / 12 * w;
    const real_y = (y - y_min) / (y_max - y_min) * h;
    if (line) {
        c.lineTo(real_x, real_y);
    } else {
        c.moveTo(real_x, real_y);
    }
}

/**
 * @param {number} s
 * @param {number} pre_len
 * @param {number} post_len
 */
function zero_pad_float(s, pre_len, post_len) {
    let [pre, post] = s.toString().split(".");
    while (pre.length < pre_len) {
        pre = "0" + pre;
    }
    if (post_len == 0) {
        return pre;
    }
    post = post || "0";
    while (post.length < post_len) {
        post += "0";
    }
    return pre + "." + post;
}
