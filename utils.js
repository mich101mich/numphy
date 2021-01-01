// @ts-check

/**
 * @typedef {{min: number;max: number;step: number;value: number;label?: HTMLLabelElement;slider?: HTMLInputElement;}} Variable
 * @typedef {{ x_min: number, x_max: number, y_min: number, y_max: number }} Bounds
 */

/**
* @param {{ [x: string]: Variable; }} variables
* @param {{ (): void }} reset_callback
*/
function setup_vars(variables, reset_callback) {
    let pre_digits = 0;
    let post_digits = 0;
    for (const key in variables) {
        const v = variables[key];
        for (const num of [v.min, v.max, v.step]) {
            const [pre, post] = num.toString().split(".");
            pre_digits = Math.max(pre_digits, pre.length);
            if (post && post.length > post_digits) {
                post_digits = post.length;
            }
        }
    }

    const div = document.createElement("div");
    div.id = "sliders";

    for (const key in variables) {
        const v = variables[key];

        v.label = document.createElement("label");
        v.label.htmlFor = "slider_" + key;
        v.label.style.fontFamily = "monospace";
        v.label.innerHTML = `${key}: ${pad_float(v.value, pre_digits, post_digits)}`
        v.slider = document.createElement("input");
        v.slider.type = "range";
        v.slider.id = "slider_" + key;
        v.slider.min = v.min.toString();
        v.slider.max = v.max.toString();
        v.slider.step = v.step.toString();
        v.slider.value = v.value.toString();

        div.appendChild(v.label);
        div.appendChild(v.slider);
        div.appendChild(document.createElement("br"))

        v.slider.addEventListener("input", e => {
            v.value = parseFloat(v.slider.value);
            v.label.innerHTML = `${key}: ${pad_float(v.value, pre_digits, post_digits)}`;
            reset_callback();
        });
    }
    document.body.appendChild(div);
}

/**
 * 
 * @param {CanvasRenderingContext2D} c
 * @param {{x: number, y: number[]}[]} points 
 * @param {string[]} colors
 * @param {Bounds} bounds
 */
function draw_points(c, points, colors, bounds) {
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    c.strokeStyle = "#000000";
    c.beginPath();
    draw_point(c, bounds.x_min, 0, bounds, true);
    draw_point(c, bounds.x_max, 0, bounds);
    draw_point(c, 0, bounds.y_min, bounds, true);
    draw_point(c, 0, bounds.y_max, bounds);
    c.stroke();

    for (let i = 0; i < colors.length; i++) {
        c.strokeStyle = colors[i];
        c.beginPath();
        draw_point(c, points[0].x, points[0].y[i], bounds, true);
        for (const v of points) {
            draw_point(c, v.x, v.y[i], bounds);
        }
        c.stroke();

    }
}

/**
 * @param {CanvasRenderingContext2D} c
 * @param {number} x
 * @param {number} y
 * @param {Bounds} bounds
 * @param {boolean} start
 */
function draw_point(c, x, y, bounds, start = false) {
    const real_x = (x - bounds.x_min) / (bounds.x_max - bounds.x_min) * c.canvas.width;
    const real_y = (bounds.y_max - y) / (bounds.y_max - bounds.y_min) * c.canvas.height;
    if (start) {
        c.moveTo(real_x, real_y);
    } else {
        c.lineTo(real_x, real_y);
    }
}


/**
 * @param {number} s
 * @param {number} pre_len
 * @param {number} post_len
 */
function pad_float(s, pre_len, post_len) {
    let [pre, post] = s.toString().split(".");
    for (let i = pre.length; i < pre_len; i++) {
        pre = "&nbsp;" + pre;
    }
    if (post_len == 0) {
        return pre;
    }
    post = post || "0";
    for (let i = post.length; i < post_len; i++) {
        post += "&nbsp;";
    }
    return pre + "." + post;
}
