var fs = require('fs'),
	argv = require('yargs').argv,
	os = require('os');

var runType = argv.run || '', // dev、build
	packType = argv.g || 'web';

module.exports = function (gulp, $) {
	gulp.task('tmpl', ['minjs'], function () {
	});
	
	gulp.task('dev', ['sass', 'connect', 'watch']);
	
	// gulp.task('build', ['movefiles', 'replacehtml', 'templates', 'movecss', 'json'], function () {
	// 	gulp.start('tmpl');
	// });
	gulp.task('build', ['movefiles', 'replacehtml', 'movecss', 'json'], function () {
		gulp.start('tmpl');
	});

	// gulp.task('run', ['clean'], function () {
	gulp.task('run', function () {
		switch(runType) {
			case 'build':
			case 'build-net':
				gulp.start('build');
			break;
			
			default:
				gulp.start('dev');
		}
	});

	gulp.task('tmp', ['templates']);
};