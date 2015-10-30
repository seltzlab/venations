module.exports = function(grunt) {

    require('jit-grunt')(grunt);require('jit-grunt')(grunt);

    grunt.initConfig({

        watch: {
            js: {
                files: ['src/**/*.js', 'src/**/*.json'],
                tasks: ['build']
            }
        },

        clean: {
            options: {
                force: true
            },
            all: {
                files: [{
                    dot: true,
                    src: [
                        'dist/*'
                    ]
                }]
            }
        },

        uglify: {
            prod: {
                options: {
                    beautify: false
                },
                files: [{
                    'dist/venations.min.js': 'dist/venations.js'
                }]
            }
        },

        browserify: {
            options: {
                browserifyOptions: {
                    debug: true
                },
                debug: true,
                transform: ['debowerify']
            },
            dev : {

                files : {
                    'dist/venations.js' : ['src/**/*.js']
                }
            }
        },

        concat: {
            dev: {
                files: {
                    'dist/vendor.js': [
                        'vendor/paper/dist/paper-full.min.js',
                        'vendor/underscore/underscore-min.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask('build', ['clean:all', 'browserify:dev', 'concat']);
    grunt.registerTask('build:prod', ['build', 'uglify:prod']);

    grunt.registerTask('default', ['build']);
}
