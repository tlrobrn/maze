module.exports = function(grunt) {
    'use strict';
    var js_path = {
        src: ['dev/js/config.js', 'dev/js/components.js', 'dev/js/scenes.js'],
        concat: 'dev/js/src.js',
        dest: 'dist/js/src.min.js'
    };

    grunt.initConfig({
        concat: {
            dist: {
                src: js_path.src,
                dest: js_path.concat
            }
        },
        uglify: {
            dist: {
                src: js_path.concat,
                dest: js_path.dest
            }
        },
        jade: {
            dev: {
                options: {
                    pretty: true,
                    data: {
                        css: ['css/main.css'],
                        js: ['js/crafty.js', 'js/config.js', 'js/components.js', 'js/scenes.js']
                    }
                },
                files: {
                    'dev/index.html': ['dev/*.jade']
                }
            },

            dist: {
                options: {
                    data: {
                        css: ['css/main.css'],
                        js: ['js/crafty.js', 'js/src.min.js']
                    }
                },
                files: {
                    'dist/index.html': ['dev/*.jade']
                }
            }
        },
        stylus: {
            dev: {
                options: { compress: false },
                files: {'dev/css/main.css': 'dev/css/*.styl'}
            },
            dist: {
                files: {'dist/css/main.css': 'dev/css/*.styl'}
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: 'dev/', src: ['assets/**', 'js/crafty.js'], dest: 'dist/'},
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('cleanup', function () {
        grunt.task.requires('concat');
        grunt.task.requires('uglify');
        grunt.file.delete(js_path.concat);
    });

    grunt.registerTask('default', ['concat', 'uglify', 'jade', 'stylus', 'copy', 'cleanup']);
};
