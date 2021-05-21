const {src, dest, parallel, series, watch} = require('gulp');
const browserSync   = require('browser-sync').create();
const concat        = require('gulp-concat');
const include       = require('gulp-file-include');
const htmlmin       = require('gulp-htmlmin');
const terser        = require('gulp-terser');
const uglify        = require('gulp-uglify-es').default;
const scss          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const cleanCSS      = require('gulp-clean-css');
const imagemin      = require('gulp-imagemin');
const svgstore      = require('gulp-svgstore');
const rename        = require('gulp-rename');
const cheerio       = require('gulp-cheerio');
const newer         = require('gulp-newer');
const del           = require('del');
const inject        = require('gulp-inject');
const merge         = require('merge-stream');
const media         = require('gulp-group-css-media-queries');

let minifyJS        = uglify;
let fileswatch      = 'txt,json,md,woff2';

function browsersync(){
    browserSync.init({
        server: { baseDir: 'dist/'},
        notify: false,
        online: true
    })
}

function html() {
    return src('app/*.html')
    .pipe(include({
        prefix: '@@'
    })) 
    .pipe(htmlmin({
        collapseWhitespace: true
    }))
    .pipe(dest('dist/'))
}

function scripts(){
    return src([
        'app/js/app.js',
    ])
    .pipe(concat('app.min.js'))
    .pipe(eval(minifyJS)())
    .pipe(dest('dist/js/'))
    .pipe(browserSync.stream())
}

function styles(){
    return src('app/scss/styles.scss')
    .pipe(scss())
    .pipe(media())
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({overrideBrowserslist: ['last 4 versions']}))
    .pipe(cleanCSS(
        {
            level: { 1: { specialComments: 0 } },
            //format: 'beautify'
        }
    ))
    .pipe(dest('dist/css/'))
    .pipe(browserSync.stream())
}

function images(){
    return src(['app/images/**/*', '!app/images/svg/**/*'])
    .pipe(newer('dist/images/'))
    .pipe(imagemin())
    .pipe(dest('dist/images/'))
}

function svg(){
    const svg = src('app/images/svg/*.svg')
     /*
    .pipe(newer('dist/images/svg'))
    .pipe(imagemin([
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))*/
    .pipe(cheerio({
        run: function ($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
        },
        parserOptions: {xmlMode: true}
    }))
    .pipe(svgstore({
        inlineSvg: true
    }))

    const flags = src('app/images/svg/flags/*.svg')
    .pipe(svgstore({
        inlineSvg: true
    }))

    const svgs = merge(svg, flags);

    //.pipe(rename('sprite.svg'))
    //.pipe(dest('dist/images/svg'))
    return src('app/parts/inline-svg.html')

    .pipe(inject(svgs, {transform: fileContents}))
    //.pipe(inject(flags, {transform: fileContents}))
    .pipe(dest('app/parts/'))
}

function fonts(){
    return src('app/fonts/**/*')
    .pipe(newer('dist/fonts/'))
    .pipe(dest('dist/fonts/'))
}

function data(){
    return src('app/data/**/*')
    .pipe(newer('dist/data/'))
    .pipe(dest('dist/data/'))
}

function startwatch(){
    watch('app/js/*.js', {usePolling: true}, scripts)
    watch('app/scss/**/*.scss', {usePolling: true}, styles)
    watch('app/**/*.html', {usePolling: true}, html).on('change', browserSync.reload)
    watch('app/**/*.{' + fileswatch + '}', {usePolling: true}).on('change', browserSync.reload)
    watch('app/images/**/*', {usePolling: true}, series( images, svg, html)).on('change', browserSync.reload)
}

function cleanimg() {
    return del('dist/images/**/*', {force: true})
}

function cleandist() {
    return del('dist/**/*', {force: true})
}

function fileContents (filePath, file) {
    return file.contents.toString();
}


exports.browsersync = browsersync;
exports.html        = html;
exports.scripts     = scripts;
exports.styles      = styles;
exports.svg         = svg;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.cleandist   = cleandist;

exports.build       = series(cleandist, html, styles, scripts, images, svg, fonts, data)
exports.default     = parallel(styles, scripts, images, svg, fonts, data, html, browsersync, startwatch)
//exports.default      = series(build, browserSync, startwatch)
