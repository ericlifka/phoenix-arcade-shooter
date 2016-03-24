const gulp = require('gulp');
const concat = require('gulp-concat');
const htmlbuild = require('gulp-htmlbuild');

gulp.task('default', function () {
    gulp.src([ './index.html' ])
        .pipe(htmlbuild({
            js: htmlbuild.preprocess.js(function (block) {
                block.write('phoenix-arcade-shooter.js');
                block.end();
            })
        }))
        .pipe(gulp.dest('./dist'));

    return gulp.src([ './modules.js', './src/**/*.js' ])
        .pipe(concat({ path: 'phoenix-arcade-shooter.js' }))
        .pipe(gulp.dest('./dist'));
});
