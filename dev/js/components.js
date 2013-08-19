(function () {
    'use strict';

    Crafty.c('Cell', {
        init: function () {
            this.requires('2D, Canvas, Color');
            this.attr({
                w: game.tile_width,
                h: game.tile_height
            });
        },

        at: function (x, y) {
            if (x === undefined && y === undefined) {
                return {x: this.x / this.w, y: this.y / this.h};
            }
            else {
                this.attr({x: x * this.w, y: y * this.h});
                return this;
            }
        }
    });

    Crafty.c('Open', {
        init: function () {
            this.requires('Cell').color('#FFFFFF');
        }
    });

    Crafty.c('Wall', {
        init: function () {
            this.requires('Cell, Solid').color('#000000');
        }
    });

    Crafty.c('Start', {
        init: function () {
            this.requires('Cell').color('#00FF00');
        }
    });

    Crafty.c('End', {
        init: function () {
            this.requires('Cell').color('#FF0000');
        }
    });

    Crafty.c('Player', {
        init: function () {
            this.requires('Cell, Fourway, Collision')
                .attr({w: this.w/2, h: this.h/2})
                .color('#FFFF00')
                .fourway(2)
                .stopOnSolids()
                .onHit('End', this.victory);
        },

        stopOnSolids: function () {
            this.onHit('Solid', this.stopMovement);

            return this;
        },

        stopMovement: function () {
            this._speed = 0;
            if (this._movement) {
                this.x -= this._movement.x;
                this.y -= this._movement.y;
            }
        },

        victory: function () {
            Crafty.scene('Victory');
        }

    })
})();
