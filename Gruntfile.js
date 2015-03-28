module.exports = function (grunt) {

    // Config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        includes: {
            build_html: {
                cwd: 'html-source',
                src: [ '*.html' ],
                dest: './',
                options: {
                    flatten: true,
                    includePath: 'html-templates'
                }
            }
        },

        concat: {
            dist: {
                src: [
                    'js/vendor/jquery-2.1.1.min.js',
                    'js/vendor/hammer.js',
                    'js/vendor/mobiscroll/mobiscroll.core.js',
                    'js/vendor/mobiscroll/mobiscroll.util.datetime.js',
                    'js/vendor/mobiscroll/mobiscroll.widget.js',
                    'js/vendor/mobiscroll/mobiscroll.scroller.js',
                    'js/vendor/mobiscroll/mobiscroll.datetime.js',
                    'js/vendor/mobiscroll/i18n/mobiscroll.i18n.no.js',
                    'js/vendor/highcharts/highcharts.js',
                    'js/plugins.js',
                    'js/main.js',
                    'js/_layout.js',
                    'js/_data.js',
                    'js/_chart.js',
                    'js/_image.js',
                    'js/_loader.js'
                ],
                dest: 'js/build/production.js'
            }
        },

        uglify: {
            build_main_js: {
                src: 'js/build/production.js',
                dest: 'js/build/production.min.js'
            },
            build_loader_js: {
                src: 'html-templates/loader.js',
                dest: 'html-templates/loader.min.js'
            }
        },

        compass: {
            scss_main: {
                options: {
                    sassDir: 'css',
                    cssDir: 'css/build',
                    imagesDir: 'gfx',
                    environment: 'production',
                    outputStyle: 'compressed',
                    noLineComments: true
                }
            },
            scss_loader: {
                options: {
                    sassDir: 'html-templates',
                    cssDir: 'html-templates',
                    environment: 'production',
                    outputStyle: 'compressed',
                    noLineComments: true
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: ['js/*.js', 'css/build/*.css', 'html-templates/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false
                }
            },
            scss_main: {
                files: ['css/*.scss'],
                tasks: ['compass'],
                options: {
                    spawn: false
                }
            },
            scss_loader: {
                files: ['html-templates/*.scss'],
                tasks: ['compass'],
                options: {
                    spawn: false
                }
            },
            html_templates: {
                files: ['html-templates/*.html'],
                tasks: ['includes'],
                options: {
                    spawn: false
                }
            }
        }

    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-includes');
    
    // What do do when running grunt
    grunt.registerTask('default', ["compass", 'concat', 'uglify', 'includes']);

};