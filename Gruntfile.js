module.exports = function (grunt) {

    // Config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        secret: grunt.file.readJSON('secret.json'),

        'ftp-deploy': {
            release: {
                auth: {
                    host: '<%= secret.host %>',
                    port: '<%= secret.port %>',
                    username: '<%= secret.username %>',
                    password: '<%= secret.password %>'
                },
                src: 'dist',
                dest: '<%= secret.dest %>'
            }
        },

        clean: {
            release: ['dist', 'app.manifest']
        },

        copy: {
            release: {
                files: [
                    {
                        expand: true,
                        src: [
                            'js/build/*',
                            'css/build/*',
                            'gfx/**',
                            'app.manifest',
                            'dev.html',
                            'index.html',
                            '404.html',
                            'humans.txt',
                            'robots.txt',
                            'crossdomain.xml'
                        ],
                        dest: 'dist'
                    }
                ]
            }
        },

        browserify: {
            dist: {
                files: {
                    'js/build/app.browserify.js': ['js/main.js']
                }
            }
        },

        'compile-handlebars': {
            appConfig: {
                files: [{
                    src: 'app.manifest.handlebars',
                    dest: 'app.manifest'
                }],
                templateData: {
                    changed: +new Date()
                }
            }
        },

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

        jshint: {
            options: {
                eqnull: true
            },
            all: [
                'Gruntfile.js',
                'js/*.js'
            ]
        },

        concat: {
            dist: {
                src: [
                    'bower_components/imagesloaded/imagesloaded.pkgd.js',
                    'js/vendor/ga.js',
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
                    'js/build/app.browserify.js'
                ],
                dest: 'js/build/production.js'
            }
        },

        uglify: {
            build_main_js: {
                options: {
                    sourceMap: true
                },
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
                tasks: ['jshint', 'browserify', 'concat', 'uglify'],
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
                files: ['html-templates/*.html', 'html-source/*.html'],
                tasks: ['includes'],
                options: {
                    spawn: false
                }
            }
        }

    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-compile-handlebars');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-includes');
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-browserify');
    
    // What do do when running grunt
    grunt.registerTask('default', ['compass', 'browserify', 'concat', 'uglify', 'includes']);

    // What do do when running grunt
    grunt.registerTask('release', ['default', 'clean:release', 'compile-handlebars:appConfig', 'copy:release', 'ftp-deploy']);

};