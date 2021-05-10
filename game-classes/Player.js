/* global screenWidth, screenHeight, context, keysdown, elements, Block */

function Player(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.render = function () {
        var img = new Image();
        // apply correct image:
        if (keysdown[39] && keysdown[37]) { // idle if both keys are pressed
            if (this.falling()) {
                img.src = "images/falling.png";
            } else {
                img.src = "images/idle.png";
            }
        } else if (keysdown[39]) { // right
            if (this.h_velocity >= this.MAX_H_VELOCITY) {
                img.src = "images/fast right.png";
            } else {
                img.src = "images/slow right.png";
            }
        } else if (keysdown[37]) { // left
            if (this.h_velocity <= this.MIN_H_VELOCITY) {
                img.src = "images/fast left.png";
            } else {
                img.src = "images/slow left.png";
            }
        } else { // idle
            if (this.falling()) {
                img.src = "images/falling.png";
            } else {
                img.src = "images/idle.png";
            }
        }
        context.drawImage(img, this.x, this.y);
    };

    this.update = function () {
        // move if left or right arrow key is pressed
        this.moveLeft();
        this.moveRight();

        // jump if up arrow is pressed
        this.jump();

        // if back on the ground, settle back down
        this.applyGravity();
    };

    this.MAX_H_VELOCITY = 15;
    this.MIN_H_VELOCITY = 0 - this.MAX_H_VELOCITY;
    this.h_velocity = 0;

    this.moveRight = function () {
        var collision = this.getRightCollision();
        if (keysdown[39] && !keysdown[37]) { // right arrow
            if (!this.atRightBoundary()) {
                if (!(collision instanceof Block)) {
                    this.x += this.h_velocity++;
                    if (this.h_velocity > this.MAX_H_VELOCITY) {
                        this.h_velocity = this.MAX_H_VELOCITY;
                    }
                }
            } else {
                this.x = screenWidth - this.width;
                this.h_velocity = 0;
            }
            if (collision instanceof Block) {
                this.x = collision.x - this.width;
                this.h_velocity = 0;
            }
        } else if (this.h_velocity > 0) {
            this.x += this.h_velocity--;
        }
    };

    this.moveLeft = function () {
        if (keysdown[37] && !keysdown[39]) { // left arrow
            var collision = this.getLeftCollision();

            if (this.atLeftBoundary()) { // wrap screen left
                this.x = screenWidth;
            }
            
            if (collision instanceof Block) {
                this.x = collision.x + collision.width;
                this.h_velocity = 0;
            } else {
                // move left
                this.x -= -this.h_velocity--;
                if (this.h_velocity < this.MIN_H_VELOCITY) {
                    this.h_velocity = this.MIN_H_VELOCITY;
                }
            }

        } else if (this.h_velocity < 0) {
            this.x += this.h_velocity++;
        }
    };

    this.MAX_MOMENTUM = 250;
    this.MAX_V_VELOCITY = 30;
    this.VELOCITY_ADJUSTMENT = 3;
    this.momentum = this.MAX_MOMENTUM;
    this.v_velocity = this.MAX_V_VELOCITY;
    this.jumping = false;
    this.jumpReset = true;

    this.jump = function () {
        if (keysdown[38] && this.jumpReset) { // up arrow
            this.jumping = true;
            this.jumpReset = false;
        } else if (!keysdown[38] || this.falling()) {
            this.jumpReset = true;
            this.jumping = false;
        }
        
        if (this.jumping) {
            if (this.momentum > 0) { // jump
                this.y -= this.v_velocity;
                this.momentum -= this.v_velocity;
                this.v_velocity -= this.VELOCITY_ADJUSTMENT;
            } else {
                this.jumping = false;
            }
        } else if (this.v_velocity < this.MAX_V_VELOCITY) {
            this.y -= this.v_velocity;
            this.v_velocity -= this.VELOCITY_ADJUSTMENT;
        }
    };

    this.MASS = 10;
    this.ACCELERATION = 1.05;
    this.gravity = this.MASS;

    this.applyGravity = function () {
        if (!this.jumping) {
            this.gravity = this.gravity * this.ACCELERATION;
            this.y += this.gravity;
            var collision = this.getFootCollision();
            // adjust if y falls out of bounds
            if (this.atGroundLevel()) {
                this.y = 0;
                this.settle();
            } else if (collision instanceof Block) {
                this.y = collision.y - this.height;
                this.settle();
            }
        }
    };

    this.settle = function () {
        this.momentum = this.MAX_MOMENTUM;
        this.v_velocity = this.MAX_V_VELOCITY;
        this.gravity = this.MASS;
        this.jumping = false;
    };

    this.HITBOX_PADDING = 10; // to test with value

    this.getFootCollision = function () {
        for (var i = 0; i < elements.length; i++) {
            var subject = elements[i];
            if (subject instanceof Player) {
                continue;
            }
            var xCollision = this.x + this.width - this.HITBOX_PADDING > subject.x
                    && this.x + this.HITBOX_PADDING < subject.x + subject.width;
            var foot = this.y + this.height - this.HITBOX_PADDING >= subject.y; //Can remove hitbox padding for foot
            if (xCollision && foot) {
                return subject;
            }
        }
    };

    this.getLeftCollision = function () {
        for (var i = 0; i < elements.length; i++) {
            var subject = elements[i];
            if (subject instanceof Player) {
                continue;
            }
            var yCollision = this.y + this.height - this.HITBOX_PADDING >= subject.y
                    && this.y + this.HITBOX_PADDING <= subject.y + subject.height;
            var left = this.x - this.HITBOX_PADDING >= subject.x
                    && this.x + this.HITBOX_PADDING <= subject.x + subject.width;
            if (yCollision && left) {
                return subject;
            }
        }
    };

    this.getRightCollision = function () {
        for (var i = 0; i < elements.length; i++) {
            var subject = elements[i];
            if (subject instanceof Player) {
                continue;
            }
            var yCollision = this.y + this.height - this.HITBOX_PADDING >= subject.y
                    && this.y + this.HITBOX_PADDING <= subject.y + subject.height;
            var right = this.x + this.width - this.HITBOX_PADDING >= subject.x
                    && this.x + this.width + this.HITBOX_PADDING <= subject.x + subject.width;
            if (yCollision && right) {
                return subject;
            }
        }
    };

    /**
     * Check all elements for collision. This method uses hit-detection on 
     * element boundary to determine whether two objects are colliding.
     * 
     * @returns {Player.getCollision.subject} colliding subject
     */
    this.getCollision = function () { //TODO getCollision(s) return array
        for (var i = 0; i < elements.length; i++) {
            var subject = elements[i];
            if (subject instanceof Player) {
                continue;
            }
            var xCollision = this.x + this.width - this.HITBOX_PADDING >= subject.x
                    && this.x + this.HITBOX_PADDING <= subject.x + subject.width;
            var yCollision = this.y + this.height - this.HITBOX_PADDING >= subject.y
                    && this.y + this.HITBOX_PADDING <= subject.y + subject.height;
            if (xCollision && yCollision) {
                return subject;
            }
        }
    };

    this.atGroundLevel = function () {
        return this.y >= screenHeight - this.height;
    };

    this.falling = function () {
        return this.gravity > this.MASS;
    };

    this.atLeftBoundary = function () {
        return this.x <= 0;
    };

    this.atRightBoundary = function () {
        return this.x >= screenWidth - this.width;
    };
}
