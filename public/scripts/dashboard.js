$(function(){
  moment().format();
  $('.poll-summary__deadline').each(function(){
      var deadline = $(this).children("span:first").data("deadline");
      $(this).children("span:first").text( moment(deadline).format("MM/DD/YYYY hh:mmA"));
  });
});
