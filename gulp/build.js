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
	distPath = './build/',
	netPath  = codePath,
	netPort  = argv.port || 9090;

module.exports = function (gulp, $) {
	gulp.task('sass', function () {
		gulp.src(codePath +'themes/*.scss')
			.pipe($.plumber())
			.pipe($.sass())
			.pipe($.autoprefixer({
	            browsers: ['last 2 versions'],
	            cascade: false
	        }))
			.pipe($.size({title: 'css'}))
			.pipe(gulp.dest(codePath +'themes/'));		
	});

	gulp.task('clean', function () {
		if (runType !== 'build') return;

		return gulp.src([distPath],{read: false})
			.pipe($.rimraf({force: true}));	
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
				.pipe($.autoprefixer({
		            browsers: ['last 2 versions'],
		            cascade: false
		        }))
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

	gulp.task('movefiles', function () {
		gulp.src(codePath +'js/**/*')
			.pipe(gulp.dest(distPath +'js'));

		gulp.src(codePath +'themes/img/**/*')
			.pipe(gulp.dest(distPath +'themes/img'));

		gulp.src(codePath +'*.html')
			.pipe(gulp.dest(distPath));

		gulp.src(codePath +'themes/*.css')
			.pipe(gulp.dest(distPath +'themes'));
	});
};