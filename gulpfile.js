const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const minify = require("gulp-minify");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const merge = require("merge-stream");
const del = require("del");

function styles() {
  var main = gulp
    .src("assets/styles/main.scss")
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: ["./node_modules"],
        outputStyle: "compressed",
      }).on("error", sass.logError)
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/css/"))
    .pipe(browserSync.stream());

  return merge(main);
}

function scripts() {
  var main = gulp
    .src("assets/scripts/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("dist/scripts"))
    .pipe(browserSync.stream());

  return merge(main);
}

function images() {
  var main = gulp
    .src("assets/images/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(minify())
    .pipe(gulp.dest("dist/images"))
    .pipe(browserSync.stream());

  return merge(main);
}

function clean() {
  return del(["./dist"]);
}

function watcher() {
  browserSync.init({
    server: {
      baseDir: ".",
    },
  });

  gulp.watch("assets/styles/**/*.scss", styles);
  gulp.watch("assets/scripts/**/*.js", scripts);
  gulp.watch("assets/images/**/*", images);
  gulp.watch('*.html').on('change', browserSync.reload);
}

const build = gulp.series(clean, gulp.parallel(styles, scripts, images));
const watch = gulp.series(build, gulp.parallel(watcher));

exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
