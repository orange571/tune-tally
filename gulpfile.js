var gulp = require("gulp"),
    watch = require("gulp-watch"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssImport = require('postcss-import'),
    nested = require("postcss-nested"),
    mixins = require("postcss-mixins");

gulp.task('default', function(){
  console.log("Hooray");
});

gulp.task("styles", function(){
  gulp.src("./assets/stylesheets/main.css")
      .pipe(postcss([cssImport, mixins, nested, autoprefixer]))
      .on("error", function(err){
        console.log(err.toString());
        this.emit('end');
      })
      .pipe(gulp.dest("./public/stylesheets"))
});

gulp.task("watch", function(){
  watch("./assets/stylesheets/*.css", function(){
    gulp.start("styles");
  })
})
