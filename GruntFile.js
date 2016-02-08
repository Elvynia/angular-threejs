module.exports = function(grunt) {

  grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
		options: {
			separator: ';',
		},
		js_all: {
			src: ['bower_components/jquery/dist/jquery.js', 'bower_components/angular/angular.js', 'bower_components/three.js/build/three.js', 'src/main/js/application.js'],
			dest: 'dist/js/angular-three.all.js',
		},
		js: {
			src: ['src/main/js/application.js'],
			dest: 'dist/js/angular-three.js',
		},
	},
	uglify: {
		options: {
			mangle: false
		},
		js_min: {
			files: {
				'dist/js/angular-three.min.js': ['src/main/js/application.js'],
			}
		}
	},
	copy: {
		html_test: {
			files: [
				{expand:true, src: ['**'], cwd: 'src/test/html', dest: 'dist/examples/'},
			]
		}
	}
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'uglify', 'copy']);
};