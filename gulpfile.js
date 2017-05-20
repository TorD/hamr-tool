var gulp = require('gulp'),
	run = require('gulp-run'),
	watch = require('gulp-watch'),
	plumber = require('gulp-plumber');

gulp.task('test', function() {
	return run('npm test').exec();
})
gulp.task('test-watch', function () {
	watch('./test/**/*.spec.ts')
		.pipe(plumber())
		.pipe(run('gulp test'))
})