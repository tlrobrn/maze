'use strict';

// Date.now shim (for IE < 9)
Date.now = (function() {
    return Date.now || function() {
        return +new Date();
    };
})();

var game = {
    width: 640,
    height: 480,
    tile_width: 32,
    tile_height: 32,

    start: function () {
        Crafty.init(this.width, this.height);
        Crafty.scene('Loading');
    }
};
