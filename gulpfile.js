const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('default', function () {
    return gulp.src([ './modules.js', './src/**/*.js' ])
        .pipe(concat({ path: 'phoenix-arcade-shooter.js' }))
        .pipe(gulp.dest('./dist'));
});
