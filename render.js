let cloudTranslationX = 0.0;
let lineAngle = 0.0;

function main() {
    const canvas = document.getElementById("screen");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    const vertexShaderSource = `#version 300 es
        precision mediump float;
        
        in vec2 a_position;
        uniform vec2 u_resolution;
        uniform vec2 u_translation;
        uniform vec2 u_scale;

        void main() {
            vec2 scaledPosition = a_position * u_scale;
            vec2 translatedPosition = scaledPosition + u_translation;
            vec2 clipSpace = (translatedPosition / u_resolution) * 2.0 - 1.0;
            clipSpace *= vec2(1, -1);

            gl_Position = vec4(clipSpace, 0, 1);
        }
    `;

    const fragmentShaderSource = `#version 300 es
        precision highp float;

        uniform vec4 u_color;
        out vec4 fragColor;

        void main() {
            fragColor = u_color;
        }
    `;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);


    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const program = createProgram(gl, vertexShader, fragmentShader);

    const a_position = gl.getAttribLocation(program, "a_position");
    const u_translation = gl.getUniformLocation(program, "u_translation");
    const u_scale = gl.getUniformLocation(program, "u_scale");
    const u_color = gl.getUniformLocation(program, "u_color");
    const u_resolution = gl.getUniformLocation(program, "u_resolution");

    let shaderParameter = { a_position, u_translation, u_scale, u_color, u_resolution };

    

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.5, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);

    gl.uniform2f(shaderParameter.u_translation, 0.0, 0.0);
    gl.uniform2f(shaderParameter.u_scale, 1.0, 1.0);

    renderScene(gl, shaderParameter, cloudTranslationX, lineAngle);
}

function renderScene(gl, shaderParameter, cloudTranslationX, lineAngle) {
    // Update cloud translation
    cloudTranslationX += 5.0;
    if (cloudTranslationX > gl.canvas.width) {
        cloudTranslationX = -800;
    }

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderStaticScene(gl, shaderParameter);

    let x1 = 700;
    let y1 = 100;
    let x2 = x1 + Math.cos(lineAngle) * 50;
    let y2 = y1 + Math.sin(lineAngle) * 50;
    drawLine(gl, shaderParameter, x1, y1, x2, y2, [0.0, 0.0, 0.0, 1]);

    lineAngle += 0.2;

    renderClouds(gl, shaderParameter, cloudTranslationX, lineAngle);

    requestAnimationFrame(() => renderScene(gl, shaderParameter, cloudTranslationX, lineAngle));
}

function renderStaticScene(gl, shaderParameter) {
    gl.uniform2f(shaderParameter.u_translation, 0.0, 0.0);
    gl.uniform2f(shaderParameter.u_scale, 1.0, 1.0);

    // Sun
    drawCircle(gl, shaderParameter, 700, 100, 50, [1.0, 1.0, 0.0, 1]);

    // Mountain
    drawTriangle(gl, shaderParameter, 0, 480, 300, 480, 150, 250, [0.4, 0.3, 0.2, 1]); 
    drawTriangle(gl, shaderParameter, 200, 480, 600, 480, 400, 200, [0.4, 0.3, 0.2, 1]);
    drawTriangle(gl, shaderParameter, 500, 480, 800, 480, 650, 300, [0.4, 0.3, 0.2, 1]);

    // House
    drawRectangle(gl, shaderParameter, 500, 550, 150, 150, [0.8, 0.5, 0.2, 1]); // House base
    drawTriangle(gl, shaderParameter, 475, 550, 675, 550, 575, 450, [0.7, 0.3, 0.2, 1]); // Roof
    drawRectangle(gl, shaderParameter, 550, 625, 50, 75, [0.4, 0.2, 0.1, 1]); // Door
    drawRectangle(gl, shaderParameter, 515, 575, 30, 30, [0.6, 0.8, 1.0, 1]); // Left window
    drawRectangle(gl, shaderParameter, 605, 575, 30, 30, [0.6, 0.8, 1.0, 1]); // Right window

    // Tree
    drawRectangle(gl, shaderParameter, 150, 555, 30, 125, [0.4, 0.2, 0.1, 1]);
    drawTriangle(gl, shaderParameter, 125, 555, 205, 555, 165, 450, [0.2, 0.7, 0.3, 1]);

    // Cat
    drawCircle(gl, shaderParameter, 675, 675, 15, [0.6, 0.6, 0.6, 1]); // Head
    drawTriangle(gl, shaderParameter, 665, 665, 675, 665, 670, 655, [0.6, 0.6, 0.6, 1]); // Left ear
    drawTriangle(gl, shaderParameter, 675, 665, 685, 665, 680, 655, [0.6, 0.6, 0.6, 1]); // Right ear
    drawRectangle(gl, shaderParameter, 670, 675, 50, 15, [0.6, 0.6, 0.6, 1]); // Body
    drawRectangle(gl, shaderParameter, 721, 675, 10, 5, [0.6, 0.6, 0.6, 1]); // Tail
}

function renderClouds(gl, shaderParameter, translationX) {
    gl.uniform2f(shaderParameter.u_scale, 1.0, 1.0);
    gl.uniform2f(shaderParameter.u_translation, translationX, 0.0);

    // Cloud 1
    drawCircle(gl, shaderParameter, 200, 100, 30, [1.0, 1.0, 1.0, 1]); 
    drawCircle(gl, shaderParameter, 230, 100, 40, [1.0, 1.0, 1.0, 1]); 
    drawCircle(gl, shaderParameter, 260, 100, 30, [1.0, 1.0, 1.0, 1]); 

    // Cloud 2
    gl.uniform2f(shaderParameter.u_translation, translationX + 250, 30.0);
    drawCircle(gl, shaderParameter, 200, 100, 30, [1.0, 1.0, 1.0, 1]); 
    drawCircle(gl, shaderParameter, 230, 100, 40, [1.0, 1.0, 1.0, 1]); 
    drawCircle(gl, shaderParameter, 260, 100, 30, [1.0, 1.0, 1.0, 1]); 
}


function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function drawTriangle(gl, shaderParameter, x1, y1, x2, y2, x3, y3, color) {
    const vertices = [
        x1, y1,
        x2, y2,
        x3, y3,
    ];

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(shaderParameter.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderParameter.a_position);

    gl.uniform4fv(shaderParameter.u_color, color);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawRectangle(gl, shaderParameter, x, y, width, height, color) {
    const vertices = [
        x, y,
        x + width, y,
        x, y + height,
        x, y + height,
        x + width, y,
        x + width, y + height,
    ];

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(shaderParameter.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderParameter.a_position);

    gl.uniform4fv(shaderParameter.u_color, color);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function drawCircle(gl, shaderParameter, cx, cy, radius, color) {
    const vertices = [];
    const segments = 100;
    for (let i = 0; i < segments; i++) {
        const angle = ((2 * Math.PI) / segments) * i;
        vertices.push(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(shaderParameter.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderParameter.a_position);

    gl.uniform4fv(shaderParameter.u_color, color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}

function drawLine(gl, shaderParameter, x1, y1, x2, y2, color) {
    const vertices = [x1, y1, x2, y2];

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(shaderParameter.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderParameter.a_position);

    gl.uniform4fv(shaderParameter.u_color, color);
    gl.drawArrays(gl.LINES, 0, 2);
}

main();
