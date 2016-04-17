"use strict";

module.exports = (grunt) => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    client: {
      src: 'public/js',
      dist: 'public/dist'
    },
    jshint: {
      files: ['Gruntfile.js', '/*.js', 'public/js/**/*.js'],
      options: {
        esversion: 6,
        globalstrict: true,
        globals: {
          jQuery: true,
          console: true,
          module: true,
          require: true,
          window: true,
          app: true,
          global: true,
          $: true,
          _: true,
          Backbone: true
        }
      }
    },
    clean: {
      client: '<%= client.dist %>'
    },
    browserify: {
      client: {
        src: '<%= client.src %>/*.js',
        dest: '<%= client.dist %>/client.js'
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      client: {
        files: {
          '<%= browserify.client.dest %>': ['<%= browserify.client.dest %>']
        }
      }
    }
  });

  // import tasks
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // default tasks
  grunt.registerTask('default', [
    'jshint',
    'clean',
    'browserify',
    'uglify'
  ]);
};
