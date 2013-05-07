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
              "templates/templates.js": ['templates/container.xml', 'templates/content.opf','templates/page.html', 'templates/toc.html', 'templates/toc.ncx', 'templates/com.apple.ibooks.display-options.xml']
        }
      }
    },
    jslint : {
      files : 'Peepub.js',
      directives : {
        indent : 2,
        nomen : true,
        sloppy : true,
        stupid : true,
        vars : true,
        white : true,
        node : true
      },
      options : {
        errorsOnly : true
      }
    }
  });

  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-contrib-handlebars');

  // Default task(s).
  grunt.registerTask('default', ['handlebars']);

};