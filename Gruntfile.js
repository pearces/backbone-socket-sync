module.exports = (grunt) => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    src: 'lib',
    jshint: {
      files: [
        'Gruntfile.js',
        'lib/*.js'
      ],
      options: {
        esversion: 6,
        globals: {
          jQuery: true,
          console: true,
          module: true,
          require: true,
          window: true,
          global: true,
          $: true,
          _: true,
          Backbone: true
        },
        strict: false
      }
    },
    clean: {
      client: ['*models*.js', '*models*.map']
    },
    browserify: {
      options: {
        transform: [['babelify', { presets: ["es2015"] }]]
      },
      client: {
        files: {
          'sync-models-client.js': '<%= src %>/client.js'
        }
      }
    },
    babel: {
      options: {
        sourceMap: false,
        presets: ['es2015'],
        plugins: [["transform-es2015-modules-commonjs"]]
      },
      commonjs: {
        files: {
          'sync-models.js': '<%= src %>/models.js'
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      client: {
        files: {
          'sync-models-client.min.js': 'sync-models-client.js'
        }
      }
    }
  });

  // import tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks('grunt-babel');

  // default tasks
  grunt.registerTask('default', [
    'jshint',
    'clean',
    'browserify',
    'babel',
    'uglify'
  ]);
};
