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
    browserify: {
      client: {
        src: '<%= client.src %>/*.js',
        dest: '<%= client.dist %>/client.js'
      }
    }
  });

  // import tasks
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // default tasks
  grunt.registerTask('default', [
    'jshint',
    'browserify'
  ]);
};
