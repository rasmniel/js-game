/* global context */

function Block(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    this.render = function () {
        context.fillStyle = color;
        context.fillRect(this.x, this.y, this.width, this.height);
    };

    this.update = function () {
        //Block does not update
    };
}

