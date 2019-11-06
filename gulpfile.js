const gulp = require("gulp");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create(); 
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');  
const replace = require('gulp-replace');
const useref = require('gulp-useref'); 
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
 
var paths = {
    
    styles: {
        // By using styles/**/*.sass we're telling gulp to check all folders for any sass file
        src: "app/scss/*.scss",
        // Compiled files will end up in whichever folder it's found in (partials are not compiled)
        dest: "app/css"
    },
 
    // Easily add additional paths
    htmls: {
    	src: 'app/*.html',
    	dest: 'dist/'
    },
    // Easily add additional paths
    scripts: {
    	src: 'app/js/**/*.js',
    	dest: 'app/'
    },

    // Easily add additional paths
    images: {
    	src: 'app/images/**/*.+(png|jpg|jpeg|gif|svg))',
    	dest: 'app/images'
    }

};



//html task
const html = () => {
    return gulp
        .src(paths.htmls.src)
        // Initialize sourcemaps before compilation starts
        .pipe(sourcemaps.init())
        .pipe(useref())

        // Minifies only if it's a JavaScript file
        .pipe(gulpIf('*.js', uglify()))

        // Now add/write the sourcemaps 
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.htmls.dest))
        // Add browsersync stream pipe after compilation
        .pipe(browserSync.stream());
}


//style task
const style = () => {
    return gulp
        .src(paths.styles.src)
        // Initialize sourcemaps before compilation starts
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on("error", sass.logError)
        // Use postcss with autoprefixer and compress the compiled file using cssnano
        .pipe(postcss([autoprefixer(), cssnano()]))
        // Now add/write the sourcemaps
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
        // Add browsersync stream pipe after compilation
        .pipe(browserSync.stream());
}


//image task
gulp.task('images', function(){
  return gulp.src(paths.images.src)
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest(paths.images.dest))
});


//Copy Fonts
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})

//Clean
gulp.task('clean:dist', function() {
  return del.sync('dist');
})


// A simple task to reload the page
function reload() {
	browserSync.reload();
}


// Add browsersync initialization at the start of the watch task
function watch() {
    browserSync.init({
        // You can tell browserSync to use this directory and serve it as a mini-server
        server: {
            baseDir: "./app"
        }
        // If you are already serving your website locally using something like apache
        // You can use the proxy setting to proxy that instead
        // proxy: "yourlocal.dev"
    });
    gulp.watch(paths.styles.src, style);

    //gulp.watch(paths.html.src, htmlTask);

    gulp.watch(paths.scripts.src, browserSync.reload); 

    // We should tell gulp which files to watch to trigger the reload
    // This can be html or whatever you're using to develop your website
    // Note -- you can obviously add the path to the Paths object
    //gulp.watch("src/*.html", reload); 
    gulp.watch("app/*.html").on('change', browserSync.reload);
}
 
// We don't have to expose the reload function
// It's currently only useful in other functions

    
// Don't forget to expose the task!
exports.watch = watch

// Expose the task by exporting it
// This allows you to run it from the commandline using
// $ gulp style
exports.style = style;

// Expose the task by exporting it
// This allows you to run it from the commandline using
// $ gulp html
exports.html = html;

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.parallel(style, html, watch);
 
/*
 * You can still use `gulp.task` to expose tasks
 */
//gulp.task('build', build);
 
/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);