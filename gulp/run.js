var fs = require('fs'),
	argv = require('yargs').argv,
	os = require('os');

var runType = argv.run || '', // dev、build
	packType = argv.g || 'web';

module.exports = function (gulp, $) {
	gulp.task('dev', ['sass', 'connect', 'watch']);
	gulp.task('build', ['movefiles']);
	
	gulp.task('run', ['clean'], function () {
		switch(runType) {
			case 'build':
				gulp.start('build');
			break;
			
			default:
				gulp.start('dev');
		}
	});
};