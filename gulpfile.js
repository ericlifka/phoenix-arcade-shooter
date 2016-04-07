const gulp = require('gulp');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const wrapper = require('gulp-wrapper');
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

    gulp.src([
            'bower_components/simple-web-modules/index.js',
            './src/**/*.js'
        ])
        .pipe(filter(function (file) {
            return !/embedded/.test(file.path)
        }))
        .pipe(concat({ path: 'phoenix-arcade-shooter.js' }))
        .pipe(wrapper({
            header: '(function () {\n',
            footer: '}());\n'
        }))
        .pipe(gulp.dest('./dist'));

    return gulp.src([ './modules.js', './src/**/*.js' ])
        .pipe(filter(function (file) { return !/main/.test(file.path) }))
        .pipe(concat({ path: 'phoenix-arcade-shooter-embedded.js' }))
        .pipe(wrapper({
            header: '(function () {\n',
            footer: '}());\n'
        }))
        .pipe(gulp.dest('./dist'));
});
