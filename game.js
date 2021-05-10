var screenWidth = 1800;
var screenHeight = 900;
var keysdown = {};

// level content
var playerHeight = 120;
var playerWidth = 45;
var player = new Player(screenWidth / 2, 0, playerWidth, playerHeight);

var floorHeight = 50;
var blockWidth = screenWidth;
var block = new Block(0, screenHeight - floorHeight, blockWidth, floorHeight,
        '#000000');

var obeliskHeight = 500;
var obeliskWidth = 50;
var obelisk = new Block(500, screenHeight - (floorHeight + obeliskHeight),
        obeliskWidth, obeliskHeight, '#0000FF');

var elements = [player, block, obelisk];

// game class
var canvas = document.createElement('canvas');
canvas.width = screenWidth;
canvas.height = screenHeight;
var context = canvas.getContext('2d');

var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60); // 60 fps
        };

var update = function () {
    player.update();
};

var render = function () {
    context.fillStyle = "#510575";
    context.fillRect(0, 0, screenWidth, screenHeight);

    // render other elements:
    player.render();
    block.render();
    obelisk.render();
};

var step = function () {
    update();
    render();
    animate(step);
};

window.onload = function () {
    $(canvas).appendTo('.game');
    animate(step);
};

//TODO implement level class
//var currentLevel = function () {
//    return currentLevel;
//};

var jumpKeyReleasedMidAir = false;

/**
 * Main jQuery key event handling function.
 */
var main = function () {
    $(document).keydown(function (event) {
        if (event.which !== 38) { // not jump action
            keysdown[event.which] = true;
        } else if (!jumpKeyReleasedMidAir) {
            // can only jump from ground level
            keysdown[event.which] = true;
        } else if (!player.jumping) {
            jumpKeyReleasedMidAir = false;
            keysdown[event.which] = true;
        }
    });

    $(document).keyup(function (event) {
        keysdown[event.which] = false;
        if (event.which === 38 && !player.jumping) { // jump action
            jumpKeyReleasedMidAir = true;
        }
    });
};
$(document).ready(main);