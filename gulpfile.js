var gulp = require('gulp');
var scripts = require('./gulp/scripts');
var styles = require('./gulp/styles');
var _ = require('lodash');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');

gulp.task('default', ['js', 'concat-css', 'sass', 'css-sass', 'templates']);

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