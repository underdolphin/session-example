//    Copyright 2016 underdolphin(masato sueda)
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

'use strict'
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const gulpts = require('gulp-typescript');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const mocha = require('gulp-mocha');
const cleancss = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const del = require('del');

const tsProject = gulpts.createProject('tsconfig.json', {
    typescript: require('typescript'),
    module: "commonjs"
});

const testProject = gulpts.createProject('tsconfig.json', {
    typescript: require('typescript'),
    module: "commonjs"
});

gulp.task('pug', () => {
    gulp.src('src/view/**/*.pug', {
            base: 'src'
        })
        .pipe(plumber())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('html', () => {
    gulp.src('src/view/**/*.html', {
            base: 'src'
        })
        .pipe(plumber())
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('css', () => {
    gulp.src('src/view/**/*.css', {
            base: 'src'
        })
        .pipe(plumber())
        .pipe(cleancss())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        proxy: "localhost:3000",
        open: false
    });
});

gulp.task('testCompile', () => {
    gulp.src('src/test/**/*.ts', {
            base: 'src'
        })
        .pipe(plumber())
        .pipe(testProject())
        .js
        .pipe(gulp.dest('./build/'));
});

gulp.task('tsCompile', () => {
    gulp.src(['src/index.ts', 'src/app/**/*.ts', 'src/view/**/*.ts'], {
            base: 'src'
        })
        .pipe(plumber())
        .pipe(tsProject())
        .js
        .pipe(uglify())
        .pipe(gulp.dest('./build/'));
});

gulp.task('server:uglify', () => {
    gulp.src(['./build/app/**/*.js', './build/view/**/*.js', './build/index.js'], {
            base: 'build'
        })
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'))
});

gulp.task('testify', () => {
    browserify({
            entries: ['./build/test/test.js']
        })
        .bundle()
        .pipe(plumber())
        .pipe(source('testlib.min.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./test/'))
});

gulp.task('test', () => {
    return gulp.src(['test/testlib.min.js'])
        .pipe(mocha({
            reporter: 'nyan'
        }));
})

gulp.task('watch', () => {
    gulp.watch('src/view/**/*.html', ['html', reload]);
    gulp.watch('src/view/**/*.pug', ['pug', reload]);
    gulp.watch('src/view/**/*.css', ['css', reload]);
    gulp.watch(['src/test/**/*.ts'], ['testCompile']);
    gulp.watch(['src/index.ts', 'src/app/**/*.ts', 'src/view/**/*.ts'], ['tsCompile']);
    gulp.watch(['build/index.js', 'build/view/**/*.js', 'build/app/**/*.js'], ['server:uglify']);
    gulp.watch('build/test/**/*.js', ['testify']);
    gulp.watch('test/testlib.min.js', ['test']);
});

gulp.task('default', ['browser-sync', 'testCompile', 'tsCompile', 'html', 'pug', 'css', 'server:uglify'], () => {
    gulp.start('watch');
});

gulp.task('clean', () => {
    del(['build', 'dist', 'test']);
});