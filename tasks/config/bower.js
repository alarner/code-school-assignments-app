module.exports = function(grunt) {
  grunt.config.set('bower', {
    dev: {
        dest: '.tmp/public',
        js_dest: '.tmp/public/js',
        options: {
        	ignorePackages: ['angular-mocks']
        }
    }
  });

  grunt.loadNpmTasks('grunt-bower');

};
