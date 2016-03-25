const gulp = require('gulp');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
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
        .pipe(filter(function (file) { console.log(file.path); return !/embedded-main/.test(file.path) }))
        .pipe(concat({ path: 'phoenix-arcade-shooter.js' }))
        .pipe(gulp.dest('./dist'));
});
