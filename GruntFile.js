module.exports = function(grunt) {

  grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
		options: {
			separator: ';',
			timestamp: true,
		},
		js_dep: {
			src: ['bower_components/jquery/dist/jquery.js', 'bower_components/angular/angular.js', 'bower_components/three.js/build/three.js'],
			dest: 'dist/js/angular-three.dependencies.js',
		},
		js: {
			src: ['src/main/js/service.js', 'src/main/js/controller.js', 'src/main/js/directive.js', 'src/main/js/application.js'],
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
		},
		deploy_dev: {
			files: [
				{expand:true, src: ['examples/**', 'js/**'], cwd: 'dist/', dest: 'D:/workbenchs/apache-tomcat-8.0.26/webapps/RAMM/angular-threejs'},
			]
		},
		deploy_reactis: {
			files: [
				{expand:true, src: ['examples/**', 'js/**'], cwd: 'dist/', dest: 'C:/workspaces/SWAG/.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/RAMM/angular-threejs'},
			]
		}
	},
	watch: {
		options: {
			interrupt : true,
			debounceDelay: 250,
		},
		reactis: {
			files : 'src/**',
			tasks : ['concat:js', 'uglify:js_min', 'copy:html_test', 'copy:deploy_reactis'],
		},
		dev: {
			files: 'src/**',
			tasks: ['concat:js', 'uglify:js_min', 'copy:html_test', 'copy:deploy_dev'],
		},
	},
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'uglify', 'copy:html_test']);
  grunt.registerTask('dev', ['concat', 'uglify', 'copy:html_test', 'copy:deploy_dev']);
  grunt.registerTask('reactis', ['concat', 'uglify', 'copy:html_test', 'copy:deploy_reactis']);  grunt.registerTask('dev', ['concat', 'uglify', 'copy:html_test', 'copy:delpoy_dev']);
  grunt.registerTask('watch_reactis', ['watch:reactis']);
  grunt.registerTask('watch_dev', ['watch:dev']);
};