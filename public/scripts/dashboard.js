$(function(){
  moment().format();
  $('.deadline').each(function(){
      var deadline = $(this).attr("data-deadline");
      $(this).text("Ends " + moment(deadline).format("MM/DD/YYYY hh:mmA"));
  });
});
