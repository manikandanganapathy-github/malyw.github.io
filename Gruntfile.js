const path = require('path');
const BabiliPlugin = require("babili-webpack-plugin");

const rootPath = path.resolve();

//const DEBUG_IS_ENABLED = Boolean(process.env.BLOG_DEBUG);// environment variable

const supportedBrowsersList = {
    // https://github.com/ai/browserslist
    'browsers': [
        'last 1 Chrome version',
        'last 1 ChromeAndroid version',
        'last 1 iOS version',
        'last 1 Edge version',
        'last 1 Firefox version'
    ]
};

module.exports = function (grunt) {
    grunt.initConfig({
        webpack: {
            dist: {
                entry: rootPath + '/_js/main/main.js',
                output: {
                    filename: 'js/main.min.js'
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            exclude: [/node_modules/],
                            loader: 'babel-loader',
                            options: {
                                // https://github.com/babel/babel-loader#options
                                cacheDirectory: true,
                                presets: [
                                    [
                                        'env', // https://github.com/babel/babel-preset-env
                                        {
                                            'targets': supportedBrowsersList,
                                            'modules': false
                                        }
                                    ],
                                    'stage-2'
                                ],
                                compact: false
                            }
                        }
                    ]
                },
                resolve: {
                    extensions: ['.js'],
                    modules: [
                        path.join(__dirname, './_js'),
                        'node_modules'
                    ]
                },
                resolveLoader: {
                    modules: [
                        path.join(__dirname, './node_modules'),
                        'node_modules'
                    ]
                },
                plugins: [
                    // https://github.com/webpack-contrib/babili-webpack-plugin
                    new BabiliPlugin()
                ],
                // https://webpack.js.org/configuration/devtool/
                devtool: 'source-map'
            }
        },

        sass: {
            critical: {
                files: [{
                    expand: true,
                    cwd: '_css',
                    src: ['critical.scss'],
                    dest: '_includes/generated',
                    ext: '.css'
                }]
            },
            nonCritical: {
                files: [{
                    expand: true,
                    cwd: '_css',
                    src: ['non-critical.scss'],
                    dest: 'css',
                    ext: '.css'
                }]
            },
            demos: {// all *.scss files in "demos" folder
                files: [{
                    expand: true,
                    cwd: 'demos',
                    src: [
                        '*/main.scss'
                    ],
                    dest: 'demos',
                    ext: '.css'
                }]
            }
        },

        postcss: {
            options: {
                processors: [
                    require('autoprefixer')(supportedBrowsersList),
                    require('cssnano')({
                        // http://cssnano.co/optimisations/
                        safe: true,
                        autoprefixer: false,
                        minifyFontValues: false,
                        mergeRules: false,
                        colormin: false
                    }),
                    require("postcss-reporter")()
                ]
            },
            critical: {
                files: [{
                    expand: true,
                    cwd: '_includes/generated',
                    src: 'critical.css',
                    dest: '_includes/generated',
                    ext: '.css'
                }]
            },
            nonCritical: {
                files: [{
                    expand: true,
                    cwd: 'css',
                    src: 'non-critical.css',
                    dest: 'css',
                    ext: '.css'
                }]
            }
        },

        shell: {
            jekyllServe: {
                command: "jekyll serve",// --profile
                options: {
                    stdin: false
                }
            },
            jekyllBuild: {
                command: "jekyll build",// --profile
                options: {
                    stdin: false
                }
            }
        },

        watch: {
            site: {
                files: ["./*.md", "./*.html", "_layouts/**/*.html", "_posts/*.md", "_includes/**/*.html"],
                tasks: ["jekyllBuild"]
            },
            js: {
                files: ["_js/main/**"],
                tasks: ["generateJs", "jekyllBuild"]
            },
            css: {
                files: ["_css/**/*.scss"],
                tasks: ["generateCss", "jekyllBuild"]
            },
            css_demos: {
                files: ["demos/**/*.scss"],
                tasks: ["generateDemosCss", "jekyllBuild"]
            }
        },

        open: {
            dist: {
                path: 'http://localhost:4000/'
            }
        }
    });

    require('jit-grunt')(grunt);

    grunt.registerTask("generateJs", [
        "webpack"
    ]);

    grunt.registerTask("generateCss", [
        "sass:critical",
        "sass:nonCritical",
        "postcss:critical",
        "postcss:nonCritical"
    ]);

    grunt.registerTask("generateDemosCss", [
        "sass:demos"
    ]);

    grunt.registerTask("serve", ["shell:jekyllServe"]);

    grunt.registerTask("jekyllBuild", [
        // Jekyll build
        "shell:jekyllBuild"
    ]);

    grunt.registerTask("build", [
        "generateJs",

        "generateCss",
        "generateDemosCss",

        "jekyllBuild"
    ]);

    grunt.registerTask("default", [
        "build",
        "open",
        "watch"
    ]);
};
