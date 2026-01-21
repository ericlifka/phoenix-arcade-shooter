const gulp = require('gulp');
const concat = require('gulp-concat');
const wrapper = require('gulp-wrapper');

gulp.task('default', function () {
    return gulp.src([
            'index.js',
            'core/**/*.js'
        ])
        .pipe(concat({ path: 'index.js' }))
        .pipe(wrapper({
            header: '(function () {\n/* start:pxlr-core */\n',
            footer: '/* end:pxlr-core */\n}());\n'
        }))
        .pipe(gulp.dest('./dist'));
});
