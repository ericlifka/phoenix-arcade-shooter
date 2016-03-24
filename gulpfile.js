const gulp = require('gulp');
const concat = require('gulp-concat');
const htmlbuild = require('gulp-htmlbuild');

gulp.task('default', function () {
    gulp.src([ './index.html', './styles/game.css', './favicon.ico' ])
        .pipe(htmlbuild({
            js: htmlbuild.preprocess.js(function (block) {
                block.write('phoenix-arcade-shooter.js');
                block.end();
            }),
            css: htmlbuild.preprocess.css(function (block) {
                block.write('game.css');
                block.end();
            })
        }))
        .pipe(gulp.dest('./dist'));

    return gulp.src([ './modules.js', './src/**/*.js' ])
        .pipe(concat({ path: 'phoenix-arcade-shooter.js' }))
        .pipe(gulp.dest('./dist'));
});
