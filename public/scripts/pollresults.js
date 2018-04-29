$(function(){
  moment().format();
  if(moment(data.deadline).isSameOrBefore(moment())) {
    $('.ending-time').html("Poll ended <span class='bold'>" +  moment(data.deadline).fromNow() + "</span> on <span class='bold'>" + moment(data.deadline).format("MM/DD/YYYY hh:mmA") + "</span>");
  } else {
    $('.ending-time').html("Poll ends <span class='bold'>" +  moment(data.deadline).fromNow() + "</span> from now on <span class='bold'>" + moment(data.deadline).format("MM/DD/YYYY hh:mmA") + "</span>");
  }
//https://twitter.com/intent/tweet?text=Do+you+like+Kpop%3f&url=http://www.strawpoll.me/24280/r&via=strawpollme&
//https://www.facebook.com/v2.7/dialog/share?app_id=1942474786065832&href=http://www.tunetally.com&display=popup&redirect_uri=https%3A%2F%2Fmedium.com%2Fm%2Ffacebook%2Fclose

/**
https://www.facebook.com/dialog/feed?display=popup&app_id=1921920364701738&redirect_uri=http://www.tunetally.com&link=http://www.tunetally.com&name=data.title
**/
  var sharePollLink = "/" + data.pollId;
  var shareTwitterLink = "https://twitter.com/intent/tweet?text="+encodeURI(data.title)+"&url=http://www.tunetally.com/"+data.pollId;
  console.log(encodeURI(data.title));
  console.log(shareTwitterLink);
  var shareFbLink =encodeURI("https://www.facebook.com/dialog/feed?display=popup&app_id=1921920364701738&redirect_uri=http://www.tunetally.com&link=http://www.tunetally.com&name="+data.title);
  console.log(shareFbLink);
  var shareRedditLink = "https://reddit.com";
  $('.twitter-link').attr('href',shareTwitterLink);
  $('.fb-link').attr('href',shareFbLink);
  $('.reddit-link').attr('href',shareRedditLink);
  $('input.poll-link').attr("value", sharePollLink);
  $('.share-popover').popover({
    container: 'body',
    trigger: 'click',
    placement: 'top',
    html: true,
    content: function () {
        return $(this).next('.popper-content').html();
    },
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-body"></div></div>',
  });

  $("body").on("click", ".social-links a", function(e){
    e.preventDefault();
    var share_link = $(this).prop('href');
    window.open(share_link, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=200,left=200,width=600,height=400");
  });

  $('body').on("click", ".popover button.copy-poll-link", function(){
    var copyText = document.querySelector(".popover input.poll-link");
    copyText.select();
    document.execCommand("copy");
  });


  $('body').on('click', function (e) {
      $('[data-toggle="popover"]').each(function () {
          //the 'is' for buttons that trigger popups
          //the 'has' for icons within a button that triggers a popup
          if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
              $(this).popover('hide');
          }
      });
  });
});
