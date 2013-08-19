(function () {
    'use strict';

    var shuffle, dsets, maze;

    // Util Functions
    shuffle = function (array) {
        for (var i = array.length, j, temp; i--;) {
            j = Math.floor(Math.random() * i + 1);
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    };

    // Disjoint Sets
    dsets = {
        _sets: [],

        make_set: function (count) {
            if (count === undefined) {
                count = 1;
            }
            for (var i = count; i--;) {
                this._sets.push(-1);
            }

            return this;
        },

        find: function (x) {
            if (this._sets[x] < 0) {
                return x;
            }

            this._sets[x] = this.find(this._sets[x]);
            return this._sets[x];
        },

        union: function (a, b) {
            a = this.find(a);
            b = this.find(b);

            if (a !== b) {
                if (this._sets[a] < this._sets[b]) {
                    this._sets[a] += this._sets[b];
                    this._sets[b] = a;
                }
                else {
                    this._sets[b] += this._sets[a];
                    this._sets[a] = b;
                }
            }

            return this;
        },

        reset: function () {
            this._sets.length = 0;

            return this;
        }
    };

    // Maze
    maze = {
        _walls: [],
        _width: 0,
        _height: 0,
        _start: 0,
        _end: 0,

        create: function (width, height) {
            var east = [], south = [], x, y, i;

            this._width = width;
            this._height = height;
            this._walls.length = width * height;
            dsets.reset().make_set(this._walls.length);

            for (y = this._height; y--;) {
                for (x = this._width; x--;) {
                    i = x + y * width;
                    if ((x & 1) || (y & 1)) {
                        this._walls[i] = true;
                    }
                    else {
                        this._walls[i] = false;
                        east.push(i);
                        south.push(i);
                    }
                }
            }
            shuffle(east);
            shuffle(south);

            for (i = east.length; i--;) {
                this._trywall(east[i], true);
                this._trywall(south[i], false);
            }

            this.solve();
        },

        _trywall: function (index, is_east) {
            var step;
            if (is_east) {
                if (this._width === 1 || index % this._width >= this._width - 2) {
                    return;
                }
                step = 1;
            }
            else {
                if (this._height === 1 || Math.floor(index / this._width) >= this._height - 2) {
                    return;
                }
                step = this._width;
            }

            if (dsets.find(index) !== dsets.find(index + step * 2)) {
                this._walls[index + step] = false;
                dsets.union(index, index + step);
                dsets.union(index, index + step * 2);
            }

        },

        solve: function () {
            var length = 0, end_x = 0, end_y = 0, visited = [];
            visited.length = this._walls.length;

            (function dfs(x, y, len) {
                var index, neighbor;
                index = x + y * maze._width;
                visited[index] = true;

                if (x > 0) { // LEFT
                    neighbor = x - 1 + y * maze._width;
                    if (!visited[neighbor] && !maze._walls[neighbor]) {
                        dfs(x - 1, y, len + 1);
                    }
                }
                if (x < maze._width - 1) { // RIGHT
                    neighbor = x + 1 + y * maze._width;
                    if (!visited[neighbor] && !maze._walls[neighbor]) {
                        dfs(x + 1, y, len + 1);
                    }
                }
                if (y > 0) { // UP
                    neighbor = x + (y - 1) * maze._width;
                    if (!visited[neighbor] && !maze._walls[neighbor]) {
                        dfs(x, y - 1, len + 1);
                    }
                }
                if (y < maze._height - 1) { // DOWN
                    neighbor = x + (y + 1) * maze._width;
                    if (!visited[neighbor] && !maze._walls[neighbor]) {
                        dfs(x, y + 1, len + 1);
                    }
                }

                if ((len > length) || (len === length && y > end_y) || (len === length && y === end_y && x < end_x)) {
                    length = len;
                    maze._end = index;
                    end_x = x;
                    end_y = y;
                }

                visited[index] = false;
            })(0, 0, 0);
        }
    };

    Crafty.scene('Maze', function () {
        // Create and display Maze
        Crafty.audio.play('theme', -1);
        maze.create(game.width/game.tile_width, game.height/game.tile_height);
        for (var i = maze._walls.length, x, y; --i;) {
            x = i % maze._width;
            y = Math.floor(i / maze._width);

            if (i === maze._end) {
                Crafty.e('End').at(x, y);
            }
            else {
                Crafty.e((maze._walls[i])? 'Wall' : 'Open').at(x, y);
            }
        }
        // Add edge walls (unseen)
        for (i = maze._height; i--;) {
            Crafty.e('Cell, Solid').at(-1, i);
            Crafty.e('Cell, Solid').at(maze._width, i);
        }
        for (i = maze._width; i--;) {
            Crafty.e('Cell, Solid').at(i, -1);
            Crafty.e('Cell, Solid').at(i, maze._height);
        }
        // Add Start location and player
        Crafty.e('Start').at(0,0);
        Crafty.e('Player').at(0,0);
    });

    var new_maze = function () {
        Crafty.scene('Maze');
    };

    Crafty.scene('Victory', function () {
        Crafty.background('#00FF00');

        Crafty.bind('KeyDown', new_maze);
    }, function () {
        Crafty.unbind('KeyDown', new_maze);
    });

    Crafty.scene('Loading', function () {
        var msg = Crafty.e('2D, DOM, Text')
            .text('Loading...')
            .attr({x: 0, y: game.height/2, w: game.width})
            .css({'color' : '#FFFFFF'});

        Crafty.audio.canPlay();
        Crafty.load([
            'assets/audio/Lost.mp3',
            'assets/audio/Lost.ogg'
        ], function () {
            Crafty.audio.add({
                theme: [
                    'assets/audio/Lost.mp3',
                    'assets/audio/Lost.ogg'
                ]});

            Crafty.scene('Maze');
        }, function (obj) {
            msg.text('Loading... ' + obj.percent + '%');
        }, function (e) {
            console.log(e);
        });
    });
})();
