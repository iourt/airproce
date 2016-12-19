var fs     = require('fs'),
	argv   = require('yargs').argv,
	os     = require('os'),
	getPrj = require('./tools/build.project.js');

var runType  = argv.run || '',
	isDebug  = argv.debug || false,
	osType   = argv.type || 'mg',
	codePath = './source/',
	d        = new Date(),
	version  = d.getTime(),
	veros    = os.platform(),
	netPath  = codePath;

switch (runType) {
	case 'build':
	case 'build-net':
		netPort = argv.port || 9999;
	break;

	default:
		netPort = argv.port || 9090;
}

module.exports = function (gulp, $) {
	gulp.task('sass', function () {
		gulp.src(codePath +'themes/*.scss')
			.pipe($.plumber())
			.pipe($.sass())
			.pipe($.size({title: 'css'}))
			.pipe(gulp.dest(codePath +'themes/'));		
	});	

	gulp.task('connect', function () {
		if (runType == 'build') return;

		var url = '';

		$.connect.server({
			root: netPath,
			port: netPort,
			livereload: true
		});

		switch (veros) {
			case 'win32':
				url = 'start http://127.0.0.1:' + netPort;
			break;
			
			case 'darwin':
				url = 'open http://127.0.0.1:' + netPort;
			break;
		}

		gulp.src('')
			.pipe($.shell(url));
	});	

	gulp.task('watch', function () {
		$.livereload.listen();
	
		$.watch(codePath +'themes/**/*.scss', function () {
			return gulp.src(codePath +'themes/*.scss')
				.pipe($.plumber())
				.pipe($.sass())
				.pipe($.size({title: 'css'}))
				.pipe(gulp.dest(codePath +'themes'))
				.pipe($.livereload());
		});
	
		$.watch([
				codePath +'**/*.js',
				codePath +'**/*.html',
				codePath +'**/*.css'
			])
			.pipe($.livereload());
	});
};