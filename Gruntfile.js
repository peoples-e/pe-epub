module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    handlebars : {
      compile : {
        options : {
          node : true
        },
            files: {
              "templates/templates.js": ['templates/container.xml', 'templates/content.opf','templates/page.html', 'templates/toc.html', 'templates/toc.ncx']
        }
      }
      
    }
  });

  grunt.loadNpmTasks('grunt-contrib-handlebars');

  // Default task(s).
  grunt.registerTask('default', ['handlebars']);

};