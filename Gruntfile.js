module.exports = function(grunt) {

    require('jit-grunt')(grunt);

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
    grunt.registerTask('default', ['build']);
}
