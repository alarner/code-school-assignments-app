var gulp = require('gulp');
var scripts = require('./gulp/scripts');
var styles = require('./gulp/styles');
var watch = require('./gulp/watch');
var _ = require('lodash');
var spawn = require('child_process').spawn;

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var server = null;
var serverRunning = false;

/*
 * BUILD TASKS
 */

gulp.task('build', ['js', 'concat-css', 'sass', 'css-sass', 'templates', 'images', 'bower_components']);

gulp.task('js', function() {
	var scriptPaths = _.map(scripts, function(script) {
		return 'assets'+script;
	});
	return gulp.src(scriptPaths)
	.pipe(concat('production.js'))
	.pipe(uglify())
	.pipe(gulp.dest('www/js'));
});

gulp.task('concat-css', function () {
	var stylePaths = _.map(styles, function(style) {
		return 'assets'+style;
	});
	return gulp.src(stylePaths)
	.pipe(concat('bundle.css'))
	.pipe(gulp.dest('www/css'));
});

gulp.task('sass', function () {
	return gulp.src('assets/styles/importer.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('www/css'));
});

gulp.task('css-sass', function () {
	return gulp.src('www/css/*.css')
	.pipe(minifyCss({compatibility: 'ie8'}))
	.pipe(concat('production.css'))
	.pipe(gulp.dest('www/css'));
});

gulp.task('templates', function () {
	return gulp.src('assets/templates/**/*.html')
	.pipe(gulp.dest('www/templates'));
});

gulp.task('images', function () {
	return gulp.src('assets/images/**/*')
	.pipe(gulp.dest('www/images'));
});

gulp.task('bower_components', function () {
	return gulp.src('assets/bower_components/**/*')
	.pipe(gulp.dest('www/bower_components'));
});

/*
 * SERVE TASKS
 */

gulp.task('serve', ['sass-watch', 'watch', 'server']);

gulp.task('sass-watch', function() {
	gulp.watch('assets/styles/**/*.scss', ['sass-dev']);
});

gulp.task('sass-dev', function() {
	return gulp.src('assets/styles/importer.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('assets/css'));
});

gulp.task('watch', function() {
	console.log('watching...', watch);
	gulp.watch(watch, ['server']);
});

gulp.task('server', function() {
	function startServer() {
		if(server && serverRunning) {
			console.log('Stopping server...');
			server.kill();
		}
		else {
			console.log('Starting server...');
			server = spawn('sails', ['lift']);
			serverRunning = true;
			server.on('close', function(code) {
				console.log('Server closed with code ['+code+']');
				serverRunning = false;
				startServer();
			});
			server.stdout.on('data', function(data) {
				console.log(data.toString());
			});
			server.stderr.on('data', function(data) {
				console.log(data.toString());
			});
		}
	}
	
	startServer();
});