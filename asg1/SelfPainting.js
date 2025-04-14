class SelfPainting {
    constructor() {
        this.type = 'selfPainting';
    }

    render() {
        let c = new Circle();
        c.color = [1.0, 1.0, 0.0, 1.0];
        c.segments = 8;
        c.size = 30;
        c.render();

        var rgba = [1.0, 0.0, 0.0, 1.0];
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle([-1.0, -1.0, -1.0, -0.9, -0.9, -1.0]);
        drawTriangle([1.0, 1.0, 1.0, 0.9, 0.9, 1.0]);
        drawTriangle([-1.0, 1.0, -1.0, 0.9, -0.9, 1.0]);
        drawTriangle([1.0, -1.0, 1.0, -0.9, 0.9, -1.0]);

        rgba = [1.0, 1.0, 1.0, 1.0];
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle([-0.5, -0.5, -0.6, -0.5, -0.5, -0.6]);
        drawTriangle([0.5, 0.5, 0.5, 0.6, 0.6, 0.5]);
        drawTriangle([-0.5, 0.5, -0.6, 0.5, -0.5, 0.6]);
        drawTriangle([0.5, -0.5, 0.5, -0.6, 0.6, -0.5]);

        rgba = [0.0, 1.0, 1.0, 1.0];
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle([0, 0.7, 0.1, 0.87, -0.1, 0.87]);
        drawTriangle([0, -0.7, 0.1, -0.87, -0.1, -0.87]);
        drawTriangle([-0.7, 0, -0.87, 0.1, -0.87, -0.1]);
        drawTriangle([0.7, 0, 0.87, 0.1, 0.87, -0.1]);
    }
}