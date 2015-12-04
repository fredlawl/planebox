var gulp = require('gulp');
var eta = require('gulp-eta');

eta(gulp, {
    browserSync: {
        settings: {
            server: true
        }
    }
});