var fs     = require('fs'),
	argv   = require('yargs').argv,
	os     = require('os'),
	getPrj = require('./tools/build.project.js');

var runType  = argv.run || '',
	isDebug  = argv.debug || false,
	osType   = argv.type || 'mg',
	codePath = './source/',
	cssPath  = codePath +'themes',
	d        = new Date(),
	version  = d.getTime(),
	veros    = os.platform();

var distPath = (osType == 'mg') ? './mg/' : './jm/';

switch (runType) {
	case 'build':
	case 'build-net':
		netPort = argv.port || 9999;
		netPath = distPath;
	break;

	default:
		netPort = argv.port || 9090;
		netPath = codePath;
}

module.exports = function (gulp, $) {
	gulp.task('sass', function () {
		gulp.src(codePath +'themes/*.scss')
			.pipe($.plumber())
			.pipe($.sass())
			.pipe($.size({title: 'css'}))
			.pipe(gulp.dest(codePath +'themes/'));	

		gulp.src(codePath +'stand/themes/*.scss')
			.pipe($.plumber())
			.pipe($.sass())
			.pipe($.size({title: 'css'}))
			.pipe(gulp.dest(codePath +'stand/themes/'));		
	});

	gulp.task('clean', function () {
		if (runType !== 'build') return;

		return gulp.src([
				distPath,
				'./.tmp'
			],{read: false})
			.pipe($.rimraf({force: true}));	
	});	

	gulp.task('connect', function () {
		if (runType == 'build') return;

		var url = '';

		if (runType == 'build-net') {
			$.connect.server({
				root: netPath,
				port: netPort,
				livereload: false
			});
		} else {
			$.connect.server({
				root: netPath,
				port: netPort,
				livereload: true
			});
		}
			
		switch (veros) {
			case 'win32':
				// url = 'start http://127.0.0.1:' + netPort;
				url = 'start http://xjm-t.ajmide.com/manage';
			break;
			
			case 'darwin':
				// url = 'open http://127.0.0.1:' + netPort;
				url = 'open http://xjm-t.ajmide.com/manage';
			break;
		}

		gulp.src('')
			.pipe($.shell(url));
	});	

	gulp.task('watch', function () {
		$.livereload.listen();
	
	
		$.watch(codePath +'stand/themes/**/*.scss', function () {
			return gulp.src(codePath +'stand/themes/*.scss')
				.pipe($.plumber())
				.pipe($.sass())
				.pipe($.size({title: 'css'}))
				.pipe(gulp.dest(codePath +'stand/themes'))
				.pipe($.livereload());
		});
		
		$.watch(cssPath +'/**/*.scss', function () {
			return gulp.src(cssPath +'/*.scss')
				.pipe($.plumber())
				.pipe($.sass())
				.pipe($.size({title: 'css'}))
				.pipe(gulp.dest(cssPath))
				.pipe($.livereload());
		});
	
		$.watch([
				codePath +'**/*.js',
				codePath +'**/*.html',
				codePath +'**/*.css'
			])
			.pipe($.livereload());
	});

	gulp.task('replacehtml', function () {
		var files = [
				'../stand/library.js?v='+ version,
				'seed.js?v='+ version,
				'../stand/common.js?v='+ version,
				'index.js?v='+ version
			];

		getType(function (item, type) {
			var dir = (type == 1) ? 'jm' : 'mg';

			if (dir != osType) return;

			gulp.src(codePath + item +'/index.html')
				.pipe($.htmlReplace({
					'css': '../themes/'+ item +'.css?v='+ version,
					'js': files
				}))
				.pipe($.replace(/\<base href="" \>/g, '<base href="/'+dir+'/'+item+'/" >'))
				// .pipe($.htmlmin({collapseWhitespace: true}))
				.pipe(gulp.dest(distPath + item));
		});
	});

	gulp.task('templates', function () {
		getType(function (item, type) {
			gulp.src([
					codePath + item +'/**/*.html',
					'!'+ codePath + item +'/index.html'
				])
				.pipe($.ngHtml2js({
					moduleName: 'ajmd',
					prefix: ''
				}))
				.pipe(gulp.dest('./.tmp/'+ item));
		});
	});

	gulp.task('movefiles', function () {
		gulp.src(codePath +'stand/public/**/*')
			.pipe(gulp.dest(distPath +'stand/public'));

		gulp.src(codePath +'stand/common.js')
			.pipe(gulp.dest(distPath +'stand/'));

		gulp.src([
				codePath +'stand/themes/**/*.eot',
				codePath +'stand/themes/**/*.svg',
				codePath +'stand/themes/**/*.ttf',
				codePath +'stand/themes/**/*.woff',
				codePath +'stand/themes/**/*.jpg',
				codePath +'stand/themes/**/*.png',
				codePath +'stand/themes/**/*.gif'
			])
			.pipe(gulp.dest(distPath +'stand/themes'));
	});

	gulp.task('movecss', ['sass'], function () {
		return gulp.src([
				codePath +'**/*.css',
				'!'+ codePath +'stand/public/**/*'
			])	
			.pipe($.minifyCss())
			.pipe(gulp.dest(distPath));
	});

	gulp.task('minjs', function() {
        gulp.src([
        		codePath +'stand/config.js',
        		codePath +'stand/library.js'
        	])
            .pipe($.concat('library.js'))
    	    .pipe($.replace(/isDebugCreate=true/g, 'isDebugCreate=false'))
    	    .pipe($.replace(/isHtml5Mode=false/g, 'isHtml5Mode=true'))
            .pipe($.uglify())
            .pipe(gulp.dest(distPath +'stand/'));

		getType(function (item, type) {
			var dir = (type == 1) ? 'jm' : 'mg';

			if (dir != osType) return;

	        gulp.src([
	        		codePath +'stand/app_'+ dir +'.js',
	        		codePath + item +'/app.js'
	        	])
	            .pipe($.concat('seed.js'))
	            // .pipe($.replace(/..\/main\//g, ''))
	            // .pipe($.ngAnnotate())
	            .pipe($.uglify({mangle:false}))
	            .pipe(gulp.dest(distPath + item));

	        gulp.src([
	                './.tmp/'+ item +'/**/*.js',
	                codePath + item +'/**/*.js',
	                '!'+ codePath + item +'/app.js'
	            ])
	            .pipe($.concat('index.js'))
	            .pipe($.ngAnnotate())
	            .pipe($.uglify())
	            .pipe(gulp.dest(distPath + item));
		});
	});
	
	gulp.task('json', function () {
        return gulp.src([
                codePath +'config/**/*'
            ])
            .pipe(gulp.dest(distPath +'config/'));
	});
	
	gulp.task('inject', function () {
		getType(function (item, type) {
			inject(item, type);
		});
	});

	gulp.task('jshint', function () {
		var files = [
				codePath +'**/*.js',
				'!'+ codePath +'library/**/*',
				'!'+ codePath +'common/directives/delegate_event.js',
                '!'+ codePath +'public/**/*'
			];

		if (argv.files) files = argv.files.split(',');
			
		return gulp.src(files)
			.pipe($.jshint())
			.pipe($.jshint.reporter('default'));
	});

	function inject(prj, type) {
		var app = [];

		if (type == 1) {
			app.push(codePath +'stand/app_jm.js');
		} else {
			app.push(codePath +'stand/app_mg.js');
		}
		app.push(codePath + prj +'/app.js');

		gulp.src(codePath + prj +'/index.html')
			.pipe(
				$.inject(
					gulp.src([
						codePath +'stand/config.js',
						codePath +'stand/library.js'
					], {read: false}), {
						relative: true,
						name: 'injectframe'
					}
				)
			)
			.pipe(
				$.inject(
					gulp.src(app, {read: false}), {
						relative: true,
						name: 'injectapp'
					}
				)
			)
			.pipe(
				$.inject(
					gulp.src([
						codePath +'stand/common.js',
						codePath + prj +'/common/**/*.js'
					], {read: false}), {
						relative: true,
						name: 'injectcommon'
					}
				)
			)
			.pipe(
				$.inject(gulp.src([
						codePath +'themes/'+ prj +'.css',
						codePath + prj +'/**/*.js',
						'!'+ codePath + prj +'/app.js',
						'!'+ codePath + prj +'/common/**/*.js'
					], {read: false}), {relative: true})
			)
			.pipe(gulp.dest(codePath + prj));
	}
};

function getType(callback) {
	getPrj(function (arr) {
		arr.forEach(function (v, k) {
			fs.readFile(process.cwd() +'/source/'+ v +'/.projecttype', 'utf-8', function (err, data) {
				if (err) {
					console.log("error");
				} else {
					var res = JSON.parse(data);
					callback(v, res.type);
				}
			});
		});
	});
}