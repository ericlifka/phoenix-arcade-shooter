const gulp = require('gulp');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const wrapper = require('gulp-wrapper');
const htmlbuild = require('gulp-htmlbuild');

const JsSrc = [
    'bower_components/simple-web-modules/index.js',
    'bower_components/pxlr-fonts/dist/index.js',
    'src/**/*.js'
];

function functionWrapper() {
    return wrapper({
        header: '(function () {\n',
        footer: '}());\n'
    })
}

gulp.task('static-files', function () {
    return gulp.src([ './favicon.ico', './styles/game.css' ])
        .pipe(gulp.dest('./dist'));
});

gulp.task('build-html', function () {
    return gulp.src([ './index.html' ])
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
});

gulp.task('build-js-blob', function () {
    return gulp.src(JsSrc)
        .pipe(filter(function (file) { return !/embedded/.test(file.path) }))
        .pipe(concat({ path: 'phoenix-arcade-shooter.js' }))
        .pipe(functionWrapper())
        .pipe(gulp.dest('./dist'));
});

gulp.task('build-embedded-blob', function () {
    return gulp.src(JsSrc)
        .pipe(filter(function (file) { return !/main/.test(file.path) }))
        .pipe(concat({ path: 'phoenix-arcade-shooter-embedded.js' }))
        .pipe(functionWrapper())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', [ 'static-files', 'build-html', 'build-js-blob', 'build-embedded-blob' ]);
