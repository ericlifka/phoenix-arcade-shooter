const gulp = require('gulp');
const concat = require('gulp-concat');
const wrapper = require('gulp-wrapper');

gulp.task('default', function () {
    return gulp.src([
            'index.js',
            'fonts/**/*.js'
        ])
        .pipe(concat({ path: 'index.js' }))
        .pipe(wrapper({
            header: '(function () {\n/* start:pxlr-fonts */\n',
            footer: '/* end:pxlr-fonts */\n}());\n'
        }))
        .pipe(gulp.dest('./dist'));
});
