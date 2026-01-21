const gulp = require('gulp');
const concat = require('gulp-concat');
const wrapper = require('gulp-wrapper');

gulp.task('default', function () {
  return gulp.src([
      'index.js',
      'gl/**/*.js'
    ])
    .pipe(concat({ path: 'index.js' }))
    .pipe(wrapper({
      header: '(function () {\n/* start:pxlr-gl */\n',
      footer: '/* end:pxlr-gl */\n}());\n'
    }))
    .pipe(gulp.dest('./dist'));
});
